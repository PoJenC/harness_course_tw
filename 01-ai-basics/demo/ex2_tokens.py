"""實驗 ②：AI 看到的不是「字」，而是 token。

CLI 沒有直接數 token 的指令，所以用差值法：
送出這段文字的 input token，減去只送一個字「a」時的 input token。

執行：python3 ex2_tokens.py   （7 次 haiku，不到 0.1 元）
"""
from llm import ask

TINY_SYSTEM = "x"
SAMPLES = [
    "今天天氣真好",
    "The weather is nice today",
    "台北市信義區市府路1號",
    "0912-345-678",
    "🎉🎂🎁",
]
# 一般中文文章：用來估算「一本書」有多少 token
PARAGRAPH = ("週末我們全家去宜蘭玩，早上先到礁溪泡腳，中午在羅東夜市附近吃了肉羹和卜肉，"
             "下午去了冬山河騎腳踏車。回程遇到雪隧塞車，到家已經晚上九點，大家都累壞了，"
             "但小孩說下次還想再去，還要多住一晚。")


def count(text: str, base: int) -> int:
    return ask(text, system=TINY_SYSTEM)["in"] - base


def main():
    base = ask("a", system=TINY_SYSTEM)["in"] - 1
    print(f"{'token':>5} {'字數':>4}  文字")
    for text in SAMPLES:
        print(f"{count(text, base):>5} {len(text):>4}  {text}")

    n = count(PARAGRAPH, base)
    per_char = n / len(PARAGRAPH)
    book = 300 * 500
    print(f"\n一段 {len(PARAGRAPH)} 字的中文 = {n} token（每個字約 {per_char:.2f} token）")
    print(f"一本 300 頁、每頁 500 字的書（{book:,} 字）≈ {book * per_char:,.0f} token")


if __name__ == "__main__":
    main()
