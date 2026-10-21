from decimal import Decimal, ROUND_HALF_UP

from shop.rates import RATES


def member_price(price, level):
    """回傳會員價格，四捨五入到整數元（半數進位）。

    會員代號不分大小寫（例如 'GOLD' 與 'gold' 視為相同），
    以符合收銀端傳入的各種寫法。

    改用 Decimal 計算，避免浮點數誤差（例如 159.20000000000002）影響進位結果。
    """
    code = str(level).strip().lower()
    if code not in RATES:
        raise ValueError(f"未知的會員等級: {level!r}")
    exact = Decimal(str(price)) * Decimal(str(RATES[code]))
    return int(exact.quantize(Decimal("1"), rounding=ROUND_HALF_UP))
