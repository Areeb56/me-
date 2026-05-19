import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.router import ModelRouter
from memory.vector_store import VectorMemory
import json
from datetime import datetime

router = ModelRouter()
memory = VectorMemory()

async def route_task(task: str, context: dict = None) -> dict:
    system_prompt = """You are the COO Agent. Route tasks to the appropriate manager:
- research: RESEARCH_MANAGER (for lead research, company analysis)
- outreach: OUTREACH_MANAGER (for email generation, campaign management)
- crm: CRM_MANAGER (for deal updates, reply classification)
- follow_up: FOLLOW_UP_AGENT (for follow-up sequences)
- analytics: ANALYSIS (for reporting, metrics)

Return JSON with:
- target_agent: which agent should handle this
- reason: why this agent was chosen
- prepared_context: formatted context for the target agent"""

    prompt = f"""Route this task to the appropriate agent:

Task: {task}
Context: {json.dumps(context) if context else 'none'}

Return ONLY valid JSON."""

    response = await router.call(prompt, system=system_prompt, task_type="routing")

    try:
        result = json.loads(response)
    except json.JSONDecodeError:
        result = {
            "target_agent": "research_manager",
            "reason": "Default routing to research",
            "prepared_context": {},
        }

    memory.add(
        content=f"COO routed task: {task} -> {result['target_agent']}",
        agent_type="coo",
        metadata={"task": task, "result": result},
        importance=0.6,
    )

    return result

async def monitor_pipeline_health() -> dict:
    return {
        "status": "healthy",
        "active_tasks": 0,
        "queue_depth": 0,
        "error_rate": 0,
        "timestamp": datetime.utcnow().isoformat(),
    }
