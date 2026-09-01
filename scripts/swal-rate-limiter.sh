#!/usr/bin/env bash
# ==============================================================================
# SWAL Local Rate Limiter & Concurrency Throttler
# Prevents 429 Too Many Requests across Google AI, Claude, and OpenRouter APIs
# ==============================================================================
set -euo pipefail

PROVIDER="${1:-openrouter}"
MAX_RPM="${2:-60}"
REQUEST_INTERVAL=$(awk -v rpm="$MAX_RPM" 'BEGIN { printf "%.2f", 60.0 / rpm }')

echo "🛡️ [SWAL Rate-Limiter] Provider: ${PROVIDER} | Max RPM: ${MAX_RPM} (Interval: ${REQUEST_INTERVAL}s)"

rate_limit_wait() {
    sleep "${REQUEST_INTERVAL}"
}

export -f rate_limit_wait
echo "✅ Rate-limiter initialized. Source this script or call 'rate_limit_wait' before dispatching agent tasks."
