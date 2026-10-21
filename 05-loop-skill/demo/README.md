# 05 Loop、Skill 小專案：延用 04 的迷你商店

兩個實驗都直接用 `04-harness/demo/` 的 `harness.py`、`project/`（迷你商店）和 `hidden_tests/`（講師的 7 個測試），所以需要 podman。

| 檔案 | 用途 |
|---|---|
| `ex1_outer_loop.py` | 實驗 ①：A 沒有驗收、B 外層驗收（沒過就附證據再來一輪）、C 內層自己測，每種 N 次 |
| `ex2_skill.py` | 實驗 ②：04 的 L2，有手冊和沒手冊各 N 次 |
| `skills/shop.md` | 手冊（Skill）：開頭的 `description` 會放進 System；內容要 AI 自己用 `read_file` 打開 |
| `runs/ex1_outer_loop/` | 實驗 ① 每次的 `log.txt` 和 `project/`，資料夾名稱是「做法-第幾次」，例如 `B_外層驗收-2/` |
| `runs/ex2_skill/` | 實驗 ② 每次的 `log.txt` 和 `project/`，例如 `有手冊-1/` |
| `traces/` | 投影片引用的輸出 |

```bash
python3 05-loop-skill/demo/ex1_outer_loop.py     # 每種 3 次
python3 05-loop-skill/demo/ex2_skill.py          # 每種 3 次
python3 05-loop-skill/demo/ex2_skill.py 1        # 現場時間不夠：每種 1 次
```

外層迴圈的出口（`outer_loop()`）：驗收通過、錯誤和上一輪一模一樣（沒有進展）、超出預算（US$0.02）、達到輪數上限（3 輪）。
