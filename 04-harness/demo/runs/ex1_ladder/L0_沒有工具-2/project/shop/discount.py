from decimal import Decimal, ROUND_HALF_UP

# 會員折扣率（以 Decimal 表示，避免浮點誤差）
# 假設：金卡 8 折，請以 README.md 為準
MEMBER_DISCOUNT_RATES = {
    "gold": Decimal("0.80"),
}

CENT = Decimal("0.01")


def _to_decimal(value) -> Decimal:
    # 先轉成字串再轉 Decimal，避免 float 直接轉換時帶入誤差
    return value if isinstance(value, Decimal) else Decimal(str(value))


def apply_discount(price, member_level: str | None = None) -> Decimal:
    """計算會員折扣後的價格，結果四捨五入到小數點後兩位。

    price: 商品原價（int、float、str 或 Decimal 皆可）
    member_level: 會員等級，例如 "gold"；None 或未知等級則不打折
    """
    original = _to_decimal(price)
    rate = MEMBER_DISCOUNT_RATES.get(member_level, Decimal("1"))
    final = original * rate
    return final.quantize(CENT, rounding=ROUND_HALF_UP)


if __name__ == "__main__":
    print(apply_discount(199, "gold"))  # 159.20
    print(apply_discount(199))          # 199.00
