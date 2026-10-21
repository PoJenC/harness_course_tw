以下是一個驗證轉帳請求的 Python 函式。它使用 `Decimal` 處理金額，避免浮點數誤差，並收集所有錯誤一次回傳，方便呼叫端顯示完整訊息。

```python
from dataclasses import dataclass, field
from decimal import Decimal, InvalidOperation
from typing import Any, Mapping
import re

# 常數設定
SUPPORTED_CURRENCIES = {"TWD", "USD", "JPY", "EUR"}
MIN_AMOUNT = Decimal("0.01")
MAX_AMOUNT = Decimal("1000000.00")   # 單筆上限，依業務需求調整
MAX_MEMO_LENGTH = 100
ACCOUNT_ID_PATTERN = re.compile(r"^\d{10,16}$")  # 假設帳號為 10–16 位數字


@dataclass
class ValidationResult:
    is_valid: bool
    errors: list[str] = field(default_factory=list)


def validate_transfer_request(request: Mapping[str, Any]) -> ValidationResult:
    """
    驗證轉帳請求的欄位格式與業務規則。

    必要欄位:
        from_account: 轉出帳號（字串，10–16 位數字）
        to_account:   轉入帳號（字串，10–16 位數字）
        amount:       金額（字串、整數或 Decimal，最多兩位小數）
        currency:     幣別（如 "TWD"）

    選填欄位:
        memo:         備註（字串，最多 100 字元）

    回傳:
        ValidationResult，is_valid 為 True 表示通過，否則 errors 內含所有錯誤訊息。
    """
    errors: list[str] = []

    # 1. 必要欄位檢查
    required_fields = ("from_account", "to_account", "amount", "currency")
    for name in required_fields:
        if request.get(name) in (None, ""):
            errors.append(f"缺少必要欄位：{name}")

    # 缺少必要欄位時，後續檢查沒有意義，直接回傳
    if errors:
        return ValidationResult(False, errors)

    from_account = str(request["from_account"]).strip()
    to_account = str(request["to_account"]).strip()
    currency = str(request["currency"]).strip().upper()
    memo = request.get("memo")

    # 2. 帳號格式檢查
    if not ACCOUNT_ID_PATTERN.fullmatch(from_account):
        errors.append("轉出帳號格式錯誤（應為 10–16 位數字）")
    if not ACCOUNT_ID_PATTERN.fullmatch(to_account):
        errors.append("轉入帳號格式錯誤（應為 10–16 位數字）")

    # 3. 不可轉給自己
    if from_account and from_account == to_account:
        errors.append("轉出與轉入帳號不可相同")

    # 4. 金額檢查
    amount = _parse_amount(request["amount"], errors)
    if amount is not None:
        if amount < MIN_AMOUNT:
            errors.append(f"金額不可低於 {MIN_AMOUNT}")
        if amount > MAX_AMOUNT:
            errors.append(f"金額不可超過 {MAX_AMOUNT}")
        if amount.as_tuple().exponent < -2:
            errors.append("金額最多只能有兩位小數")

    # 5. 幣別檢查
    if currency not in SUPPORTED_CURRENCIES:
        errors.append(f"不支援的幣別：{currency}")

    # 6. 備註檢查（選填）
    if memo is not None:
        if not isinstance(memo, str):
            errors.append("備註必須為字串")
        elif len(memo) > MAX_MEMO_LENGTH:
            errors.append(f"備註長度不可超過 {MAX_MEMO_LENGTH} 字元")

    return ValidationResult(is_valid=not errors, errors=errors)


def _parse_amount(value: Any, errors: list[str]) -> Decimal | None:
    """將金額轉為 Decimal；失敗時加入錯誤訊息並回傳 None。"""
    if isinstance(value, bool):  # bool 是 int 的子類別，需排除
        errors.append("金額格式錯誤")
        return None
    try:
        amount = Decimal(str(value))
    except (InvalidOperation, ValueError):
        errors.append("金額格式錯誤")
        return None
    if not amount.is_finite():  # 排除 NaN、Infinity
        errors.append("金額必須為有限數值")
        return None
    return amount


if __name__ == "__main__":
    # 範例測試
    good = {
        "from_account": "1234567890",
        "to_account": "0987654321",
        "amount": "1500.50",
        "currency": "twd",
        "memo": "房租",
    }
    bad = {
        "from_account": "123",
        "to_account": "123",
        "amount": "-5.123",
        "currency": "XYZ",
        "memo": "x" * 101,
    }

    print(validate_transfer_request(good))
    print(validate_transfer_request(bad))
```

**設計重點：**

- **用 `Decimal` 而非 `float`**：`float` 無法精確表示如 `0.1` 的小數，金額計算應避免。
- **收集所有錯誤**：一次回傳所有問題，比逐一報錯更適合表單或 API 使用。
- **排除 `bool`**：Python 中 `True` 是 `int`，若不排除，`amount=True` 會被當成 `1`。
- **拒絕 `NaN` / `Infinity`**：`Decimal("NaN")` 與 `Decimal("Infinity")` 都能成功解析，但會破壞比較邏輯。
- **帳號格式與上限是假設值**：請依貴公司的實際規則調整 `ACCOUNT_ID_PATTERN`、`MAX_AMOUNT` 與支援幣別。

**注意事項：** 此函式只做「格式與基本業務規則」的驗證。實際轉帳還需要餘額檢查、帳號存在性確認、風控、冪等性（防止重複扣款）等，應在交易層另外處理，不能只依賴這個驗證函式。