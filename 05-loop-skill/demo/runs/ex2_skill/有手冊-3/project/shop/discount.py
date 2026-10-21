from decimal import Decimal, ROUND_HALF_UP

from shop.rates import RATES


def member_price(price, level):
    """回傳會員價格，四捨五入到整數元。"""
    rate = Decimal(str(RATES[level.lower()]))
    total = Decimal(str(price)) * rate
    return int(total.quantize(Decimal("1"), rounding=ROUND_HALF_UP))
