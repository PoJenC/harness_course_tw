from decimal import Decimal, ROUND_HALF_UP

from shop.rates import RATES


def member_price(price, level):
    """回傳會員價格，四捨五入到整數元（半數進位，例如 28.5 -> 29）。"""
    amount = Decimal(str(price)) * Decimal(str(RATES[level]))
    return int(amount.quantize(Decimal("1"), rounding=ROUND_HALF_UP))
