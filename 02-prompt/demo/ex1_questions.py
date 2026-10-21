"""實驗 ①：動手前先叫它列問題。P0 和 P4 各問一次，數它有幾個問題。

執行：python3 02-prompt/demo/ex1_questions.py（2 次 haiku）
"""
import re

from prompts import LADDER, ask, build_prompt

ASK_FIRST = "\n\n先不要寫程式。請列出你還需要問我的問題，每題一行，用「- 」開頭；沒有問題就只回「沒有問題」。"

for name in ["P0", "P4"]:
    prompt = build_prompt(LADDER[name])
    answer, cost = ask(prompt + ASK_FIRST)
    questions = [line for line in answer.splitlines() if re.match(r"\s*([-•*]|\d+[.、)])\s+", line)]
    print(f"\n=== {name}（prompt {len(prompt)} 字）：{len(questions)} 個問題，US${cost:.4f} ===")
    print(answer.strip())
