from decimal import Decimal, ROUND_HALF_UP

from shop.rates import RATES


def member_price(price, level):
    """回傳會員價格，四捨五入到整數元（28.5 -> 29）。

    level 不分大小寫，例如 'gold' 與 'GOLD' 都可以。
    """
    # 用 Decimal 避免浮點數誤差（例如 199 * 0.8 = 159.20000000000002）
    amount = Decimal(str(price)) * Decimal(str(RATES[level.lower()]))
    return int(amount.quantize(Decimal("1"), rounding=ROUND_HALF_UP))
