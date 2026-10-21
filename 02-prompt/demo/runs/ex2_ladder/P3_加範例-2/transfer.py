from company_errors import BusinessError, ValidationError


def _is_blank(value):
    return value is None or str(value).strip() == ""


def validate_transfer(from_account, to_account, amount, balance):
    if _is_blank(from_account):
        raise ValidationError("from_account")
    if _is_blank(to_account):
        raise ValidationError("to_account")
    if amount <= 0:
        raise ValidationError("amount")
    if str(from_account).strip() == str(to_account).strip():
        raise BusinessError("T00001")
    if amount > balance:
        raise BusinessError("T00002")
    return None
