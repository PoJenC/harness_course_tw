from decimal import Decimal, ROUND_HALF_UP

from shop.rates import RATES


def member_price(price, level):
    """回傳會員價格（四捨五入到整數元）。

    使用 Decimal 避免浮點數誤差，並以 ROUND_HALF_UP 四捨五入
    （例如 28.5 -> 29）。會員等級代號不分大小寫（例如 GOLD 與 gold 相同）。
    """
    key = str(level).strip().lower()
    exact = Decimal(str(price)) * Decimal(str(RATES[key]))
    return int(exact.quantize(Decimal("1"), rounding=ROUND_HALF_UP))
