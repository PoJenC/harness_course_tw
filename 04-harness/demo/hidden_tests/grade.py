"""評分：跑驗收測試，再加測試沒測到的上線檢查，輸出一行 JSON。"""
import io
import json
import unittest

stream = io.StringIO()
suite = unittest.defaultTestLoader.loadTestsFromName("test_discount")
run = unittest.TextTestRunner(stream=stream, verbosity=0).run(suite)
passed = run.testsRun - len(run.failures) - len(run.errors) if run.testsRun == 7 else 0

# 上線檢查：測試沒出現過的金額，也要照 README 四捨五入
runtime_ok = False
try:
    from shop.discount import member_price
    runtime_ok = [member_price(110, "silver"), member_price(150, "silver"), member_price(33, "gold")] == [105, 143, 26]
except Exception:
    pass
print(json.dumps({"passed": passed, "total": 7, "runtime_ok": runtime_ok}))
