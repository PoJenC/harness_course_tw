from decimal import Decimal, ROUND_HALF_UP

from shop.rates import RATES


def member_price(price, level):
    """回傳會員價格，結帳金額四捨五入到整數元。

    level 會忽略大小寫與前後空白，例如 'GOLD'、' gold ' 都視為金卡。
    """
    key = str(level).strip().lower()
    if key not in RATES:
        raise ValueError(f"未知的會員等級: {level}")
    total = Decimal(str(price)) * Decimal(str(RATES[key]))
    return int(total.quantize(Decimal("1"), rounding=ROUND_HALF_UP))
