以下是一個驗證轉帳請求的 Python 函式。它會檢查必要欄位、帳號格式、金額、幣別與備註，並把所有錯誤一次回報，而不是遇到第一個錯誤就停止。

```python
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
```

### 設計重點

- **使用 `Decimal` 而非 `float`**：避免浮點數誤差，例如 `0.1 + 0.2` 的問題。函式也會直接拒絕 `float` 型別的金額。
- **一次回報所有錯誤**：呼叫端可以一次把所有問題呈現給使用者，不必反覆提交。
- **轉出與轉入帳號相同時會拒絕**：這是常見的邏輯錯誤。
- **幣別規則集中管理**：小數位數與單筆上限放在 `CURRENCY_RULES`，之後新增幣別只需修改這裡。
- **資料不可變**：`TransferRequest` 使用 `frozen=True`，驗證通過後的資料不會被意外修改。

### 實務上還需要考慮的事項

1. **帳號格式**：`ACCOUNT_PATTERN` 只是示範。實際位數與格式請依銀行或系統規範調整。
2. **冪等性（Idempotency）**：若網路重送可能造成重複扣款，建議在請求中加入 `idempotency_key`，並在驗證層或服務層檢查。
3. **餘額與權限檢查**：這些屬於業務邏輯，應在驗證函式之外，於交易執行前處理。
4. **安全性**：錯誤訊息避免洩漏系統內部細節，對外回傳時可只顯示使用者可理解的訊息。

如果你告訴我使用的框架（例如 FastAPI、Django）或帳號格式的具體規範，我可以幫你調整程式碼。