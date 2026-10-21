```python
from company_errors import ValidationError, BusinessError


def _is_blank(value):
    """判斷帳號是否為空白（None 或只含空白字元）。"""
    return value is None or str(value).strip() == ""


def validate_transfer(from_account, to_account, amount, balance):
    """
    驗證轉帳請求。驗證通過回傳 None，否則拋出例外。

    欄位驗證錯誤（ValidationError）：
        - from_account 為空白
        - to_account 為空白
        - amount 小於或等於 0

    業務錯誤（BusinessError）：
        - T00001：轉出與轉入帳號相同
        - T00002：金額大於餘額
    """
    # 欄位驗證
    if _is_blank(from_account):
        raise ValidationError(field="from_account", message="轉出帳號不可為空白")

    if _is_blank(to_account):
        raise ValidationError(field="to_account", message="轉入帳號不可為空白")

    if amount <= 0:
        raise ValidationError(field="amount", message="金額必須大於 0")

    # 業務規則驗證
    if str(from_account).strip() == str(to_account).strip():
        raise BusinessError(code="T00001", message="轉出與轉入帳號不可相同")

    if amount > balance:
        raise BusinessError(code="T00002", message="轉帳金額不可大於餘額")

    return None
```