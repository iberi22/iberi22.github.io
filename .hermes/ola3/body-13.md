# [Ola 3.03] feat(unified-skill): Production AI Pipeline Orchestrator Skill & Rate-Limit Engine

> Ola 3 — Infrastructure & Agent Skills.
> Labels: `ola3`, `wave-3` (pre-dispatch)

---

## Current State (MEDIBLE)
- Users need an actionable, unified custom skill (`SKILL.md`) that guides multi-agent orchestration, dynamic concurrency, and rate-limiting scripts for active developer subscriptions (Google AI Pro, Claude Pro, OpenAI Plus, OpenRouter, Ollama).

## Desired State (DELTA)
- **Specific Addition**: Publish unified `public/skills/swal-pipeline-orchestrator/SKILL.md` with rate-limiter (`scripts/swal-rate-limiter.sh`) and token monitor (`scripts/swal-token-monitor.py`).
- **File Target**: `public/skills/swal-pipeline-orchestrator/SKILL.md`, `scripts/`

## Web Research Required
1. search: "AI agent skill specification standard SKILL.md format"
2. search: "Anthropic Claude Code CLI subagents custom tools"

## Acceptance Criteria (VERIFICABLES POR COMANDO)
- [ ] `test -f public/skills/swal-pipeline-orchestrator/SKILL.md` — exits 0
- [ ] `bash scripts/swal-rate-limiter.sh` — outputs initialized confirmation
- [ ] `python3 scripts/swal-token-monitor.py 200` — returns valid JSON spend estimation

## Files to Modify
| File | Current State | Change | Risk |
|------|--------------|--------|------|
| `public/skills/swal-pipeline-orchestrator/SKILL.md` | Non-existent | Create unified skill | LOW |
| `scripts/swal-rate-limiter.sh` | Non-existent | Create rate limiter script | LOW |
| `scripts/swal-token-monitor.py` | Non-existent | Create token monitor script | LOW |

## DO NOT touch
- `src/components/ResourceSimulator.svelte` — assigned to Issue #11
- `tests/` — assigned to Issue #14

## Anti-Hallucination Guard
1. Use standard POSIX bash and Python 3 syntax with zero external pip dependencies.
2. Never include hardcoded API keys in skill examples.

## Merge Order
- **Merge order within wave:** 3
- **Expected effort:** Small (<30m)
- **Parallel with:** Issues #11, #12, #14, #15
