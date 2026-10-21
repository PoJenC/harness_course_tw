from decimal import Decimal, ROUND_HALF_UP

from shop.rates import RATES


def member_price(price, level):
    """回傳會員價格，依 README 四捨五入到整數元。

    level 對應 README 的代號（normal / silver / gold），不分大小寫，
    例如收銀端傳入 'GOLD' 也能正確計算。
    """
    key = str(level).strip().lower()
    if key not in RATES:
        raise ValueError(f"未知的會員等級：{level!r}，可用代號為 {sorted(RATES)}")

    # 用 Decimal 避免浮點數誤差（例如 199 * 0.8 = 159.20000000000002）
    total = Decimal(str(price)) * Decimal(str(RATES[key]))
    # README 規定四捨五入（28.5 -> 29），因此用 ROUND_HALF_UP，而不是 Python 內建 round 的銀行家捨入
    return int(total.quantize(Decimal("1"), rounding=ROUND_HALF_UP))
