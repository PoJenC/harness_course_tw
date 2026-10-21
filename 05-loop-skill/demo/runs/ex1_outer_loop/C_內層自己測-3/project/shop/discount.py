from decimal import Decimal, ROUND_HALF_UP

from shop.rates import RATES


def member_price(price, level):
    """回傳會員價格，依 README 四捨五入到整數元（半數進位）。

    level 不分大小寫，例如 'gold'、'GOLD' 都可以。
    """
    # 收銀台可能傳入大寫代號，統一轉成小寫再查表
    key = str(level).strip().lower()
    # 用 Decimal 避免浮點誤差，例如 199 * 0.8 = 159.20000000000002
    amount = Decimal(str(price)) * Decimal(str(RATES[key]))
    return int(amount.quantize(Decimal("1"), rounding=ROUND_HALF_UP))
