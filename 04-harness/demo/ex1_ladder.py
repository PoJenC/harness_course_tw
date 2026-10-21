"""實驗 ①：同一顆 AI，只改它手上的工具。L0～L2 每關跑 N 次，用講師的測試打分。

執行：python3 04-harness/demo/ex1_ladder.py [每關次數，預設 3]（需要 podman 和 python:3.12-slim 映像檔）
每次的完整對話在 runs/ex1_ladder/<關>_<手上有什麼>-<第幾次>/log.txt，改完的專案在同一個資料夾的 project/。
"""
import re
import shutil
import sys

from harness import HERE, MODEL, Log, agent, ask, grade

RUNS = HERE / "runs" / "ex1_ladder"
TIMES = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else 3

TASK = ("客人抱怨：金卡會員買 199 元的商品，結帳畫面顯示 159.20000000000002 元。"
        "請修好 shop/discount.py，計算規則請照 README.md。")

LEVELS = {
    "L0": None,                                                        # 沒有工具，憑印象寫
    "L1": ["list_files", "read_file", "write_file", "done"],           # 能讀、能寫
    "L2": ["list_files", "read_file", "write_file", "run_tests", "done"],  # 再加上能跑測試
}

FOLDER = {"L0": "沒有工具", "L1": "能讀能寫", "L2": "能跑測試"}


def level0(work, log):
    """L0：沒有工具，只能把程式碼寫在回覆裡。"""
    system = "你是一位工程師，請用繁體中文。"
    prompt = TASK + "\n請直接回覆修好後的 shop/discount.py 完整內容，放在一個 ```python 區塊裡。"
    log.write("System", system)
    log.write("Human", prompt)
    reply, cost = ask(system, prompt)
    log.write("AI", reply)
    m = re.search(r"```(?:python)?\s*\n(.*?)```", reply, re.S)
    (work / "shop" / "discount.py").write_text(m.group(1) if m else reply, encoding="utf-8")
    return {"steps": 1, "blocked": 0, "cost": cost, "tests_run": 0}


shutil.rmtree(RUNS, ignore_errors=True)
print(f"模型 {MODEL}，每關 {TIMES} 次\n")
print(f"{'關':<4}{'次':<3}{'驗收':<6}{'上線':<5}{'步數':<5}{'跑測試':<6}花費")
summary = {}
for name, tools in LEVELS.items():
    for i in range(1, TIMES + 1):
        run = RUNS / f"{name}_{FOLDER[name]}-{i}"
        work = run / "project"
        shutil.copytree(HERE / "project", work)
        log = Log(run / "log.txt")
        stats = level0(work, log) if tools is None else agent(TASK, work, tools, log)
        g = grade(work)
        summary.setdefault(name, []).append((g, stats))
        print(f"{name:<4}{i:<3}{g['passed']}/{g['total']:<4}{'✅' if g['runtime_ok'] else '❌':<4}"
              f"{stats['steps']:<6}{stats['tests_run']:<7}${stats['cost']:.4f}")

print(f"\n{'關':<4}{'全對次數':<8}{'各次分數':<12}{'上線可用':<8}平均花費")
for name, rows in summary.items():
    full = sum(g["passed"] == g["total"] for g, _ in rows)
    scores = ", ".join(str(g["passed"]) for g, _ in rows)
    runtime = sum(g["runtime_ok"] for g, _ in rows)
    avg = sum(s["cost"] for _, s in rows) / len(rows)
    print(f"{name:<4}{full}/{len(rows):<7}{scores:<12}{runtime}/{len(rows):<7}${avg:.4f}")
