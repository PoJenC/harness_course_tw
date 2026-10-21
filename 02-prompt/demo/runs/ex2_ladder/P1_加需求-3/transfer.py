# transfer.py
from company.errors import FieldValidationError, BusinessError  # 請依實際模組路徑調整


def _is_blank(value) -> bool:
    """帳號為 None 或只包含空白字元時視為空白。"""
    return value is None or str(value).strip() == ""


def validate_transfer(from_account, to_account, amount, balance) -> None:
    """驗證轉帳請求，通過時回傳 None，否則拋出公司錯誤類別。

    欄位驗證錯誤：FieldValidationError
    業務錯誤：BusinessError（錯誤碼 T00001 / T00002）
    """
    # 1. 欄位驗證
    if _is_blank(from_account):
        raise FieldValidationError("from_account", "轉出帳號不可為空白")
    if _is_blank(to_account):
        raise FieldValidationError("to_account", "轉入帳號不可為空白")
    if amount <= 0:
        raise FieldValidationError("amount", "轉帳金額必須大於 0")

    # 2. 業務驗證
    if str(from_account).strip() == str(to_account).strip():
        raise BusinessError("T00001", "轉出與轉入帳號不可相同")
    if amount > balance:
        raise BusinessError("T00002", "轉帳金額不可大於餘額")

    return None
