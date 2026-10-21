from decimal import Decimal, ROUND_HALF_UP

from shop.rates import RATES


def member_price(price, level):
    """回傳會員價格，依 README 四捨五入到整數元（28.5 -> 29）。

    level 不分大小寫，例如 'gold' 與 'GOLD' 都可以。
    """
    key = str(level).strip().lower()
    total = Decimal(str(price)) * Decimal(str(RATES[key]))
    return int(total.quantize(Decimal("1"), rounding=ROUND_HALF_UP))
