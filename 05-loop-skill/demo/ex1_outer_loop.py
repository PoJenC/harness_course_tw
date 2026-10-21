"""實驗 ①：它說「完成了」，誰來驗收？同一家迷你商店（04），三種做法各跑 N 次。

  A 沒有驗收：AI 只能讀寫，說完成就算完成
  B 外層驗收：AI 只能讀寫；交件後由「我的程式」跑測試，沒過就附上證據，請它再做一輪
  C 內層自己測：AI 手上有 run_tests，邊寫邊測（04 的 L2）

執行：python3 05-loop-skill/demo/ex1_outer_loop.py [每種次數，預設 3]（需要 podman）
每次的完整對話在 runs/ex1_outer_loop/<做法>-<第幾次>/log.txt。
"""
import shutil
import sys
from pathlib import Path

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE.parent.parent / "04-harness" / "demo"))   # 延用 04 的 harness 和迷你商店
from harness import HERE as SHOP, MODEL, Log, agent, grade, run_tests  # noqa: E402

RUNS = HERE / "runs" / "ex1_outer_loop"
TIMES = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else 3

TASK = ("客人抱怨：金卡會員買 199 元的商品，結帳畫面顯示 159.20000000000002 元。"
        "請修好 shop/discount.py，計算規則請照 README.md。")
READ_WRITE = ["list_files", "read_file", "write_file", "done"]
WITH_TESTS = READ_WRITE[:-1] + ["run_tests", "done"]


def passed(report: str) -> bool:
    return report.strip().splitlines()[-1:] == ["OK"]


def outer_loop(work: Path, log: Log, max_rounds: int = 3, budget: float = 0.02) -> dict:
    """外層迴圈：AI 說完成 → 我的程式驗收 → 沒過就附上證據再來一輪。每個 return 都是一個出口。"""
    prompt, last_error = TASK, None
    total = {"steps": 0, "cost": 0.0, "rounds": 0, "exit": ""}
    for r in range(1, max_rounds + 1):
        log.write("外層", f"第 {r} 輪")
        s = agent(prompt, work, READ_WRITE, log)
        total["steps"] += s["steps"]
        total["cost"] += s["cost"]
        total["rounds"] = r
        report = run_tests(work)                      # 用「我的」測試驗收，AI 碰不到
        log.write("外層驗收", report)
        if passed(report):
            total["exit"] = "✅ 通過"
            return total
        if report == last_error:
            total["exit"] = "⛔ 沒有進展"
            return total
        if total["cost"] > budget:
            total["exit"] = "⛔ 超出預算"
            return total
        last_error = report
        prompt = f"{TASK}\n\n你上一輪說完成了，但我的驗收沒通過，證據：\n{report}"   # 只給證據，不給答案
    total["exit"] = "⛔ 達到輪數上限"
    return total


WAYS = {
    "A_沒有驗收": lambda work, log: {**agent(TASK, work, READ_WRITE, log), "rounds": 1, "exit": "AI 說完成"},
    "B_外層驗收": outer_loop,
    "C_內層自己測": lambda work, log: {**agent(TASK, work, WITH_TESTS, log), "rounds": 1, "exit": "AI 說完成"},
}

shutil.rmtree(RUNS, ignore_errors=True)
print(f"模型 {MODEL}，每種 {TIMES} 次\n")
print(f"{'做法':<10}{'次':<3}{'驗收':<6}{'輪數':<5}{'步數':<5}{'花費':<10}出口")
summary = {}
for name, way in WAYS.items():
    for i in range(1, TIMES + 1):
        run = RUNS / f"{name}-{i}"
        work = run / "project"
        shutil.copytree(SHOP / "project", work)
        s = way(work, Log(run / "log.txt"))
        g = grade(work)
        summary.setdefault(name, []).append((g, s))
        print(f"{name:<10}{i:<3}{g['passed']}/{g['total']:<4}{s['rounds']:<6}{s['steps']:<6}${s['cost']:<9.4f}{s['exit']}")

print(f"\n{'做法':<10}{'全對次數':<8}{'各次分數':<12}{'平均步數':<8}平均花費")
for name, rows in summary.items():
    full = sum(g["passed"] == g["total"] for g, _ in rows)
    scores = ", ".join(str(g["passed"]) for g, _ in rows)
    steps = sum(s["steps"] for _, s in rows) / len(rows)
    avg = sum(s["cost"] for _, s in rows) / len(rows)
    print(f"{name:<10}{full}/{len(rows):<7}{scores:<12}{steps:<10.1f}${avg:.4f}")
