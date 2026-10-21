from __future__ import annotations

import re
from dataclasses import dataclass
from decimal import Decimal, InvalidOperation
from typing import Any, Mapping


class TransferValidationError(ValueError):
    """轉帳請求驗證失敗，errors 內含所有錯誤訊息。"""

    def __init__(self, errors: list[str]):
        self.errors = errors
        super().__init__("; ".join(errors))


@dataclass(frozen=True)
class TransferRequest:
    from_account: str
    to_account: str
    amount: Decimal
    currency: str
    memo: str = ""


# 幣別設定：小數位數與單筆上限（示範用，請依實際規範調整）
CURRENCY_RULES: dict[str, dict[str, Any]] = {
    "TWD": {"decimals": 0, "max_amount": Decimal("1000000")},
    "USD": {"decimals": 2, "max_amount": Decimal("50000")},
}

ACCOUNT_PATTERN = re.compile(r"^\d{10,16}$")
MAX_MEMO_LENGTH = 100
REQUIRED_FIELDS = ("from_account", "to_account", "amount", "currency")


def _parse_amount(raw: Any) -> Decimal:
    """將輸入轉為 Decimal；拒絕 float、bool 以避免精度與型別問題。"""
    if isinstance(raw, bool) or isinstance(raw, float):
        raise ValueError("金額不可為 float 或 bool，請使用字串或整數")
    if not isinstance(raw, (str, int, Decimal)):
        raise ValueError("金額格式不正確")
    try:
        value = Decimal(str(raw))
    except InvalidOperation as exc:
        raise ValueError("金額格式不正確") from exc
    if not value.is_finite():
        raise ValueError("金額必須為有限數值")
    return value


def validate_transfer_request(data: Mapping[str, Any]) -> TransferRequest:
    """驗證轉帳請求，通過則回傳 TransferRequest，否則拋出 TransferValidationError。"""
    errors: list[str] = []

    # 1. 必填欄位
    missing = [f for f in REQUIRED_FIELDS if data.get(f) in (None, "")]
    if missing:
        errors.append(f"缺少必填欄位：{', '.join(missing)}")
        raise TransferValidationError(errors)

    from_account = str(data["from_account"]).strip()
    to_account = str(data["to_account"]).strip()
    currency = str(data["currency"]).strip().upper()
    memo = str(data.get("memo") or "").strip()

    # 2. 帳號格式
    if not ACCOUNT_PATTERN.fullmatch(from_account):
        errors.append("轉出帳號格式錯誤（須為 10–16 位數字）")
    if not ACCOUNT_PATTERN.fullmatch(to_account):
        errors.append("轉入帳號格式錯誤（須為 10–16 位數字）")
    if from_account and from_account == to_account:
        errors.append("轉出與轉入帳號不可相同")

    # 3. 幣別
    rules = CURRENCY_RULES.get(currency)
    if rules is None:
        errors.append(f"不支援的幣別：{currency}")

    # 4. 金額
    amount: Decimal | None = None
    try:
        amount = _parse_amount(data["amount"])
    except ValueError as exc:
        errors.append(str(exc))

    if amount is not None:
        if amount <= 0:
            errors.append("金額必須大於 0")
        if rules is not None:
            if amount.as_tuple().exponent < -rules["decimals"]:
                errors.append(f"{currency} 金額最多 {rules['decimals']} 位小數")
            if amount > rules["max_amount"]:
                errors.append(f"{currency} 單筆金額不可超過 {rules['max_amount']}")

    # 5. 備註
    if len(memo) > MAX_MEMO_LENGTH:
        errors.append(f"備註長度不可超過 {MAX_MEMO_LENGTH} 字元")

    if errors:
        raise TransferValidationError(errors)

    return TransferRequest(
        from_account=from_account,
        to_account=to_account,
        amount=amount,  # type: ignore[arg-type]
        currency=currency,
        memo=memo,
    )


if __name__ == "__main__":
    good = {
        "from_account": "1234567890",
        "to_account": "0987654321",
        "amount": "1500.50",
        "currency": "usd",
        "memo": "房租",
    }
    print(validate_transfer_request(good))

    bad = {
        "from_account": "123",
        "to_account": "123",
        "amount": -5,
        "currency": "XYZ",
    }
    try:
        validate_transfer_request(bad)
    except TransferValidationError as e:
        for msg in e.errors:
            print("-", msg)
