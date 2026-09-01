---
name: swal-pipeline-orchestrator
description: Unified multi-agent pipeline orchestrator with dynamic subscription rate-limiting, local hardware offloading, and deterministic code micro-fragmentation.
version: 1.0.0
author: Brahyan Belalcázar (iberi22)
tags: [ai-orchestration, jules, claude-code, openrouter, rate-limiter, local-first]
---

# SKILL: SWAL Pipeline & AI Resource Orchestrator

## Overview
This skill unifies the orchestration of multi-agent development workflows across developer subscriptions (*Google AI Pro / Jules, Anthropic Claude Pro / Claude Code, OpenAI Plus / Pro, OpenRouter API, and Local Ollama/vLLM*).

## Key Capabilities & Operating Principles
1. **Dynamic Concurrency Control**:
   - **Google AI Pro (Jules)**: Up to 15 concurrent wave tasks (100 runs per 24 hours).
   - **Claude Pro/Team**: Up to 5 subagents via Claude Code CLI.
   - **OpenRouter / DeepSeek**: Rate-limited token dispatching for cost-optimized parallel reviews.
   - **Local Ollama / vLLM**: 100% private offline triage, syntax linting, and local test execution ($0 spend).

2. **Code Micro-Fragmentation Protocol**:
   - Target maximum <150 lines per issue/task.
   - Disjoint file islands: Zero overlapping modified files across concurrent workers.
   - Deterministic 4-Phase Cycle: Read → Surgical Edit → Unit Verification → Automated PR.

3. **Attached Operational Scripts**:
   - `scripts/swal-rate-limiter.sh`: CLI token & RPM/TPM rate limiter to prevent API throttling and 429 errors.
   - `scripts/swal-token-monitor.py`: Real-time session token consumption and budget tracking.

## Usage in CLI Harnesses
- **Claude Code**: Inject as a system directive or custom tool.
- **Jules Wave**: Link in wave prompts as the canonical architectural guideline.
- **Hermes / OpenClaw**: Reference as the core orchestration protocol.
