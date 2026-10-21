from decimal import Decimal, ROUND_HALF_UP

from shop.rates import RATES


def member_price(price, level):
    """回傳會員價格（四捨五入到整數元）。

    使用 Decimal 避免浮點數誤差（例如 199 * 0.8 = 159.20000000000002），
    四捨五入採用 ROUND_HALF_UP（例如 28.5 -> 29）。
    """
    total = Decimal(str(price)) * Decimal(str(RATES[level]))
    return int(total.quantize(Decimal("1"), rounding=ROUND_HALF_UP))
