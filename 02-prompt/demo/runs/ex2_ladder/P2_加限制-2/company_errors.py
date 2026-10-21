"""公司框架（迷你版）：所有服務都必須使用這兩個錯誤類別，不可以自己定義。

AI 沒看過這個檔案，就像它沒看過我們公司的 CBMP 框架。
"""


class ValidationError(Exception):
    """欄位驗證失敗。參數是欄位名稱，例如 ValidationError("email")。"""

    def __init__(self, field):
        super().__init__(field)
        self.field = field


class BusinessError(Exception):
    """業務規則不符合。參數是錯誤碼，例如 BusinessError("A00003")。"""

    def __init__(self, code):
        super().__init__(code)
        self.code = code
