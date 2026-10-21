"""實驗 ②：把坑寫進手冊（Skill）。04 的 L2 每次都先撞 KeyError: 'GOLD'，寫進手冊之後呢？

  沒有手冊：04 的 L2（讀、寫、跑測試）
  有手冊：  一樣的工具；System 只多一行手冊的標題，內容要它自己用 read_file 打開

執行：python3 05-loop-skill/demo/ex2_skill.py [每種次數，預設 3]（需要 podman）
每次的完整對話在 runs/ex2_skill/<有沒有手冊>-<第幾次>/log.txt。
"""
import shutil
import sys
from pathlib import Path

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE.parent.parent / "04-harness" / "demo"))   # 延用 04 的 harness 和迷你商店
from harness import HERE as SHOP, MODEL, Log, agent, grade, system_prompt  # noqa: E402

RUNS = HERE / "runs" / "ex2_skill"
TIMES = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else 3

TASK = ("客人抱怨：金卡會員買 199 元的商品，結帳畫面顯示 159.20000000000002 元。"
        "請修好 shop/discount.py，計算規則請照 README.md。")
TOOLS = ["list_files", "read_file", "write_file", "run_tests", "done"]


def skill_line(path: Path) -> str:
    """平常只把手冊開頭的 description 放進 System，整份內容要用時才打開。"""
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.startswith("description:"):
            return f"- skills/{path.name}：{line.removeprefix('description:').strip()}"
    return f"- skills/{path.name}"


SKILLS = sorted((HERE / "skills").glob("*.md"))
WITH_SKILL = (system_prompt(TOOLS) + "\n\n團隊手冊（用 read_file 打開）：\n"
              + "\n".join(skill_line(p) for p in SKILLS))

WAYS = {"沒有手冊": None, "有手冊": WITH_SKILL}

shutil.rmtree(RUNS, ignore_errors=True)
print(f"模型 {MODEL}，每種 {TIMES} 次\n")
print(f"{'':<6}{'次':<3}{'驗收':<6}{'步數':<5}{'跑測試':<6}{'讀手冊':<6}花費")
summary = {}
for name, system in WAYS.items():
    for i in range(1, TIMES + 1):
        run = RUNS / f"{name}-{i}"
        work = run / "project"
        shutil.copytree(SHOP / "project", work)
        if system:
            shutil.copytree(HERE / "skills", work / "skills")
        log = Log(run / "log.txt")
        s = agent(TASK, work, TOOLS, log, system)
        read_skill = '"path": "skills/' in (run / "log.txt").read_text(encoding="utf-8")
        g = grade(work)
        summary.setdefault(name, []).append((g, s, read_skill))
        print(f"{name:<6}{i:<3}{g['passed']}/{g['total']:<4}{s['steps']:<6}{s['tests_run']:<7}"
              f"{'✅' if read_skill else '—':<5}${s['cost']:.4f}")

print(f"\n{'':<6}{'全對次數':<8}{'平均步數':<8}{'平均跑測試':<8}平均花費")
for name, rows in summary.items():
    n = len(rows)
    full = sum(g["passed"] == g["total"] for g, _, _ in rows)
    steps = sum(s["steps"] for _, s, _ in rows) / n
    tests = sum(s["tests_run"] for _, s, _ in rows) / n
    avg = sum(s["cost"] for _, s, _ in rows) / n
    print(f"{name:<6}{full}/{n:<7}{steps:<10.1f}{tests:<11.1f}${avg:.4f}")
