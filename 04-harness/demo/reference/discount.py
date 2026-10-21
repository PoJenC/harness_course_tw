from decimal import ROUND_HALF_UP, Decimal

from shop.rates import RATES


def member_price(price, level):
    """回傳會員價格，四捨五入到整數元。"""
    amount = Decimal(str(price)) * Decimal(str(RATES[level.lower()]))   # 收銀機送來的是大寫
    return int(amount.quantize(Decimal("1"), rounding=ROUND_HALF_UP))
