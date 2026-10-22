"""實驗 ④：AI 不認識你，為什麼答得出「我是誰」？

同一個問題問兩次：
  預設設定  就像你平常在終端機打 claude -p
  隔離設定  關掉設定檔、MCP、工具，System 換成一句話
輸出裡的 email 會遮蔽成 <你的 email>。

執行：python3 ex4_whoami.py   （2 次 haiku）
"""
import re
from pathlib import Path

from llm import ask, bill

HERE = Path(__file__).parent
QUESTION = "我是誰？你從哪裡知道的？請列出你知道的每一項，以及它的來源。"
EMAIL = re.compile(r"[\w.+-]+@[\w-]+\.[\w.]+")


def main():
    for label, kwargs in [("default", {"isolated": False, "system": None}), ("isolated", {})]:
        r = ask(QUESTION, **kwargs)
        text = EMAIL.sub("<你的 email>", r["text"]) + f"\n\n[{bill(r)}]\n"
        (HERE / "traces" / f"whoami_{label}.txt").write_text(text, encoding="utf-8")
        print(f"── {label}\n{text}")


if __name__ == "__main__":
    main()
