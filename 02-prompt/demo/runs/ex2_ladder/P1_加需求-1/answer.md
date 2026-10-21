以下是 `transfer.py`。我沒有公司錯誤類別的程式碼，所以先假設 `FieldValidationError` 和 `BusinessError` 兩個類別，請依公司實際的名稱與匯入路徑修改。

```python
# transfer.py
from company_errors import FieldValidationError, BusinessError  # TODO: 換成公司實際的錯誤類別

SAME_ACCOUNT_ERROR_CODE = "T00001"
INSUFFICIENT_BALANCE_ERROR_CODE = "T00002"


def _is_blank(value) -> bool:
    """None、空字串或只有空白字元都視為空白。"""
    return value is None or str(value).strip() == ""


def validate_transfer(from_account, to_account, amount, balance) -> None:
    """驗證轉帳請求，通過時回傳 None；否則拋出公司的錯誤類別。

    欄位驗證錯誤：FieldValidationError（指出欄位名稱）
    業務錯誤：BusinessError（附錯誤碼）
    """
    # 1. 欄位驗證
    if _is_blank(from_account):
        raise FieldValidationError(field="from_account", message="轉出帳號不可為空白")

    if _is_blank(to_account):
        raise FieldValidationError(field="to_account", message="轉入帳號不可為空白")

    if amount <= 0:
        raise FieldValidationError(field="amount", message="金額必須大於 0")

    # 2. 業務驗證
    if from_account == to_account:
        raise BusinessError(code=SAME_ACCOUNT_ERROR_CODE, message="轉出與轉入帳號不可相同")

    if amount > balance:
        raise BusinessError(code=INSUFFICIENT_BALANCE_ERROR_CODE, message="餘額不足")

    return None
```

### 測試用的暫代錯誤類別

若要在沒有公司套件的環境先跑測試，可以在同目錄建立 `company_errors.py`，內容如下，之後換成公司的版本即可：

```python
# company_errors.py（僅供本機測試，正式環境請刪除並使用公司套件）
class FieldValidationError(Exception):
    def __init__(self, field, message):
        self.field = field
        self.message = message
        super().__init__(f"[{field}] {message}")


class BusinessError(Exception):
    def __init__(self, code, message):
        self.code = code
        self.message = message
        super().__init__(f"[{code}] {message}")
```

### 使用範例

```python
from transfer import validate_transfer
from company_errors import FieldValidationError, BusinessError

try:
    validate_transfer("A001", "A001", 100, 500)
except BusinessError as e:
    print(e.code)  # T00001
```

### 驗證順序

函式依序檢查：先做欄位驗證（轉出帳號、轉入帳號、金額），通過後再做業務驗證（帳號相同 T00001，金額大於餘額 T00002）。如果公司規定的檢查順序不同，告訴我即可調整。