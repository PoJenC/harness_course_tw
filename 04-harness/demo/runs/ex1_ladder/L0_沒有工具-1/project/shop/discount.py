from decimal import Decimal, ROUND_HALF_UP

# 會員折扣率（金卡 = 8 折，依客訴金額推斷；請以 README.md 為準）
MEMBER_DISCOUNT_RATES = {
    "gold": Decimal("0.80"),
}
DEFAULT_RATE = Decimal("1.00")
CENT = Decimal("0.01")


def calculate_final_price(price, member_level=None):
    """回傳折扣後金額（Decimal，四捨五入到小數點後兩位）。"""
    # 用 str() 轉換，避免 float 誤差進入計算
    base = Decimal(str(price))
    rate = MEMBER_DISCOUNT_RATES.get(member_level, DEFAULT_RATE)
    return (base * rate).quantize(CENT, rounding=ROUND_HALF_UP)
