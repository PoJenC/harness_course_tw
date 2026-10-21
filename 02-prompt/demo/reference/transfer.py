"""講師的正解：證明考題做得到。"""
from company_errors import BusinessError, ValidationError


def validate_transfer(from_account, to_account, amount, balance):
    if not from_account:
        raise ValidationError("from_account")
    if not to_account:
        raise ValidationError("to_account")
    if amount is None or amount <= 0:
        raise ValidationError("amount")
    if from_account == to_account:
        raise BusinessError("T00001")
    if amount > balance:
        raise BusinessError("T00002")
