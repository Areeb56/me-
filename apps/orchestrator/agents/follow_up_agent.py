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

FOLLOW_UP_SCHEDULE = [3, 7, 14]

async def generate_follow_up(deal_id: str, sequence_step: int = 1) -> dict:
    deal_data = await _fetch_deal(deal_id)
    previous_email = await _fetch_previous_email(deal_id, sequence_step)

    day = FOLLOW_UP_SCHEDULE[min(sequence_step - 1, len(FOLLOW_UP_SCHEDULE) - 1)]

    system_prompt = """You are writing a follow-up email.
Rules:
1. Reference the previous email naturally
2. Add new value (insight, case study, resource)
3. Keep it shorter than the original
4. Maintain a helpful, non-pushy tone
5. Include a clear but soft CTA

Return JSON with:
- subject: follow-up subject line
- body: email body"""

    prompt = f"""Write follow-up #{sequence_step} (Day {day}):

Previous email subject: {previous_email.get('subject', 'N/A')}
Previous email body: {previous_email.get('body', 'N/A')[:500]}

Company: {deal_data.get('lead', {}).get('company_name', 'Unknown')}
Pain points: {json.dumps(deal_data.get('lead', {}).get('pain_points', []))}

Write a concise, value-adding follow-up."""

    response = await router.call(prompt, system=system_prompt, task_type="reasoning")

    try:
        result = json.loads(response)
    except json.JSONDecodeError:
        result = {
            "subject": f"Re: {previous_email.get('subject', 'Following up')}",
            "body": f"Hi,\n\nJust circling back on my previous note. I thought you might find this relevant given what {deal_data.get('lead', {}).get('company_name', 'your company')} is working on.\n\nHappy to share more if helpful.\n\nBest",
        }

    memory.add(
        content=f"Follow-up #{sequence_step} generated for deal {deal_id}",
        agent_type="follow_up",
        metadata={"deal_id": deal_id, "sequence_step": sequence_step, "day": day},
        importance=0.5,
    )

    return result

async def _fetch_deal(deal_id: str) -> dict:
    api_url = os.getenv("API_URL", "http://localhost:3001")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{api_url}/api/crm/{deal_id}")
            if response.status_code == 200:
                return response.json()
    except Exception:
        pass
    return {}

async def _fetch_previous_email(deal_id: str, sequence_step: int) -> dict:
    api_url = os.getenv("API_URL", "http://localhost:3001")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{api_url}/api/outreach",
                params={"deal_id": deal_id, "sequence_step": sequence_step - 1},
            )
            if response.status_code == 200:
                data = response.json()
                emails = data.get("emails", [])
                if emails:
                    return emails[0]
    except Exception:
        pass
    return {}
