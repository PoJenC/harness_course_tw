"""實驗 ⑦：證據檢查器抓得到假引用嗎？

不呼叫 AI。手寫三條證據（一條對、一條行號錯、一條內容被改），交給 check_evidence() 核對。

執行：python3 ex7_check_evidence.py
"""
from agent import check_evidence

SAMPLE = """大型家具清運公告.txt:3: 社區每月第二個星期六上午，統一請清潔公司清運大型家具。
大型家具清運公告.txt:5: 1. 最晚在清運日前一週的星期三，向管理室登記。
社區收費標準.txt:6: 大型家具清運：每件 500 元。"""


def main():
    for text, ok, why in check_evidence(SAMPLE):
        print(f"{'✅' if ok else '❌'} {text}\n   → {why}")


if __name__ == "__main__":
    main()
