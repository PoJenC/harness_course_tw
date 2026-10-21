# transfer.py
from company_errors import FieldValidationError, BusinessError  # TODO: 換成公司實際的錯誤類別

SAME_ACCOUNT_ERROR_CODE = "T00001"
INSUFFICIENT_BALANCE_ERROR_CODE = "T00002"


def _is_blank(value) -> bool:
    """None、空字串或只有空白字元都視為空白。"""
    return value is None or str(value).strip() == ""


def validate_transfer(from_account, to_account, amount, balance) -> None:
    """驗證轉帳請求，通過時回傳 None；否則拋出公司的錯誤類別。

    欄位驗證錯誤：FieldValidationError（指出欄位名稱）
    業務錯誤：BusinessError（附錯誤碼）
    """
    # 1. 欄位驗證
    if _is_blank(from_account):
        raise FieldValidationError(field="from_account", message="轉出帳號不可為空白")

    if _is_blank(to_account):
        raise FieldValidationError(field="to_account", message="轉入帳號不可為空白")

    if amount <= 0:
        raise FieldValidationError(field="amount", message="金額必須大於 0")

    # 2. 業務驗證
    if from_account == to_account:
        raise BusinessError(code=SAME_ACCOUNT_ERROR_CODE, message="轉出與轉入帳號不可相同")

    if amount > balance:
        raise BusinessError(code=INSUFFICIENT_BALANCE_ERROR_CODE, message="餘額不足")

    return None
