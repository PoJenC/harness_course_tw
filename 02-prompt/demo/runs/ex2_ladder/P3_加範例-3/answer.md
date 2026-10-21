```python
from company_errors import BusinessError, ValidationError


def validate_transfer(from_account, to_account, amount, balance):
    if from_account is None or not str(from_account).strip():
        raise ValidationError("from_account")
    if to_account is None or not str(to_account).strip():
        raise ValidationError("to_account")
    if amount <= 0:
        raise ValidationError("amount")
    if from_account == to_account:
        raise BusinessError("T00001")
    if amount > balance:
        raise BusinessError("T00002")
    return None
```