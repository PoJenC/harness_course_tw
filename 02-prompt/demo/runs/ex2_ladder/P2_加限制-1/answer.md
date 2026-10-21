```python
from company_errors import ValidationError, BusinessError


def _is_blank(value):
    return value is None or (isinstance(value, str) and value.strip() == "")


def validate_transfer(from_account, to_account, amount, balance):
    """
    驗證轉帳請求。驗證通過時回傳 None，否則拋出公司的錯誤類別。

    欄位驗證（ValidationError）：
        - from_account 空白
        - to_account 空白
        - amount 小於或等於 0

    業務驗證（BusinessError）：
        - T00001：轉出帳號與轉入帳號相同
        - T00002：金額大於餘額
    """
    # 欄位驗證
    if _is_blank(from_account):
        raise ValidationError("from_account", "轉出帳號不可為空白")

    if _is_blank(to_account):
        raise ValidationError("to_account", "轉入帳號不可為空白")

    if amount is None or amount <= 0:
        raise ValidationError("amount", "金額必須大於 0")

    # 業務驗證
    if from_account == to_account:
        raise BusinessError("T00001", "轉出帳號與轉入帳號不可相同")

    if amount > balance:
        raise BusinessError("T00002", "餘額不足，金額不可大於餘額")

    return None
```