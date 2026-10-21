# 02 Prompt 小專案：迷你版 prompt 階梯

把原本工作坊第 3 章的實驗（CBMP、Maven、podman）縮成只用 Python 標準函式庫的版本。

| 檔案 | 用途 |
|---|---|
| `company_errors.py` | 迷你「公司框架」：`ValidationError(field)`、`BusinessError(code)`。AI 沒看過它 |
| `prompts.py` | P0～P4 五階 prompt、`build_prompt()`、`ask()`（隔離設定，含關閉記憶）|
| `acceptance_test.py` | 講師的 7 個驗收測試 |
| `grade.py` | 跑驗收測試＋上線檢查（漏傳金額 None 時不能當掉），輸出 JSON |
| `reference/transfer.py` | 講師正解：7/7、上線可用 |
| `ex1_questions.py` | 實驗 ①：P0、P4 各叫 AI 列問題（2 次 haiku）|
| `ex2_ladder.py` | 實驗 ②：P0～P4 各跑 N 次並打分（預設 15 次 haiku，約 3 分鐘）|
| `runs/ex2_ladder/` | 實驗 ② 每次產生的 `answer.md`、`transfer.py`，資料夾名稱是「階_加了什麼-第幾次」，例如 `P3_加範例-2/` |
| `traces/` | 投影片引用的輸出 |

```bash
python3 02-prompt/demo/ex1_questions.py
python3 02-prompt/demo/ex2_ladder.py            # 每階 3 次
python3 02-prompt/demo/ex2_ladder.py 1          # 時間不夠：每階 1 次
python3 02-prompt/demo/ex2_ladder.py --regrade  # 不呼叫 AI，用 runs/ex2_ladder/ 重新評分
```

⚠️ AI 產生的程式直接在本機執行（有 30 秒逾時）。這是示範用；真實情況請放進沙箱（見 04 Harness）。
