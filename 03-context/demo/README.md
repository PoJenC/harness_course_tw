# 03 Context 小專案：同一個任務，6 種工作桌

任務固定是「回覆王先生的延遲出貨抱怨信」，只改**桌上放哪些資料**，再用同一把尺打分。

| 檔案 | 用途 |
|---|---|
| `docs/` | 練習 3 的資料：A 抱怨信、B 訂單紀錄、D 2019 舊範本、E 2025 現行範本、G 物流公告、H 尾牙通知 |
| `docs_unlabeled/` | D、E 拿掉年份和「現行」後的版本（`範本.txt`、`範本(1).txt`），用來測「標清楚」|
| `context_demo.py` | `build_context()` 組裝、`check()` 打分（出貨日 4/17、免運券、沒給購物金、客服專線）|
| `runs/context_demo/` | 每封回信，檔名是「桌面_放了什麼-第幾次」，例如 `④_新舊都給，但沒標清楚-1.txt`；第一行是打分結果 |
| `traces/context_demo.txt` | 投影片引用的輸出（每種 3 次）|
| `traces/context_demo_run1_no_lang.txt` | 02「忘了寫繁體中文」那頁引用的舊輸出 |

```bash
python3 03-context/demo/context_demo.py          # 每種 3 次，共 18 次 haiku，約 2 分鐘
python3 03-context/demo/context_demo.py 1        # 現場時間不夠：每種 1 次
python3 03-context/demo/context_demo.py --show ⑥ # 只印出 ⑥ 實際送出的 prompt，不呼叫 AI
```

| 桌面 | 放了什麼 |
|---|---|
| ① | 什麼都不給 |
| ② | 什麼都不給，並要求「不要反問」|
| ③ | A、B、D（舊範本）|
| ④ | A、B、`範本.txt`、`範本(1).txt`（新舊都有，沒標清楚）|
| ⑤ | `docs/` 全部 |
| ⑥ | A、B、E、G（練習 3 的參考答案）|
