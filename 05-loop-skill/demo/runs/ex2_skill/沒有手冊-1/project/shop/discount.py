from decimal import Decimal, ROUND_HALF_UP

from shop.rates import RATES


def member_price(price, level):
    """回傳會員價格，依 README 四捨五入到整數元（半數進位）。"""
    # 會員代號統一轉成小寫，避免收銀端傳入 'GOLD' 這類大寫代號時出錯
    level = str(level).strip().lower()
    # 使用 Decimal 避免浮點數誤差（例如 159.20000000000002）
    # 並以 ROUND_HALF_UP 取代 Python 內建 round 的銀行家捨入（28.5 -> 28）
    total = Decimal(str(price)) * Decimal(str(RATES[level]))
    return int(total.quantize(Decimal("1"), rounding=ROUND_HALF_UP))
