from decimal import Decimal, ROUND_HALF_UP

def apply_discount(price, rate):
    """price 與 rate 皆以字串或整數傳入，避免浮點誤差。"""
    total = Decimal(str(price)) * Decimal(str(rate))
    return total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

# 例：金卡 8 折
# apply_discount(199, "0.8") -> Decimal('159.20')
