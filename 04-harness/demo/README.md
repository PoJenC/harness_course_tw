# 04 Harness 小專案：迷你商店

一個約 170 行的 harness（`harness.py`），把 Harness 的四件事各用幾十行做出來：

| | 在哪裡 |
|---|---|
| 🧰 工具 | `TOOLS`：給 AI 看的按鈕說明書；`call_tool()` 照它要的按鈕執行 |
| 🔒 權限 | `check_read()` 只能讀專案資料夾；`check_write()` 只能寫 `shop/` |
| 📦 沙箱 | `in_sandbox()`：複製一份專案＋講師的測試，在 podman 容器裡跑（不能上網、唯讀）|
| 📜 紀錄 | `Log`：每一步寫進 `log.txt` |

| 檔案 | 用途 |
|---|---|
| `project/` | AI 看得到的專案：README（規則）、`shop/rates.py`、`shop/discount.py`（有 bug）|
| `hidden_tests/` | 講師的 7 個驗收測試和評分程式，AI 讀不到，每次跑才複製進沙箱 |
| `reference/discount.py` | 講師正解：7/7 |
| `ex1_ladder.py` | 實驗 ①：L0 沒工具、L1 讀寫、L2 讀寫＋跑測試，每關 N 次 |
| `ex2_boundary.py` | 實驗 ②：故意叫它讀講師的測試、改 README，看 harness 擋不擋得住 |
| `runs/ex1_ladder/` | 實驗 ① 每次的 `log.txt`（完整對話）和 `project/`（AI 改完的專案），資料夾名稱是「關_手上有什麼-第幾次」，例如 `L2_能跑測試-1/` |
| `runs/ex2_boundary/` | 實驗 ② 的 `log.txt` 和 `project/` |
| `traces/` | 投影片引用的輸出 |

**故意埋的坑**：測試裡有一筆「收銀機實際送來的資料」，會員代號是大寫的 `GOLD`。README 沒寫，程式碼裡也看不出來，只有跑測試才會看到 `KeyError: 'GOLD'`。

```bash
python3 04-harness/demo/ex2_boundary.py      # 約 5 次 haiku，30 秒
python3 04-harness/demo/ex1_ladder.py        # 每關 3 次，約 50 次 haiku，3～4 分鐘
python3 04-harness/demo/ex1_ladder.py 1      # 現場時間不夠：每關 1 次
```

需要 podman 和 `python:3.12-slim` 映像檔（`podman pull python:3.12-slim`）。
AI 寫的程式只在容器裡執行；`harness.py` 本身在本機執行。
