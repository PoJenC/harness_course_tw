from decimal import Decimal, ROUND_HALF_UP

from shop.rates import RATES


def member_price(price, level):
    """回傳會員價格，結果四捨五入到整數元（28.5 -> 29）。"""
    # 收銀端可能傳入大寫代號（例如 'GOLD'），統一轉成小寫再查表
    key = str(level).strip().lower()
    # 用字串建立 Decimal，避免浮點數誤差（例如 159.20000000000002）
    exact = Decimal(str(price)) * Decimal(str(RATES[key]))
    return int(exact.quantize(Decimal("1"), rounding=ROUND_HALF_UP))
