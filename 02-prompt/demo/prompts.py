"""02 的小專案：同一個考題，五種寫法的 prompt（P0～P4），以及呼叫 AI 的共用函式。

只用 Python 標準函式庫；透過本機已登入的 claude CLI 呼叫，不需要 API key。
"""
import json
import subprocess

MODEL = "claude-haiku-5-5"   # 寫完整版本；只寫 "haiku" 的話，換了新版結果就會跟著變

# 和投影片一樣：照五個欄位組裝，漏寫的會被列出來
FIELDS = ["任務", "需求", "限制", "範例", "驗收"]

TASK = "寫一個 Python 函式，驗證轉帳請求。"

REQUIREMENTS = """\
- 檔名 transfer.py，函式 validate_transfer(from_account, to_account, amount, balance)，驗證通過時回傳 None
- 轉出帳號或轉入帳號是空白 → 欄位驗證錯誤，要指出是哪個欄位（from_account 或 to_account）
- 金額小於或等於 0 → 欄位驗證錯誤，欄位是 amount
- 轉出、轉入帳號相同 → 業務錯誤，錯誤碼 T00001
- 金額大於餘額 → 業務錯誤，錯誤碼 T00002
- 錯誤一律使用公司的錯誤類別"""

CONSTRAINTS = """\
- 公司的錯誤類別在 company_errors 模組：ValidationError、BusinessError，不可以自己定義錯誤類別
- 只能使用 Python 標準函式庫
- 只回傳 transfer.py 的完整程式碼，放在一個 ```python 區塊裡"""

EXAMPLES = """\
公司現有程式的寫法：
from company_errors import BusinessError, ValidationError
raise ValidationError("email")     # 參數只有一個：欄位名稱
raise BusinessError("A00003")      # 參數只有一個：錯誤碼"""

ACCEPTANCE = """\
- 完成後會用 7 個自動測試檢查：正常請求、轉出帳號空白、轉入帳號空白、金額 ≤ 0、帳號相同、餘額不足、金額剛好等於餘額
- 完成前請自我檢查：前端可能漏傳欄位（值是 None），這時也要拋出 ValidationError，不能讓程式當掉"""

LADDER = {
    "P0": {"任務": TASK},
    "P1": {"任務": TASK, "需求": REQUIREMENTS},
    "P2": {"任務": TASK, "需求": REQUIREMENTS, "限制": CONSTRAINTS},
    "P3": {"任務": TASK, "需求": REQUIREMENTS, "限制": CONSTRAINTS, "範例": EXAMPLES},
    "P4": {"任務": TASK, "需求": REQUIREMENTS, "限制": CONSTRAINTS, "範例": EXAMPLES, "驗收": ACCEPTANCE},
}


def build_prompt(spec: dict) -> str:
    """照五個欄位的順序組裝，每個欄位用標籤包起來。"""
    return "\n".join(f"<{f}>\n{spec[f]}\n</{f}>" for f in FIELDS if spec.get(f))


# 隔離設定：不讀設定檔、MCP、記憶，System 換成一句話；也不給工具，AI 只能看到 prompt
ISOLATED = ["--strict-mcp-config", "--setting-sources", "", "--disable-slash-commands",
            "--settings", '{"autoMemoryEnabled": false}', "--tools", "",
            "--no-session-persistence",
            "--system-prompt", "你是一位資深工程師，請用繁體中文回答。"]


def ask(prompt: str) -> tuple[str, float]:
    """送出 prompt，回傳（AI 的回答, 花費美元）。"""
    cmd = ["claude", "-p", prompt, "--model", MODEL, "--output-format", "json", *ISOLATED]
    out = subprocess.run(cmd, capture_output=True, text=True, timeout=300).stdout
    data = json.loads(out)
    return data.get("result", ""), data.get("total_cost_usd", 0.0)
