# 01 AI 基礎：小實驗

只用 Python 標準函式庫；透過本機已登入的 `claude` CLI 呼叫（claude-haiku-5-5，不需要 API key）。

| 檔案 | 用途 |
|---|---|
| `llm.py` | `ask()`：呼叫 AI，回傳回答和帳單（token、花費、秒數）。直接執行就是「一行指令就能呼叫」那頁 |
| `ex1_next_token.py` | 實驗 ①：用台北捷運站名做迷你接龍，看它拼出不存在的站名（不呼叫 AI）|
| `ex2_tokens.py` | 實驗 ②：日常文字各是幾個 token（7 次 haiku）|
| `ex3_memory.py` | 實驗 ③：停車位 B2-37，開新對話 vs 接續對話（4 次 haiku）|
| `ex4_whoami.py` | 實驗 ④：問「我是誰」，預設設定 vs 隔離設定（2 次 haiku，email 自動遮蔽）|
| `notices/` | 10 份虛構的社區公告，給智能體查資料 |
| `agent.py` | 智能體迴圈（最多 6 步），以及兩種評分：對答案 `grade()`、查證據 `check_evidence()` |
| `ex5_wording.py` | 實驗 ⑤：「附上證據」這句規定放在問題裡（A）或 System（B），各跑 5 次 |
| `ex6_models.py` | 實驗 ⑥：同一題、同一個迴圈（B 組設定），haiku／sonnet／opus 各跑 3 次 |
| `ex7_check_evidence.py` | 實驗 ⑦：拿改過的證據測試檢查器（不呼叫 AI）|
| `runs/` | ⑤⑥ 每次的完整對話，例如 `runs/ex5_wording/A_規定在問題裡-2.txt`、`runs/ex6_models/opus-3.txt` |
| `traces/` | 投影片引用的輸出 |

```bash
python3 01-ai-basics/demo/ex1_next_token.py
python3 01-ai-basics/demo/ex5_wording.py           # A、B 各 5 次，約 10 分鐘
python3 01-ai-basics/demo/ex5_wording.py 1         # A、B 各 1 次
python3 01-ai-basics/demo/ex6_models.py 1          # 三種模型各 1 次
```
