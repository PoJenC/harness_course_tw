from decimal import Decimal, ROUND_HALF_UP

from shop.rates import RATES


def member_price(price, level):
    """回傳會員價格（四捨五入到整數元）。

    - 會員等級代號不分大小寫（收銀台可能傳入 "GOLD"）。
    - 使用 Decimal 避免浮點數誤差（例如 199 * 0.8 = 159.20000000000002）。
    - 採用四捨五入（ROUND_HALF_UP），例如 28.5 -> 29，而非 round() 的銀行家捨入。
    """
    key = str(level).strip().lower()
    amount = Decimal(str(price)) * Decimal(str(RATES[key]))
    return int(amount.quantize(Decimal("1"), rounding=ROUND_HALF_UP))
