"""實驗 ②：prompt 階梯。P0～P4 每階跑 N 次，用同一把尺（7 個驗收測試＋上線檢查）打分數。

執行：python3 02-prompt/demo/ex2_ladder.py [每階次數，預設 3]（共 5×N 次 haiku）
     python3 02-prompt/demo/ex2_ladder.py --regrade（不呼叫 AI，用 runs/ex2_ladder/ 裡現有的程式碼重新評分）

每次產生的程式碼都留在 runs/ex2_ladder/<階>_<加了什麼>-<第幾次>/transfer.py，分數不如預期時可以打開來查原因。
⚠️ 示範用：AI 寫的程式直接在本機執行（有逾時保護）。真實情況請放進沙箱（見 04 Harness）。
"""
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

from prompts import LADDER, MODEL, ask, build_prompt

HERE = Path(__file__).parent
RUNS = HERE / "runs" / "ex2_ladder"
REGRADE = "--regrade" in sys.argv
FOLDER = {"P0": "只有任務", "P1": "加需求", "P2": "加限制", "P3": "加範例", "P4": "加驗收"}
TIMES = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else 3


def extract_code(answer: str) -> str:
    """取出回答裡第一個 ```python 區塊；沒有區塊就當作整段都是程式碼。"""
    m = re.search(r"```(?:python|py)?\s*\n(.*?)```", answer, re.S)
    return m.group(1) if m else answer


def grade(project: Path) -> dict:
    """把公司框架、驗收測試、評分程式放進專案（每次都覆蓋），執行並讀回分數。"""
    for name in ["company_errors.py", "acceptance_test.py", "grade.py"]:
        shutil.copy(HERE / name, project / name)
    try:
        out = subprocess.run([sys.executable, "-B", "grade.py"], cwd=project,
                             capture_output=True, text=True, timeout=30).stdout
        return json.loads(out.strip().splitlines()[-1])
    except Exception as e:
        return {"passed": 0, "total": 7, "runtime_ok": False, "error": f"評分失敗：{e}"[:120]}


if not REGRADE:
    shutil.rmtree(RUNS, ignore_errors=True)
print(f"模型 {MODEL}，每階 {TIMES} 次{'（重新評分）' if REGRADE else ''}\n")
print(f"{'階':<4}{'次':<3}{'驗收':<7}{'上線':<5}{'花費':<10}失敗原因（節錄）")
summary = {}
for name, spec in LADDER.items():
    prompt = build_prompt(spec)
    for i in range(1, TIMES + 1):
        project = RUNS / f"{name}_{FOLDER[name]}-{i}"
        if REGRADE:
            cost = json.loads((project / "cost.json").read_text())["usd"]
        else:
            answer, cost = ask(prompt)
            project.mkdir(parents=True)
            (project / "answer.md").write_text(answer, encoding="utf-8")
            (project / "transfer.py").write_text(extract_code(answer), encoding="utf-8")
            (project / "cost.json").write_text(json.dumps({"usd": cost}))
        g = grade(project)
        summary.setdefault(name, []).append((g, cost))
        print(f"{name:<4}{i:<3}{g['passed']}/{g['total']:<5}{'✅' if g['runtime_ok'] else '❌':<4}"
              f"${cost:<9.4f}{g['error']}")

print(f"\n{'階':<4}{'新增':<6}{'全對次數':<8}{'各次分數':<14}{'上線可用':<8}平均花費")
added = {"P0": "—", "P1": "需求", "P2": "限制", "P3": "範例", "P4": "驗收"}
for name, rows in summary.items():
    full = sum(g["passed"] == g["total"] for g, _ in rows)
    scores = ", ".join(str(g["passed"]) for g, _ in rows)
    runtime = sum(g["runtime_ok"] for g, _ in rows)
    avg = sum(c for _, c in rows) / len(rows)
    print(f"{name:<4}{added[name]:<6}{full}/{len(rows):<7}{scores:<14}{runtime}/{len(rows):<7}${avg:.4f}")
