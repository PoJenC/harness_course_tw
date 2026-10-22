"""實驗 ⑥：用同一把尺比較模型。

同一題、同一個迴圈、證據規定放在 System（實驗 ⑤ 的 B 組），換 haiku、sonnet、opus 各跑 N 次（預設 3 次）。
每次的完整對話存在 runs/ex6_models/模型-第幾次.txt

執行：python3 ex6_models.py [N]   （約 30～40 次模型呼叫，opus 比較貴）
"""
import shutil
import sys
from pathlib import Path

from agent import EVIDENCE_RULE, FACTS, QUESTION, SYSTEM, check_evidence, grade, run_agent

RUNS = Path(__file__).parent / "runs" / "ex6_models"
MODELS = {"haiku": "claude-haiku-5-5", "sonnet": "claude-sonnet-5-5", "opus": "claude-opus-5-5"}


def main():
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 3
    shutil.rmtree(RUNS, ignore_errors=True)
    RUNS.mkdir(parents=True)
    print(f"{'模型':<8}{'答案':>6}{'證據':>8}{'步數':>5}{'花費':>10}{'時間':>7}")
    for name, model in MODELS.items():
        for i in range(1, n + 1):
            r = run_agent(QUESTION, system=f"{SYSTEM}\n{EVIDENCE_RULE}", model=model, log=RUNS / f"{name}-{i}.txt")
            ev = check_evidence(r["answer"])
            facts = f"{len(FACTS) - len(grade(r['answer']))}/{len(FACTS)}" if r["answer"] else "—"
            evidence = f"{sum(ok for _, ok, _ in ev)}/{len(ev)}"
            print(f"{name + '-' + str(i):<8}{facts:>6}{evidence:>8}{r['steps']:>5}"
                  f"{'$' + format(r['cost'], '.4f'):>10}{r['sec']:>6.0f}s", flush=True)
            for text, ok, why in ev:
                if not ok:
                    print(f"      ❌ {text} → {why}")


if __name__ == "__main__":
    main()
