"""實驗 ③：測試都過了，真的能上線嗎？

不呼叫 AI。把 runs/ex2_ladder/ 裡每一次產生的 transfer.py 拿出來，
模擬前端漏傳金額：validate_transfer("A001", "B002", None, 500)，印出實際發生的事。

執行：python3 02-prompt/demo/ex3_none_check.py
"""
import re
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).parent
RUNS = HERE / "runs" / "ex2_ladder"
CALL = """
from transfer import validate_transfer
try:
    validate_transfer("A001", "B002", None, 500)
    print("沒有任何錯誤（直接放行）")
except Exception as e:
    print(f"{type(e).__name__}: {e}")
"""


def main():
    for run in sorted(RUNS.iterdir()):
        out = subprocess.run([sys.executable, "-c", CALL], cwd=run, capture_output=True, text=True, timeout=30)
        last = (out.stdout or out.stderr).strip().splitlines()[-1:] or ["（沒有輸出）"]
        print(f"{run.name:<14} {re.sub(r' [(]/.*?[)]', '', last[0])[:100]}")   # 去掉本機路徑


if __name__ == "__main__":
    main()
