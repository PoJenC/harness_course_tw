```python
from decimal import Decimal

from company_errors import BusinessError, ValidationError


def _is_blank(value):
    return value is None or (isinstance(value, str) and value.strip() == "")


def validate_transfer(from_account, to_account, amount, balance):
    if _is_blank(from_account):
        raise ValidationError("from_account")
    if _is_blank(to_account):
        raise ValidationError("to_account")

    if amount is None or isinstance(amount, bool) or not isinstance(amount, (int, float, Decimal)):
        raise ValidationError("amount")
    if not amount > 0:
        raise ValidationError("amount")

    if balance is None or isinstance(balance, bool) or not isinstance(balance, (int, float, Decimal)):
        raise ValidationError("balance")

    if str(from_account).strip() == str(to_account).strip():
        raise BusinessError("T00001")

    if amount > balance:
        raise BusinessError("T00002")

    return None
```