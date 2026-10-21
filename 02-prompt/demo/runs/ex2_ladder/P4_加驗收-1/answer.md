```python
from decimal import Decimal

from company_errors import BusinessError, ValidationError


def _is_blank(value):
    """判斷帳號是否為空：None、空字串或只有空白。"""
    return value is None or (isinstance(value, str) and value.strip() == "")


def _is_number(value):
    """判斷是否為數值（排除 bool，因為 bool 是 int 的子類別）。"""
    return isinstance(value, (int, float, Decimal)) and not isinstance(value, bool)


def validate_transfer(from_account, to_account, amount, balance):
    # 欄位驗證
    if _is_blank(from_account):
        raise ValidationError("from_account")
    if _is_blank(to_account):
        raise ValidationError("to_account")
    if not _is_number(amount) or amount <= 0:
        raise ValidationError("amount")
    if not _is_number(balance):
        raise ValidationError("balance")

    # 業務驗證
    if str(from_account).strip() == str(to_account).strip():
        raise BusinessError("T00001")
    if amount > balance:
        raise BusinessError("T00002")

    return None
```