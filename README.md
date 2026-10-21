# 同一顆 AI，為什麼結果差這麼多？（3 小時分享版）

濃縮自 `../harness` 全天工作坊。給不寫 Python 的聽眾；6 個練習都用紙筆就能做，每題後面一頁是參考答案。

## 資料夾

| 資料夾 | 段落 | 時間 | 練習 |
|---|---|---|---|
| `00-opening/` | 開場：AI 的兩個習慣（🎲 猜測、⚡ 短路） | 10 分 | |
| `01-ai-basics/` | AI 到底在做什麼（接龍、token、記憶、呼叫方式、工具、評分與證據） | 30 分 | 練習 1：找出唬爛 |
| `02-prompt/` | 怎麼交代工作（Prompt） | 30 分 | 練習 2：聚餐需求單 |
| — | 休息 | 10 分 | |
| `03-context/` | 該給它看什麼（Context）＋ 現場示範 | 30 分 | 練習 3：挑資料上桌 |
| `04-harness/` | 給它什麼環境（Harness） | 30 分 | 練習 4：整理下載資料夾 |
| — | 休息 | 10 分 | |
| `05-loop-skill/` | 驗收與經驗（Loop、Skill） | 30 分 | 練習 5：當一次驗收的人、練習 6：報帳坑表 |
| `06-bonus/` | 加場快閃：兩張地圖（Embedding、Ontology，選講） | 0～10 分 | |
| `07-summary/` | 總結與 Q&A | 5 分 | |

每章資料夾裡有：
- `slides.md`：這一章的投影片內容，**要改內容就改這裡**
- `demo/`：這一章的示範程式和執行紀錄（00、06、07 沒有）

## 投影片：`slides/`

產生整場投影片用的檔案都集中在 `slides/`：

```
slides/
├── cover.md            封面頁、主題（seriph）、中文字型（Noto Sans TC）、轉場、講者時間表
├── build_slides.py     合併程式：cover.md ＋ 00～07 各章的 slides.md → slide_total.md
├── slide_total.md      整場投影片（自動產生，不要直接改）
├── style.css           全場樣式：標題、表格、📌 重點色塊、章節封面、封面
├── setup/mermaid.ts    流程圖配色
├── global-bottom.vue   右下角頁碼
├── package.json        一鍵指令（npm run …）
└── output/             產出：slide_total.pdf、dist/（靜態網頁）
```

合併時會在 02、04 後面插入休息頁，每章第一頁自動變成章節封面。

## 播放、匯出

用 [Slidev](https://sli.dev)（支援 Mermaid）。以下指令都在 `slides/` 裡執行，第一次先 `npm install`。每個指令都會先自動合併，所以改完任何一章直接跑就好：

```bash
cd slides
npm install       # 第一次：安裝 Slidev、seriph 主題、匯出用的瀏覽器
npm run dev       # 邊改邊看，瀏覽器自動打開 http://localhost:3030
npm run all       # 一次做完：output/slide_total.pdf ＋ output/dist/
npm run pdf       # 只匯出 PDF
npm run web       # 只打包網頁
npm run preview   # 預覽打包好的網頁：http://localhost:8080
```

`output/dist/` 整個資料夾可以直接放上任何靜態網站空間（GitHub Pages、Netlify 等）。

## 現場示範

只用 Python 標準函式庫，透過本機已登入的 `claude` CLI 呼叫（claude-haiku-5-5，不需要 API key）。

```bash
python3 02-prompt/demo/ex1_questions.py      # 02：先叫它列問題（2 次）
python3 02-prompt/demo/ex2_ladder.py 1       # 02：prompt 階梯，每階 1 次（5 次）
python3 03-context/demo/context_demo.py 1    # 03：6 種桌面，每種 1 次（6 次）
python3 04-harness/demo/ex2_boundary.py      # 04：叫它做不該做的事（約 5 次）
python3 04-harness/demo/ex1_ladder.py 1      # 04：L0～L2 每關 1 次（約 16 次，需要 podman）
python3 05-loop-skill/demo/ex2_skill.py 1    # 05：有手冊、沒手冊各 1 次（約 17 次，需要 podman）
```

- 不加數字就是投影片用的「每種 3 次」
- 每次的結果存在各自的 `demo/runs/<實驗名稱>/`，每支程式只會清掉自己的資料夾；投影片引用的輸出在 `demo/traces/`
- 細節見 `02-prompt/demo/README.md`、`03-context/demo/README.md`、`04-harness/demo/README.md`、`05-loop-skill/demo/README.md`

## 頁面標記

| 標記 | 意思 |
|---|---|
| 🎲 / ⚡ | 猜測 / 短路又出現了 |
| 🐍 | 講解用的 Python 範例（簡化版） |
| 🔬 實測 | 數字來自各章 `demo/` 的實際執行（claude-haiku-5-5），紀錄在 `demo/traces/` |
| 🔬 工作坊實測 | 只在 01，數字來自 `../harness` 工作坊的執行紀錄 |
| ✍️ / 📝 | 練習 / 參考答案 |
