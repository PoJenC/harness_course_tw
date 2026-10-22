"""在產生的專案資料夾裡執行：跑 7 個驗收測試，再做一次「上線檢查」，印出 JSON。

上線檢查：前端漏傳金額（None）時，應該拋出公司的 ValidationError，而不是讓程式當掉。
這件事驗收測試沒有測：測試全過，不代表真的能上線。
"""
import io
import json
import re
import unittest

result = {"passed": 0, "total": 7, "runtime_ok": False, "error": ""}
try:
    suite = unittest.defaultTestLoader.loadTestsFromName("acceptance_test")
    run = unittest.TextTestRunner(stream=io.StringIO(), verbosity=0).run(suite)
    # 連 transfer.py 都 import 不進來時，unittest 只會回報 1 個錯誤，這時算 0/7
    if run.testsRun == 7:
        result["passed"] = run.testsRun - len(run.failures) - len(run.errors)
    problems = run.failures + run.errors
    if problems:
        last = problems[0][1].strip().splitlines()[-1]
        result["error"] = re.sub(r" \(/.*?\)", "", last)[:120]   # 去掉路徑，只留原因

    from company_errors import ValidationError
    from transfer import validate_transfer
    try:
        validate_transfer("A001", "B002", None, 500)
    except ValidationError:
        result["runtime_ok"] = True
    except Exception:
        pass
except Exception as e:          # 連 import 都失敗（檔名、函式名稱不對）
    result["error"] = re.sub(r" \(/.*?\)", "", f"{type(e).__name__}: {e}")[:120]

print(json.dumps(result, ensure_ascii=False))
