import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.router import ModelRouter
from memory.vector_store import VectorMemory
import json
import httpx
from datetime import datetime, timedelta

router = ModelRouter()
memory = VectorMemory()

async def run_reflection(campaign_id: str = None, days: int = 7) -> dict:
    metrics = await _fetch_metrics(days)

    system_prompt = """You are the Reflection Agent. Analyze campaign performance and identify improvements.

Analyze:
1. Email open rates by template
2. Reply rates by template
3. Meeting booking rates
4. Best performing patterns
5. Worst performing patterns

Generate:
- insights: key observations
- underperforming_templates: templates in bottom 20%
- improvement_suggestions: specific changes to make
- new_template_variants: improved versions of underperformers

Return JSON."""

    prompt = f"""Analyze the last {days} days of campaign performance:

{json.dumps(metrics, indent=2)}

Identify what's working, what's not, and suggest specific improvements."""

    response = await router.call(prompt, system=system_prompt, task_type="analysis")

    try:
        result = json.loads(response)
    except json.JSONDecodeError:
        result = {
            "insights": ["Need more data for meaningful analysis"],
            "underperforming_templates": [],
            "improvement_suggestions": ["Continue collecting data"],
            "new_template_variants": [],
        }

    memory.add(
        content=f"Reflection analysis: {json.dumps(result.get('insights', []))}",
        agent_type="reflection",
        metadata={"campaign_id": campaign_id, "days": days, "result": result},
        importance=0.8,
    )

    return {
        "insights": result.get("insights", []),
        "recommended_changes": result.get("improvement_suggestions", []),
        "new_variants": result.get("new_template_variants", []),
        "timestamp": datetime.utcnow().isoformat(),
    }

async def _fetch_metrics(days: int) -> dict:
    api_url = os.getenv("API_URL", "http://localhost:3001")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{api_url}/api/analytics/overview",
                params={"days": days},
            )
            if response.status_code == 200:
                return response.json()
    except Exception:
        pass
    return {"emails": {"sent": 0, "opened": 0, "replied": 0}, "deals": {"total": 0, "won": 0}}
