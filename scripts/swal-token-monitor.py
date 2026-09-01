#!/usr/bin/env python3
"""
SWAL Token Monitor & Spend Estimator
Calculates token velocity and tracks spend vs. defined budget limit.
"""
import sys
import json

def estimate_spend(daily_prompts: int, avg_tokens: int, cost_per_m_input: float, cost_per_m_output: float) -> dict:
    daily_input = daily_prompts * avg_tokens * 0.7
    daily_output = daily_prompts * avg_tokens * 0.3
    
    monthly_input_m = (daily_input * 30) / 1_000_000
    monthly_output_m = (daily_output * 30) / 1_000_000
    
    total_cost = (monthly_input_m * cost_per_m_input) + (monthly_output_m * cost_per_m_output)
    
    return {
        "monthly_tokens_m": round(monthly_input_m + monthly_output_m, 2),
        "estimated_monthly_usd": round(total_cost, 2),
        "daily_prompts": daily_prompts,
    }

if __name__ == "__main__":
    prompts = int(sys.argv[1]) if len(sys.argv) > 1 else 150
    result = estimate_spend(prompts, avg_tokens=2000, cost_per_m_input=0.15, cost_per_m_output=0.60)
    print(json.dumps(result, indent=2))
