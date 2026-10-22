"""01 的智能體迴圈（agent loop），以及兩種評分方式。

AI 本身不會讀檔。它每一輪只回一個 JSON，說它想做什麼；
真正去列檔案、搜尋、讀檔的，是這裡的 Python 程式。

工具結果和錯誤，都用文字接回對話，讓 AI 自己決定下一步。
"""
import json
import re
import time
from pathlib import Path

from llm import ask

NOTICES = Path(__file__).parent / "notices"
MAX_STEPS = 6

SYSTEM = """你是社區的服務助理，要根據社區公告回答住戶的問題，請用繁體中文。
你看不到公告，但可以請我幫你執行工具。每一輪只能回覆一個 JSON，不要有其他文字：
- {"tool": "list_files"}　列出所有公告的檔名
- {"tool": "grep", "text": "關鍵字"}　在所有公告裡找包含這個關鍵字的行，回傳 檔名:行號: 那一行
- {"tool": "read_file", "path": "檔名"}　讀一份公告，每行前面有行號
- {"answer": "你的答案"}　資料夠了就作答
不要猜，答案必須來自你讀到的公告。"""

EVIDENCE_RULE = "答案最後請加上「證據」，每行一條，格式：檔名:行號: 那一行的原文"
QUESTION = ("我家有一張舊沙發要丟，要怎麼處理？請告訴我：什麼時候清運、最晚什麼時候登記、"
            "找誰登記和怎麼聯絡、要多少錢、當天要放在哪裡。")

# 標準答案：拆成 5 個重點，每個重點用一個規則檢查答案裡有沒有提到（只有評分用，AI 和迴圈都看不到）
FACTS = {
    "每月第二個星期六清運": r"第(二|2)個?(星期|週|禮拜)六",
    "清運日前一週的星期三前登記": r"(星期|週|禮拜)三",
    "找管理室，撥分機 9": r"分機\s*9",
    "每件 300 元": r"300\s*元",
    "當天 9:00 前放到 B1 卸貨區": r"卸貨區",
}

# ── 工具：真正動手的是這些函式 ─────────────────────────────────────────
def list_files() -> str:
    return "\n".join(p.name for p in sorted(NOTICES.glob("*.txt")))


def grep(text: str) -> str:
    hits = [f"{p.name}:{i}: {line}"
            for p in sorted(NOTICES.glob("*.txt"))
            for i, line in enumerate(p.read_text(encoding="utf-8").splitlines(), 1) if text in line]
    return "\n".join(hits) or f"沒有任何一行包含「{text}」"


def read_file(path: str) -> str:
    lines = (NOTICES / Path(path).name).read_text(encoding="utf-8").splitlines()
    return "\n".join(f"{i}: {line}" for i, line in enumerate(lines, 1))


def run_tool(action: dict) -> str:
    tool = action.get("tool")
    try:
        if tool == "list_files":
            return list_files()
        if tool == "grep":
            return grep(action.get("text", ""))
        if tool == "read_file":
            return read_file(action.get("path", ""))
        return f"沒有「{tool}」這個工具，只能用 list_files、grep、read_file"
    except FileNotFoundError:
        return f"沒有「{action.get('path')}」這個檔案。所有檔名：\n{list_files()}"


def parse(reply: str) -> dict | None:
    start = reply.find("{")
    try:
        return json.JSONDecoder().raw_decode(reply[start:])[0] if start >= 0 else None
    except json.JSONDecodeError:
        return None


# ── 迴圈 ─────────────────────────────────────────────────────────────
def run_agent(question: str, *, system: str = SYSTEM, model: str | None = None, log: Path | None = None) -> dict:
    """問 AI → 執行它要的工具 → 把結果接回去 → 再問，直到它作答或步數用完。"""
    started = time.time()
    history = [f"[Human]\n{question}"]
    cost, answer = 0.0, None
    for step in range(1, MAX_STEPS + 1):
        r = ask("\n\n".join(history), system=system, **({"model": model} if model else {}))
        cost += r["usd"]
        history.append(f"[AI]\n{r['text']}")
        action = parse(r["text"])
        if action and "answer" in action:
            answer = str(action["answer"])
            break
        if action is None:
            result = "看不懂你的回覆，請只回一個 JSON，例如 {\"tool\": \"list_files\"}"
        else:
            result = run_tool(action)
        history.append(f"[工具結果]\n{result}")
    if log:
        log.write_text("\n\n".join([f"[System]\n{system}", *history]), encoding="utf-8")
    return {"answer": answer, "steps": step, "cost": cost, "sec": time.time() - started}


# ── 評分 ①：對答案（需要標準答案）────────────────────────────────────
def grade(answer: str | None) -> list[str]:
    """回傳答案裡沒提到的重點。"""
    return [name for name, pattern in FACTS.items() if not re.search(pattern, answer or "")]


# ── 評分 ②：查證據（不需要標準答案）──────────────────────────────────
EVIDENCE = re.compile(r"([^\s:：`]+\.txt)\s*[:：]\s*(\d+)\s*[:：]\s*(.+)")


def check_evidence(answer: str | None) -> list[tuple[str, bool, str]]:
    """找出每一條「檔名:行號: 原文」，打開那個檔案、看那一行，核對是不是真的這樣寫。"""
    results = []
    for m in EVIDENCE.finditer(answer or ""):
        name, line, quote = Path(m.group(1)).name, int(m.group(2)), m.group(3).strip(" `「」")
        path = NOTICES / name
        if not path.is_file():
            results.append((m.group(0), False, "沒有這個檔案"))
            continue
        lines = path.read_text(encoding="utf-8").splitlines()
        actual = lines[line - 1].strip() if 1 <= line <= len(lines) else ""
        ok = bool(quote) and (quote in actual or (len(actual) >= 6 and actual in quote))
        results.append((m.group(0), ok, "核對成功" if ok else f"第 {line} 行實際是：{actual or '（沒有這一行）'}"))
    return results


def score(answer: str | None) -> str:
    ev = check_evidence(answer)
    return f"答案 {len(FACTS) - len(grade(answer))}/{len(FACTS)}  證據 {sum(ok for _, ok, _ in ev)}/{len(ev)}"
