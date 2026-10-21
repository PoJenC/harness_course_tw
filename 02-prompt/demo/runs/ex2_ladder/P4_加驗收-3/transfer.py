from decimal import Decimal

from company_errors import BusinessError, ValidationError


def _is_blank(value):
    return value is None or not isinstance(value, str) or value.strip() == ""


def _is_number(value):
    return isinstance(value, (int, float, Decimal)) and not isinstance(value, bool)


def validate_transfer(from_account, to_account, amount, balance):
    if _is_blank(from_account):
        raise ValidationError("from_account")
    if _is_blank(to_account):
        raise ValidationError("to_account")
    if not _is_number(amount):
        raise ValidationError("amount")
    if amount <= 0:
        raise ValidationError("amount")
    if from_account.strip() == to_account.strip():
        raise BusinessError("T00001")
    if not _is_number(balance):
        raise ValidationError("balance")
    if amount > balance:
        raise BusinessError("T00002")
    return None
