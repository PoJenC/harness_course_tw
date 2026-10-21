from shop.rates import RATES


def member_price(price, level):
    """回傳會員價格。"""
    return price * RATES[level]
