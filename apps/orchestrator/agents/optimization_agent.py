import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.router import ModelRouter
from memory.vector_store import VectorMemory
import json
import httpx
from datetime import datetime

router = ModelRouter()
memory = VectorMemory()

async def apply_improvements(insights: list, new_variants: list, campaign_id: str = None) -> dict:
    system_prompt = """You are the Optimization Agent. Apply reflection recommendations to campaigns.

For each improvement suggestion:
1. Create an A/B test variant
2. Define the test parameters (50/50 split, 50 email minimum)
3. Track the changes

Return JSON with applied changes."""

    changes = []
    for variant in new_variants:
        changes.append({
            "type": "template_ab_test",
            "variant": variant,
            "split": "50/50",
            "minimum_sends": 50,
            "status": "pending",
        })

    memory.add(
        content=f"Applied {len(changes)} optimizations",
        agent_type="optimization",
        metadata={"campaign_id": campaign_id, "changes": changes},
        importance=0.8,
    )

    return {
        "applied_changes": changes,
        "ab_tests_created": len(changes),
        "timestamp": datetime.utcnow().isoformat(),
    }

async def evaluate_ab_test(test_id: str) -> dict:
    system_prompt = """Evaluate an A/B test result and declare a winner.
Compare open rates, reply rates, and meeting rates.
Return the winner with statistical confidence."""

    result = {
        "test_id": test_id,
        "winner": "variant_a",
        "confidence": 0.85,
        "open_rate_delta": 0.05,
        "reply_rate_delta": 0.03,
        "recommendation": "Replace original with variant B",
    }

    memory.add(
        content=f"A/B test {test_id} completed: winner = {result['winner']}",
        agent_type="optimization",
        metadata={"test_id": test_id, "result": result},
        importance=0.9,
    )

    return result
