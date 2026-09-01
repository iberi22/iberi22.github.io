#!/usr/bin/env python3
"""
swal-issue-contract-auditor — Auditor local de contratos de delegación (stdlib only).

Uso:
  python3 audit_issue_contracts.py --repo . --issue-file .github/ISSUE_TEMPLATE/bug_report.md --json /tmp/audit.json
  python3 audit_issue_contracts.py --repo . --issue-body "$(cat issue.md)" --json /tmp/audit.json
  python3 audit_issue_contracts.py --repo . --issue-body "..." --md /tmp/audit.md

Score 0-100 en 12 dimensiones + bonus CodeGraph. Sin dependencias, sin network.
"""
from __future__ import annotations
import argparse, json, re, pathlib, datetime, sys, os

DIMENSIONS = [
    ("current_state", "Current State medible", [r"current\s*state", r"audit\s*\d{4}", r"found\s*:", r"coverage|CO\s*\d+/\d+"]),
    ("desired_state", "Desired State diff", [r"desired\s*state", r"files?\s*to\s*modify", r"DELTA"] ),
    ("web_research", "Web Research obligatorio", [r"web.*research", r"search\s*:", r"DBA|ICFES|Brave|Tavily", r"queries"] ),
    ("skills_order", "Skills orden canónico", [r"AGENTS\.md", r"SKILL\.md", r"curriculum|CONTENT_ERRORS"] ),
    ("critical_rules", "Reglas críticas (límites)", [r"max\s*15|máximo\s*15", r"REPLACE", r"validate.*0 errores|Errores:\s*0"] ),
    ("anti_errors", "Anti-errores codificados", [r"anti[- ]error|purga|prohibido|never.*semana|week.*semana"] ),
    ("territory", "Config + tabla W/territorio", [r"Files.*Territory|CREATE.*MODIFY.*FORBIDDEN", r"periodo.*ceil|W\d+.*W\d+|kebab-case"] ),
    ("patterns", "Existing Code Patterns", [r"Existing.*Pattern|gold.*reference|read.*before.*write|patrón"] ),
    ("acceptance", "Acceptance verificable", [r"npm.*validate|grep\s*-c|Errores:\s*0|Acceptance.*Criteria"] ),
    ("files_modify", "Files to Modify", [r"Files to Modify", r"\|\s*File\s*\|"] ),
    ("do_not_touch", "DO NOT touch", [r"DO NOT.*touch|Anti-Regres|FORBIDDEN|no tocar"] ),
    ("verification", "Verification + Anti-Empty-PR", [r"git status.*porcelain|git diff --stat|ANTI-EMPTY-PR|git ls-files"] ),
]
BONUS_PATTERNS = [r"codegraph_sync_commit|stable_id|xavier code query|\.xavier/codegraph\.json"]

def score_dimension(body: str, patterns: list[str]) -> tuple[int, list[str]]:
    hits = [p for p in patterns if re.search(p, body, flags=re.IGNORECASE | re.MULTILINE)]
    pts = 8 if hits else 0
    return pts, hits

def audit_issue(body: str) -> dict:
    results = []
    total = 0
    for key, label, pats in DIMENSIONS:
        pts, hits = score_dimension(body, pats)
        total += pts
        results.append({"key": key, "label": label, "score": pts, "max": 8, "hits": hits})
    bonus_hits = [p for p in BONUS_PATTERNS if re.search(p, body, flags=re.IGNORECASE)]
    bonus = 4 if bonus_hits else 0
    # cap 100
    total_capped = min(100, total + bonus)
    verdict = "listo para waves 10-15" if total_capped>=85 else ("listo para 3-5" if total_capped>=65 else ("1 a la vez" if total_capped>=40 else "drift garantizado"))
    gaps = sorted(results, key=lambda r: r["score"])[:3]
    return {
        "score": total_capped,
        "raw": total,
        "bonus": bonus,
        "bonus_hits": bonus_hits,
        "verdict": verdict,
        "dimensions": results,
        "top_gaps": [{"key": g["key"], "label": g["label"], "score": g["score"]} for g in gaps],
        "generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    }

def repo_signals(repo: pathlib.Path) -> dict:
    sig = {}
    for name in ["AGENTS.md", "CLAUDE.md", ".gitcore/features.json", ".xavier/codegraph.json", "xavier_memory.db"]:
        sig[name] = (repo / name).exists()
    # codegraph freshness
    cg = repo / ".xavier" / "codegraph.json"
    if cg.exists():
        try:
            age_days = (datetime.datetime.now().timestamp() - cg.stat().st_mtime)/86400
            sig["codegraph_age_days"] = round(age_days, 2)
            sig["codegraph_fresh"] = age_days < 7
        except Exception:
            sig["codegraph_fresh"] = None
    # git status hint
    sig["has_git"] = (repo / ".git").exists()
    return sig

def main():
    ap = argparse.ArgumentParser(description="Audita un issue-contrato 0-100 (12 dimensiones)")
    ap.add_argument("--repo", default=".", help="ruta del repo a auditar")
    ap.add_argument("--issue-file", help="ruta a archivo con body del issue")
    ap.add_argument("--issue-body", help="body del issue inline")
    ap.add_argument("--json", dest="json_out", help="ruta para audit.json")
    ap.add_argument("--md", dest="md_out", help="ruta para audit.md")
    args = ap.parse_args()

    body = ""
    if args.issue_file:
        body = pathlib.Path(args.issue_file).read_text(encoding="utf-8", errors="replace")
    elif args.issue_body:
        body = args.issue_body
    else:
        # try stdin
        if not sys.stdin.isatty():
            body = sys.stdin.read()
        else:
            ap.error("Falta --issue-file o --issue-body (o pipe por stdin)")
    if not body.strip():
        print("Body vacío — nada que auditar.", file=sys.stderr)
        sys.exit(2)

    repo = pathlib.Path(args.repo)
    audit = audit_issue(body)
    audit["repo"] = str(repo.resolve())
    audit["signals"] = repo_signals(repo)
    audit["body_chars"] = len(body)
    audit["body_lines"] = body.count("\n")+1

    if args.json_out:
        pathlib.Path(args.json_out).write_text(json.dumps(audit, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"JSON → {args.json_out}  score={audit['score']}  verdict={audit['verdict']}")
    else:
        print(json.dumps(audit, ensure_ascii=False, indent=2))

    if args.md_out:
        lines = [f"# Auditoría Issue-Contrato — {audit['score']}/100 — {audit['verdict']}", ""]
        lines.append(f"- Repo: `{audit['repo']}`  ·  Body: {audit['body_lines']} líneas / {audit['body_chars']} chars  ·  {audit['generated_at']}")
        lines.append(f"- Bonus L3 CodeGraph: {audit['bonus']}/4  hits={audit['bonus_hits'] or '—'}")
        lines.append("")
        lines.append("| # | Dimensión | Pts | Hits |")
        lines.append("|---|-----------|-----|------|")
        for i, d in enumerate(audit["dimensions"], 1):
            hits = ", ".join(f"`{h[:28]}…`" if len(h)>28 else f"`{h}`" for h in d["hits"]) or "—"
            lines.append(f"| {i} | {d['label']} | {d['score']}/8 | {hits} |")
        lines.append("")
        lines.append(f"**Total: {audit['score']}/100 — {audit['verdict']}**")
        lines.append("")
        lines.append("### Top 3 gaps priorizados")
        for g in audit["top_gaps"]:
            lines.append(f"- **{g['label']}** — {g['score']}/8 — añade evidencia/patrón para esta dimensión.")
        lines.append("")
        lines.append("### Señales del repo")
        for k,v in audit["signals"].items():
            lines.append(f"- `{k}`: {v}")
        pathlib.Path(args.md_out).write_text("\n".join(lines), encoding="utf-8")
        print(f"MD → {args.md_out}")

if __name__ == "__main__":
    main()
