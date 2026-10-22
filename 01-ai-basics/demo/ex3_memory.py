"""實驗 ③：AI 沒有記憶，「對話」是外面那層程式做出來的。

1. 告訴它一件事
2. 開新的對話問它 → 它不知道
3. 接續原本的對話（--resume）→ 它「記得」了，但送出的 token 變多：前面的對話被重送了
4. 我們自己把前面的對話貼回去 → 一樣「記得」

執行：python3 ex3_memory.py   （4 次 haiku）
"""
from llm import ask, bill

FACT = "我的停車位是 B2-37，請記住。只回答「好」。"
QUESTION = "我的停車位是幾號？只回答號碼，不知道就回答「不知道」。"


def main():
    first = ask(FACT, persist=True)
    print(f"① 告訴它：{FACT}\n   AI：{first['text']}   [{bill(first)}]\n")

    fresh = ask(QUESTION)
    print(f"② 開新對話問：{QUESTION}\n   AI：{fresh['text']}   [{bill(fresh)}]\n")

    resumed = ask(QUESTION, resume=first["session"])
    print(f"③ 接續原本的對話問同一句\n   AI：{resumed['text']}   [{bill(resumed)}]\n")

    manual = ask(f"以下是先前的對話：\n[Human] {FACT}\n[AI] {first['text']}\n\n[Human] {QUESTION}")
    print(f"④ 開新對話，自己把前面的對話貼回去\n   AI：{manual['text']}   [{bill(manual)}]\n")

    print(f"③ 比 ② 多送了 {resumed['in'] - fresh['in']} 個 token，就是被重送的那段對話。")


if __name__ == "__main__":
    main()
