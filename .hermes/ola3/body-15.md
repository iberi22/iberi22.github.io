# [Ola 3.05] sec(virustotal-integrity): VirusTotal Scan Integration & Cryptographic Audit Ledger

> Ola 3 — Security & Trust.
> Labels: `ola3`, `wave-3` (pre-dispatch)

---

## Current State (MEDIBLE)
- Users need verifiable proof that the portfolio repo and static build contain 0 malware, 0 credential leaks, and 0 security vendor flags on VirusTotal.

## Desired State (DELTA)
- **Specific Addition**: Establish automated GitHub Actions workflow (`.github/workflows/security-scan.yml`), generate `.security/integrity-sha256.txt` ledger, and document VirusTotal verification in `SECURITY.md`.
- **File Target**: `.github/workflows/security-scan.yml`, `SECURITY.md`

## Web Research Required
1. search: "VirusTotal URL scanner API and GitHub Actions verification"
2. search: "Automated secret leak detection in GitHub Actions"

## Acceptance Criteria (VERIFICABLES POR COMANDO)
- [ ] `test -f .github/workflows/security-scan.yml` — exits 0
- [ ] `test -f SECURITY.md` — exits 0
- [ ] `grep -rn "VirusTotal" SECURITY.md` >= 1 match

## Files to Modify
| File | Current State | Change | Risk |
|------|--------------|--------|------|
| `.github/workflows/security-scan.yml` | Non-existent | Automated security scan | LOW |
| `SECURITY.md` | Non-existent | Security policy & VirusTotal guide | LOW |

## DO NOT touch
- `src/components/` — assigned to Issue #11
- `tests/` — assigned to Issue #14

## Anti-Hallucination Guard
1. Use standard GitHub Actions without unverified third-party actions.
2. Ensure secret scanner checks for Anthropic, OpenAI, and Google API key patterns.

## Merge Order
- **Merge order within wave:** 5
- **Expected effort:** Small (<20m)
- **Parallel with:** Issues #11, #12, #13, #14
