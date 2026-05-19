import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.router import ModelRouter
from memory.vector_store import VectorMemory
import json
from datetime import datetime

router = ModelRouter()
memory = VectorMemory()

async def run_ceo_pipeline(goal: str, target_count: int = 50, industry: str = None, filters: dict = None) -> dict:
    system_prompt = """You are the CEO Agent of AIOS, an autonomous AI business operating system.
Your role is to:
1. Receive high-level business goals
2. Break them into actionable subtasks
3. Delegate to specialized agents (COO, Research, Outreach, CRM)
4. Monitor pipeline health
5. Trigger reflection when needed

Respond with a JSON object containing:
- subtasks: list of tasks to delegate
- priority_order: ordered list of subtask indices
- estimated_duration_minutes: total estimated time
- delegation_plan: which agent handles each subtask"""

    prompt = f"""Business Goal: {goal}

Target: {target_count} leads
Industry: {industry or 'any'}
Filters: {json.dumps(filters) if filters else 'none'}

Break this goal into specific, actionable subtasks for the AIOS pipeline.
Each subtask should be assignable to a specific agent type.

Return ONLY valid JSON."""

    response = await router.call(prompt, system=system_prompt, task_type="reasoning")

    try:
        result = json.loads(response)
    except json.JSONDecodeError:
        result = {
            "subtasks": [goal],
            "priority_order": [0],
            "estimated_duration_minutes": 30,
            "delegation_plan": [{"task": goal, "agent": "coo"}],
        }

    memory.add(
        content=f"CEO initiated pipeline: {goal}",
        agent_type="ceo",
        metadata={"target_count": target_count, "industry": industry, "result": result},
        importance=0.9,
    )

    return {
        "run_id": f"ceo-{datetime.utcnow().isoformat()}",
        "goal": goal,
        "plan": result,
        "status": "executing",
    }
