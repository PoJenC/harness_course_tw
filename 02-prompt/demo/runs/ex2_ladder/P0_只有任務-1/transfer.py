from __future__ import annotations

import re
from dataclasses import dataclass, field
from decimal import Decimal, InvalidOperation
from typing import Any, Mapping

# 可依實際業務調整的規則
ACCOUNT_PATTERN = re.compile(r"^\d{10,16}$")       # 帳號：10–16 位數字
CURRENCY_CODES = {"TWD", "USD", "JPY", "EUR"}       # 允許的幣別
MIN_AMOUNT = Decimal("1")                           # 最小轉帳金額
MAX_AMOUNT = Decimal("1000000")                     # 單筆上限
MAX_MEMO_LENGTH = 100


@dataclass
class ValidationResult:
    is_valid: bool
    errors: list[str] = field(default_factory=list)
    amount: Decimal | None = None   # 驗證通過後的標準化金額


def validate_transfer_request(payload: Mapping[str, Any]) -> ValidationResult:
    """驗證轉帳請求，回傳 ValidationResult，不會拋出例外。"""
    errors: list[str] = []

    # 1. 必要欄位
    required = ("from_account", "to_account", "amount", "currency")
    missing = [f for f in required if payload.get(f) in (None, "")]
    if missing:
        errors.append(f"缺少必要欄位：{', '.join(missing)}")
        return ValidationResult(False, errors)

    from_account = str(payload["from_account"]).strip()
    to_account = str(payload["to_account"]).strip()

    # 2. 帳號格式
    if not ACCOUNT_PATTERN.fullmatch(from_account):
        errors.append("轉出帳號格式不正確")
    if not ACCOUNT_PATTERN.fullmatch(to_account):
        errors.append("轉入帳號格式不正確")
    if from_account == to_account:
        errors.append("轉出與轉入帳號不可相同")

    # 3. 金額
    amount: Decimal | None = None
    try:
        amount = Decimal(str(payload["amount"]))
    except (InvalidOperation, ValueError):
        errors.append("金額必須為數字")
    else:
        if not amount.is_finite():
            errors.append("金額必須為有限數字")
            amount = None
        elif amount < MIN_AMOUNT or amount > MAX_AMOUNT:
            errors.append(f"金額必須介於 {MIN_AMOUNT} 與 {MAX_AMOUNT} 之間")
        elif amount.as_tuple().exponent < -2:
            errors.append("金額最多只能到小數點後兩位")

    # 4. 幣別
    currency = str(payload["currency"]).upper()
    if currency not in CURRENCY_CODES:
        errors.append(f"不支援的幣別：{currency}")

    # 5. 選填欄位：附言
    memo = payload.get("memo")
    if memo is not None and len(str(memo)) > MAX_MEMO_LENGTH:
        errors.append(f"附言長度不可超過 {MAX_MEMO_LENGTH} 字元")

    return ValidationResult(
        is_valid=not errors,
        errors=errors,
        amount=amount if not errors else None,
    )


if __name__ == "__main__":
    ok = {
        "from_account": "1234567890",
        "to_account": "0987654321",
        "amount": "1500.50",
        "currency": "twd",
        "memo": "房租",
    }
    bad = {
        "from_account": "123",
        "to_account": "123",
        "amount": "-10.123",
        "currency": "XXX",
    }

    print(validate_transfer_request(ok))
    print(validate_transfer_request(bad))
