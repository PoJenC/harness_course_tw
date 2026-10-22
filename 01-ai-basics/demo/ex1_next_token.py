"""實驗 ①：迷你接龍 AI。

用台北捷運的站名訓練一個極小的接龍模型：看前一個字，統計下一個字出現幾次。
大型語言模型做的是同一件事，只是它看的不是前 1 個字，而是前面全部的文字。

執行：python3 ex1_next_token.py   （不呼叫 AI）
"""
import random
from collections import Counter, defaultdict

STATIONS = """
動物園 木柵 萬芳社區 萬芳醫院 辛亥 麟光 六張犁 科技大樓 大安 忠孝復興 南京復興 中山國中
松山機場 大直 劍南路 西湖 港墘 文德 內湖 大湖公園 葫洲 東湖 南港軟體園區 南港展覽館
象山 台北101 信義安和 大安森林公園 東門 中正紀念堂 台大醫院 台北車站 中山 雙連 民權西路
圓山 劍潭 士林 芝山 明德 石牌 唭哩岸 奇岩 北投 新北投 復興崗 忠義 關渡 竹圍 紅樹林 淡水
新店 新店區公所 七張 小碧潭 大坪林 景美 萬隆 公館 台電大樓 古亭 小南門 西門 北門 松江南京
台北小巨蛋 南京三民 松山 南勢角 景安 永安市場 頂溪 忠孝新生 行天宮 中山國小 大橋頭 台北橋
菜寮 三重 先嗇宮 頭前庄 新莊 輔大 丹鳳 迴龍 三重國小 三和國中 徐匯中學 三民高中 蘆洲
頂埔 永寧 土城 海山 亞東醫院 府中 板橋 新埔 江子翠 龍山寺 善導寺 忠孝敦化 國父紀念館
市政府 永春 後山埤 昆陽 南港 十四張 秀朗橋 景平 中和 橋和 中原 板新 新埔民生 幸福 新北產業園區
""".split()

START, END = "^", "$"


def train(names: list[str]) -> dict[str, Counter]:
    """統計「前一個字 → 下一個字」各出現幾次。"""
    model: dict[str, Counter] = defaultdict(Counter)
    for name in names:
        chars = START + name + END
        for a, b in zip(chars, chars[1:]):
            model[a][b] += 1
    return model


def generate(model, rng: random.Random) -> str:
    """接龍：猜下一個字、接上去，再用新的結尾猜下一個，直到它說「結束」。"""
    text = START
    while len(text) < 8:
        counts = model[text[-1]]
        nxt = rng.choices(list(counts), weights=list(counts.values()))[0]
        if nxt == END:
            break
        text += nxt
    return text[1:]


def main():
    model = train(STATIONS)
    print(f"語料：{len(STATIONS)} 個捷運站名\n")

    print("── 1. 看到「大」之後，下一個字是什麼？")
    counts = model["大"]
    for ch, n in counts.most_common():
        print(f"   {n / sum(counts.values()):5.0%}  {'（結束）' if ch == END else ch}")

    print("\n── 2. 讓它自己接 20 個站名，存在嗎？")
    rng = random.Random(7)
    names = []
    while len(names) < 20:
        name = generate(model, rng)
        if name not in names:
            names.append(name)
    fake = [n for n in names if n not in STATIONS]
    for n in names:
        print(f"   {'✅' if n in STATIONS else '❌'} {n}")
    print(f"\n   {len(names)} 個裡面有 {len(fake)} 個根本不存在。")
    print("   每兩個相鄰的字都真的出現過，拼起來卻不一定是真的。")


if __name__ == "__main__":
    main()
