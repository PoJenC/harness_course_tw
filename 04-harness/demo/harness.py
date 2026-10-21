"""04 的迷你 harness：AI 外面的一切。

Harness 管四件事，這個檔案每件都只用幾十行做出來：
  🧰 工具：AI 只能按這幾個按鈕（TOOLS）
  🔒 權限：每個按鈕先檢查能不能做（check_read、check_write）
  📦 沙箱：跑測試放在 podman 容器裡，不能上網、不能改檔（run_tests）
  📜 紀錄：每一步都寫進 log.txt（Log）

AI 每一輪只能回一個 JSON，例如 {"tool": "read_file", "path": "shop/discount.py"}，
harness 照著執行，把結果接回對話，再問下一輪（01 的 agent loop）。
"""
import json
import shutil
import subprocess
import tempfile
from pathlib import Path

HERE = Path(__file__).parent
HIDDEN_TESTS = HERE / "hidden_tests"
MODEL = "claude-haiku-5-5"   # 寫完整版本；只寫 "haiku" 的話，換了新版結果就會跟著變
MAX_STEPS = 12
MAX_FAIL_LINES = 20     # 測試結果最多給 AI 幾行重點
FALLBACK_CHARS = 800    # 挑不到重點時（例如沙箱沒啟動），改給原始輸出的最後幾個字

# ── 🧰 工具：給 AI 看的說明書（每一關給的按鈕不同）──────────────────────
TOOLS = {
    "list_files": '{"tool": "list_files"}　列出專案裡的所有檔案',
    "read_file": '{"tool": "read_file", "path": "檔名"}　讀一個檔案',
    "write_file": '{"tool": "write_file", "path": "檔名", "content": "完整內容"}　整個檔案覆寫',
    "run_tests": '{"tool": "run_tests"}　在沙箱裡跑講師的驗收測試，回傳結果重點',
    "done": '{"tool": "done", "summary": "你做了什麼"}　完成任務',
}


def system_prompt(tools: list[str]) -> str:
    lines = "\n".join(f"- {TOOLS[t]}" for t in tools)
    return ("你是一位工程師，在一個 Python 專案資料夾裡工作，請用繁體中文。\n"
            "每一輪只能回覆一個 JSON，不要有其他文字。你能用的工具：\n" + lines)


# ── 📜 紀錄 ─────────────────────────────────────────────────────────────
class Log:
    def __init__(self, path: Path):
        self.path = path
        path.write_text("", encoding="utf-8")

    def write(self, who: str, text: str):
        with self.path.open("a", encoding="utf-8") as f:
            f.write(f"[{who}]\n{text}\n\n")


# ── 🔒 權限：寫成程式，不是寫在 prompt 裡拜託 ─────────────────────────────
def check_read(work: Path, path: str) -> Path:
    target = (work / path).resolve()
    if not target.is_relative_to(work.resolve()):
        raise PermissionError(f"❌ 權限拒絕：只能讀專案資料夾裡的檔案（{path}）")
    return target


def check_write(work: Path, path: str) -> Path:
    target = (work / path).resolve()
    if not target.is_relative_to((work / "shop").resolve()):
        raise PermissionError(f"❌ 權限拒絕：只能寫入 shop/ 資料夾（{path}）")
    return target


# ── 📦 沙箱：只做一件事的按鈕 ─────────────────────────────────────────────
def in_sandbox(work: Path, script: str) -> str:
    """把專案和講師的測試複製到暫存資料夾，在不能上網、唯讀的容器裡執行。"""
    with tempfile.TemporaryDirectory() as tmp:
        shutil.copytree(work, tmp, dirs_exist_ok=True)
        for f in HIDDEN_TESTS.glob("*.py"):                 # 每次都重新放進去，AI 改不到
            shutil.copy(f, tmp)
        cmd = ["podman", "run", "--rm", "--network", "none", "-v", f"{tmp}:/work:ro",
               "-w", "/work", "python:3.12-slim", "python", "-B", script]
        try:
            r = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
            return r.stdout + r.stderr
        except subprocess.TimeoutExpired:
            return "⏰ 超過 60 秒，強制停止"


def summarize(output: str) -> str:
    """測試紀錄可能很長，只留下結果和失敗原因。

    工具結果會進 context，之後每一輪都會重送，所以一定要有上限。
    """
    keep = [line for line in output.splitlines()
            if line.startswith(("FAIL:", "ERROR:", "Ran ", "OK", "FAILED"))
            or "Error:" in line]
    return "\n".join(keep[-MAX_FAIL_LINES:]) or output[-FALLBACK_CHARS:]


def run_tests(work: Path) -> str:
    return summarize(in_sandbox(work, "test_discount.py"))


def grade(work: Path) -> dict:
    out = in_sandbox(work, "grade.py").strip().splitlines()
    try:
        return json.loads(out[-1])
    except (IndexError, json.JSONDecodeError):
        return {"passed": 0, "total": 7, "runtime_ok": False}


# ── 執行一個工具（先過權限，再動手）──────────────────────────────────────
def call_tool(work: Path, action: dict, tools: list[str]) -> str:
    name = action.get("tool")
    if name not in tools:
        return f"❌ 沒有這個工具：{name}。你能用的是 {', '.join(tools)}"
    try:
        if name == "list_files":
            return "\n".join(str(p.relative_to(work)) for p in sorted(work.rglob("*")) if p.is_file())
        if name == "read_file":
            return check_read(work, action["path"]).read_text(encoding="utf-8")
        if name == "write_file":
            target = check_write(work, action["path"])
            target.write_text(action["content"], encoding="utf-8")
            return f"✅ 已寫入 {action['path']}"
        if name == "run_tests":
            return run_tests(work)
    except PermissionError as e:
        return str(e)
    except (KeyError, FileNotFoundError, IsADirectoryError) as e:
        return f"❌ {type(e).__name__}: {e}"
    return ""


# ── AI 和 agent loop ───────────────────────────────────────────────────
ISOLATED = ["--strict-mcp-config", "--setting-sources", "", "--disable-slash-commands",
            "--settings", '{"autoMemoryEnabled": false}', "--tools", "",
            "--no-session-persistence"]


def ask(system: str, prompt: str) -> tuple[str, float]:
    cmd = ["claude", "-p", prompt, "--model", MODEL, "--output-format", "json",
           "--system-prompt", system, *ISOLATED]
    data = json.loads(subprocess.run(cmd, capture_output=True, text=True, timeout=300).stdout)
    return data.get("result", "").strip(), data.get("total_cost_usd", 0.0)


def parse_action(reply: str) -> dict | None:
    """從回覆裡取出第一個 JSON 物件。"""
    start = reply.find("{")
    try:
        return json.JSONDecoder().raw_decode(reply[start:])[0] if start >= 0 else None
    except json.JSONDecodeError:
        return None


def agent(task: str, work: Path, tools: list[str], log: Log, system: str | None = None) -> dict:
    """01 的 agent loop：問 AI → 執行它要的工具 → 把結果接回去 → 再問。"""
    system = system or system_prompt(tools)
    log.write("System", system)
    history = [f"[Human]\n{task}"]
    log.write("Human", task)
    stats = {"steps": 0, "blocked": 0, "cost": 0.0, "tests_run": 0}
    for _ in range(MAX_STEPS):
        reply, cost = ask(system, "\n\n".join(history))
        stats["steps"] += 1
        stats["cost"] += cost
        history.append(f"[AI]\n{reply}")
        log.write("AI", reply)
        action = parse_action(reply)
        if action is None:
            result = "❌ 看不懂你的回覆，請只回一個 JSON"
        elif action.get("tool") == "done":
            break
        else:
            result = call_tool(work, action, tools)
            stats["blocked"] += result.startswith("❌ 權限拒絕")
            stats["tests_run"] += action.get("tool") == "run_tests"
        history.append(f"[工具結果]\n{result}")
        log.write("工具結果", result)
    return stats
