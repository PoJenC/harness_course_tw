以下是 `transfer.py` 的內容。你提到的「公司錯誤類別」我沒有看到實際定義，所以先假設它們位於 `company.errors` 模組，並假設建構方式如下，請依實際情況調整 import 路徑與參數。

```python
# transfer.py
from company.errors import FieldValidationError, BusinessError  # 請依實際模組路徑調整


def _is_blank(value) -> bool:
    """帳號為 None 或只包含空白字元時視為空白。"""
    return value is None or str(value).strip() == ""


def validate_transfer(from_account, to_account, amount, balance) -> None:
    """驗證轉帳請求，通過時回傳 None，否則拋出公司錯誤類別。

    欄位驗證錯誤：FieldValidationError
    業務錯誤：BusinessError（錯誤碼 T00001 / T00002）
    """
    # 1. 欄位驗證
    if _is_blank(from_account):
        raise FieldValidationError("from_account", "轉出帳號不可為空白")
    if _is_blank(to_account):
        raise FieldValidationError("to_account", "轉入帳號不可為空白")
    if amount <= 0:
        raise FieldValidationError("amount", "轉帳金額必須大於 0")

    # 2. 業務驗證
    if str(from_account).strip() == str(to_account).strip():
        raise BusinessError("T00001", "轉出與轉入帳號不可相同")
    if amount > balance:
        raise BusinessError("T00002", "轉帳金額不可大於餘額")

    return None
```

設計說明：

- **驗證順序**：先做欄位驗證，再做業務驗證。若欄位本身不合法，就不需要進一步判斷業務規則。
- **空白判定**：`None` 或只含空白字元的字串都視為空白。
- **帳號比對**：比對前先去除前後空白，避免 `"123"` 與 `"123 "` 被當成不同帳號。
- **金額與餘額**：金額等於餘額是允許的，只有金額大於餘額時才回報 T00002。

如果你提供公司錯誤類別的實際定義（模組路徑、建構子參數），我可以幫你把 import 與拋出方式調整到正確的寫法。