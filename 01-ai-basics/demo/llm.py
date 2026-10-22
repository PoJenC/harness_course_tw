"""01 的共用函式：用程式呼叫 AI。

只用 Python 標準函式庫；透過本機已登入的 claude CLI 呼叫，不需要 API key。

執行：python3 llm.py   （1 次 haiku，就是投影片「一行指令就能呼叫」那一頁）
"""
import json
import subprocess
import time

MODEL = "claude-haiku-5-5"   # 寫完整版本；只寫 "haiku" 的話，換了新版結果就會跟著變

# 隔離設定：不讀設定檔、MCP、記憶，也不給工具，AI 只看得到我們送的文字
ISOLATED = ["--strict-mcp-config", "--setting-sources", "", "--disable-slash-commands",
            "--settings", '{"autoMemoryEnabled": false}', "--tools", ""]

PLAIN_SYSTEM = "你是樂於助人的助理，請用繁體中文回答。"


def ask(prompt: str, *, model: str = MODEL, system: str | None = PLAIN_SYSTEM,
        isolated: bool = True, persist: bool = False, resume: str | None = None) -> dict:
    """送出一段文字，回傳 AI 的回答和「帳單」。

    system   取代預設的 System；None 表示用 CLI 自己的
    isolated False 就是平常打 claude -p 的樣子（讀設定檔、有工具）
    persist  保留這次對話，之後才能 resume
    resume   接續某個對話（CLI 會把那段對話重送一次）
    """
    cmd = ["claude", "-p", prompt, "--model", model, "--output-format", "json"]
    if isolated:
        cmd += ISOLATED
    if system is not None:
        cmd += ["--system-prompt", system]
    if resume:
        cmd += ["--resume", resume]
    elif not persist:
        cmd += ["--no-session-persistence"]

    started = time.time()
    proc = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
    data = json.loads(proc.stdout)
    usage = data.get("usage", {})
    tokens_in = (usage.get("input_tokens", 0) + usage.get("cache_read_input_tokens", 0)
                 + usage.get("cache_creation_input_tokens", 0))
    return {"text": data.get("result", "").strip(), "session": data.get("session_id", ""),
            "in": tokens_in, "out": usage.get("output_tokens", 0),
            "usd": data.get("total_cost_usd", 0.0), "sec": time.time() - started}


def bill(r: dict) -> str:
    return f"in={r['in']}  out={r['out']}  ${r['usd']:.4f}  {r['sec']:.1f}s"


if __name__ == "__main__":
    r = ask("用一句話介紹你自己")
    print(r["text"])
    print(bill(r))
