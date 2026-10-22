"""實驗 ⑤：同一句話，放的位置不同，結果會差多少？

A、B 兩組只差一個地方：「答案最後要附上證據」這句規定
  A  接在問題後面（Human）
  B  放在 System（工作守則）
其他全部一樣：同一題、同一個迴圈、同一顆 AI、最多 6 步。各跑 N 次（預設 5 次）。
每次的完整對話存在 runs/ex5_wording/組別-第幾次.txt

執行：python3 ex5_wording.py [N]   （每次約 5～7 次 haiku）
"""
import shutil
import sys
from pathlib import Path

from agent import EVIDENCE_RULE, QUESTION, SYSTEM, check_evidence, grade, run_agent

RUNS = Path(__file__).parent / "runs" / "ex5_wording"
GROUPS = {
    "A_規定在問題裡": {"system": SYSTEM, "question": f"{QUESTION}\n{EVIDENCE_RULE}"},
    "B_規定在System": {"system": f"{SYSTEM}\n{EVIDENCE_RULE}", "question": QUESTION},
}


def first_tool(log: Path) -> str:
    """紀錄裡 AI 的第一個動作。"""
    for line in log.read_text(encoding="utf-8").splitlines():
        if line.startswith("{"):
            return line[:40]
    return "—"


def main():
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 5
    shutil.rmtree(RUNS, ignore_errors=True)
    RUNS.mkdir(parents=True)
    for name, setup in GROUPS.items():
        for i in range(1, n + 1):
            log = RUNS / f"{name}-{i}.txt"
            r = run_agent(setup["question"], system=setup["system"], log=log)
            text = log.read_text(encoding="utf-8")
            opened = "有" if '"path": "管理室聯絡方式.txt"' in text else "沒有"
            if r["answer"] is None:
                status = "沒有作答（步數用完）"
            else:
                ev = check_evidence(r["answer"])
                status = f"答案 {5 - len(grade(r['answer']))}/5  證據 {sum(ok for _, ok, _ in ev)}/{len(ev)}"
            print(f"{name}-{i}  {r['steps']} 步  ${r['cost']:.4f}  {status}"
                  f"  ｜第一步 {first_tool(log)}｜打開管理室公告：{opened}", flush=True)


if __name__ == "__main__":
    main()
