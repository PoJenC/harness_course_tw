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
