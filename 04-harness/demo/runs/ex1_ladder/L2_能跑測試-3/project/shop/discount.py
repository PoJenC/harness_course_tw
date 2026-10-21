from decimal import Decimal, ROUND_HALF_UP

from shop.rates import RATES


def member_price(price, level):
    """回傳會員價格，四捨五入到整數元（半數進位）。"""
    # 收銀台可能傳入大寫代號（例如 "GOLD"），統一轉成小寫再查表。
    key = str(level).strip().lower()
    # 用 Decimal 避免浮點誤差（例如 199 * 0.8 = 159.20000000000002），
    # 並用 ROUND_HALF_UP，讓 28.5 → 29（Python 內建 round 是銀行家捨入，會變 28）。
    total = Decimal(str(price)) * Decimal(str(RATES[key]))
    return int(total.quantize(Decimal("1"), rounding=ROUND_HALF_UP))
