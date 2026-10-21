"""把封面和各章的 slides.md 合併成整場的 slide_total.md。

執行：python3 slides/build_slides.py，或在 slides/ 裡 npm run slides（改過任何一章之後都要重跑）
- 各章在上一層資料夾（00-opening/ … 07-summary/）
- 封面、主題、字型、講者時間表在 cover.md
- 每章第一頁和休息頁，自動套用 layout: section（置中的章節封面）
"""
from pathlib import Path

HERE = Path(__file__).parent
CHAPTERS = HERE.parent
BREAK = "# ☕ 休息 10 分鐘"
ORDER = ["00-opening", "01-ai-basics", "02-prompt", BREAK, "03-context", "04-harness", BREAK,
         "05-loop-skill", "06-bonus", "07-summary"]
SECTION = "\n\n---\nlayout: section\n---\n\n"

parts = [(HERE / "cover.md").read_text(encoding="utf-8").strip()]
for item in ORDER:
    parts.append(item if item == BREAK else (CHAPTERS / item / "slides.md").read_text(encoding="utf-8").strip())
(HERE / "slide_total.md").write_text(SECTION.join(parts) + "\n", encoding="utf-8")
print(f"已產生 slide_total.md（封面＋{len(ORDER)} 段）")
