"""自己建 Context：同一個任務，桌上放不同的資料，AI 的回信有什麼不同？

執行：python3 03-context/demo/context_demo.py [每種桌面的次數，預設 3]（共 6×N 次 haiku，約 2 分鐘）
     python3 03-context/demo/context_demo.py --show ⑥（只印出 ⑥ 實際送出的 prompt，不呼叫 AI）
不需要 API key，透過本機已登入的 claude CLI 呼叫。每封回信都存在 runs/context_demo/，可以打開來看。
"""
import json
import shutil
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).parent
DOCS = HERE / "docs"
RUNS = HERE / "runs" / "context_demo"
MODEL = "claude-haiku-5-5"   # 寫完整版本；只寫 "haiku" 的話，換了新版結果就會跟著變
TIMES = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else 3

TASK = "請以客服身分回覆王先生，說明訂單為什麼延遲、什麼時候出貨、我們提供什麼補償。用繁體中文，100 字以內。"
NO_QUESTIONS = "不要反問，直接寫出回信。"

# 隔離設定（同 02）：不讀設定檔、MCP、記憶，也不給工具，AI 只能看到我們給的資料
ISOLATED = ["--strict-mcp-config", "--setting-sources", "", "--disable-slash-commands",
            "--settings", '{"autoMemoryEnabled": false}', "--tools", "",
            "--no-session-persistence", "--system-prompt", "你是一位客服人員，請用繁體中文回答。"]


def ask(prompt: str) -> tuple[str, float]:
    """送出 prompt，回傳（AI 的回答, 花費美元）。"""
    cmd = ["claude", "-p", prompt, "--model", MODEL, "--output-format", "json", *ISOLATED]
    data = json.loads(subprocess.run(cmd, capture_output=True, text=True, timeout=300).stdout)
    return data.get("result", "").strip(), data.get("total_cost_usd", 0.0)


def build_context(files: list[Path]) -> str:
    """把挑好的檔案讀進來，每份用標籤包起來，組成 AI 的「工作桌」。"""
    parts = []
    for path in files:
        text = path.read_text(encoding="utf-8").strip()
        parts.append(f'<資料 名稱="{path.name}">\n{text}\n</資料>')
    return "\n\n".join(parts)


def check(reply: str) -> dict:
    """同一把尺：公司要求這封信做到的 4 件事。"""
    return {
        "出貨日 4/17": any(s in reply for s in ["4/17", "4 月 17", "4月17"]),
        "給免運券": "免運券" in reply,
        "沒給購物金": "購物金" not in reply,
        "留客服專線": "0800-000-000" in reply,
    }


def docs(*names: str) -> list[Path]:
    return [DOCS / n for n in names]


BASIC = ("customer_email.txt", "order_A1024.txt")
CASES = {
    "①": ("什麼都不給", [], TASK),
    "②": ("什麼都不給＋不准反問", [], f"{TASK}{NO_QUESTIONS}"),
    "③": ("拿錯資料（舊範本）", docs(*BASIC, "reply_template_2019.txt"), TASK),
    "④": ("新舊都給，但沒標清楚", docs(*BASIC) + sorted((HERE / "docs_unlabeled").glob("*.txt")), TASK),
    "⑤": ("全部丟進去", sorted(DOCS.glob("*.txt")), TASK),
    "⑥": ("挑對的 4 份", docs(*BASIC, "reply_template_2025.txt", "logistics_notice.txt"), TASK),
}


def build_prompt(files: list[Path], task: str) -> str:
    context = build_context(files)
    return f"{context}\n\n{task}" if context else task


if "--show" in sys.argv:
    key = sys.argv[-1]
    _, files, task = CASES[key]
    print(build_prompt(files, task))
    sys.exit()

shutil.rmtree(RUNS, ignore_errors=True)
print(f"模型 {MODEL}，每種桌面 {TIMES} 次；打分：{'、'.join(check(''))}\n")
summary = []
for key, (label, files, task) in CASES.items():
    prompt = build_prompt(files, task)
    scores, cost_sum = [], 0.0
    for i in range(1, TIMES + 1):
        reply, cost = ask(prompt)
        result = check(reply)
        scores.append(sum(result.values()))
        cost_sum += cost
        out = RUNS / f"{key}_{label}-{i}.txt"
        out.parent.mkdir(parents=True, exist_ok=True)
        marks = "  ".join(f"{'✅' if ok else '❌'}{name}" for name, ok in result.items())
        out.write_text(f"{marks}\n\n{reply}\n", encoding="utf-8")
        print(f"=== {key} {label} 第 {i} 次：{len(files)} 份資料，{len(prompt)} 字，{sum(result.values())}/4 ===")
        print(f"{marks}\n{reply}\n")
    summary.append((key, label, len(files), len(prompt), scores, cost_sum / TIMES))

print(f"\n{'桌面':<16}{'資料':<5}{'字數':<6}{'各次分數':<12}平均花費")
for key, label, n, size, scores, avg in summary:
    print(f"{key} {label:<14}{n:<5}{size:<6}{', '.join(map(str, scores)):<12}${avg:.4f}")
