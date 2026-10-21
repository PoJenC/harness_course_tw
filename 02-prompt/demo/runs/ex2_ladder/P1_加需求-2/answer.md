以下是 `transfer.py` 的實作。需求提到「公司的錯誤類別」，但我不知道貴公司現有的類別名稱與路徑，所以在檔案開頭放了暫時的 `FieldValidationError` 與 `BusinessError`。請把它們換成公司既有的類別，並修改 import。

```python
# transfer.py


# ---- 公司錯誤類別（暫代）----
# 請改為從公司既有的錯誤模組匯入，例如：
# from company.errors import FieldValidationError, BusinessError
class FieldValidationError(Exception):
    """欄位驗證錯誤"""

    def __init__(self, field: str, message: str):
        self.field = field
        self.message = message
        super().__init__(f"{field}: {message}")


class BusinessError(Exception):
    """業務錯誤"""

    def __init__(self, code: str, message: str):
        self.code = code
        self.message = message
        super().__init__(f"[{code}] {message}")


# ---- 驗證函式 ----
def _is_blank(value) -> bool:
    """None 或僅含空白字元的字串視為空白。"""
    return value is None or (isinstance(value, str) and value.strip() == "")


def validate_transfer(from_account, to_account, amount, balance) -> None:
    """
    驗證轉帳請求。驗證通過時回傳 None；否則拋出例外。

    Raises:
        FieldValidationError: 轉出／轉入帳號為空白，或金額小於等於 0。
        BusinessError:
            T00001 - 轉出與轉入帳號相同。
            T00002 - 轉帳金額大於餘額。
    """
    # 1. 欄位驗證：帳號不可為空白
    if _is_blank(from_account):
        raise FieldValidationError("from_account", "轉出帳號不可為空白")
    if _is_blank(to_account):
        raise FieldValidationError("to_account", "轉入帳號不可為空白")

    # 2. 欄位驗證：金額必須大於 0
    if amount <= 0:
        raise FieldValidationError("amount", "轉帳金額必須大於 0")

    # 3. 業務驗證：轉出與轉入帳號不可相同
    if from_account == to_account:
        raise BusinessError("T00001", "轉出與轉入帳號不可相同")

    # 4. 業務驗證：金額不可大於餘額
    if amount > balance:
        raise BusinessError("T00002", "轉帳金額超過餘額")

    return None
```

**說明：**
- 驗證順序為：欄位驗證 → 業務驗證。空白帳號會先於金額檢查被擋下。
- 「空白」包含 `None` 以及只有空白字元的字串（例如 `"   "`）。
- 轉出與轉入帳號比較前沒有做去除空白，`"A1"` 與 `"A1 "` 會被視為不同帳號。如果貴公司的帳號格式需要正規化，請在呼叫前處理。
- 若 `amount` 可能是 `None` 或非數字型別，`amount <= 0` 會拋出 `TypeError`。目前需求未提及，因此沒有另外處理。

請提供公司錯誤類別的實際模組路徑與建構方式，我可以幫您把暫代類別替換掉。