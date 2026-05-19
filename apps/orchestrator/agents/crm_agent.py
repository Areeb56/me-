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

async def classify_reply(email_body: str, email_subject: str = "") -> dict:
    system_prompt = """Classify an email reply into one of these categories:
- interested: Shows genuine interest, asks for more info, suggests a meeting
- not_interested: Politely declines or says not a fit
- question: Asks a specific question about the offering
- ooo: Out of office auto-reply
- unsubscribe: Requests to be removed from mailing list

Return JSON with:
- classification: one of the categories above
- confidence: 0-1 confidence score
- reasoning: brief explanation
- suggested_action: what the CRM should do next"""

    prompt = f"""Classify this email reply:

Subject: {email_subject}
Body: {email_body[:1000]}

Return ONLY valid JSON."""

    response = await router.call(prompt, system=system_prompt, task_type="classification")

    try:
        result = json.loads(response)
    except json.JSONDecodeError:
        result = {
            "classification": "question",
            "confidence": 0.5,
            "reasoning": "Could not determine classification",
            "suggested_action": "review_manually",
        }

    memory.add(
        content=f"Reply classified as {result['classification']}: {email_body[:200]}",
        agent_type="crm_manager",
        metadata={"classification": result["classification"], "confidence": result["confidence"]},
        importance=0.7,
    )

    return result

async def generate_reply_answer(question: str, context: str = "") -> str:
    system_prompt = """You are helping craft a response to a prospect's question.
Be helpful, specific, and concise. Reference the context if available."""

    prompt = f"""A prospect asked: {question}

Context about our offering: {context}

Write a helpful, specific response."""

    response = await router.call(prompt, system=system_prompt, task_type="reasoning")
    return response

async def update_crm_stage(deal_id: str, new_stage: str, reason: str = "") -> dict:
    api_url = os.getenv("API_URL", "http://localhost:3001")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.patch(
                f"{api_url}/api/crm/{deal_id}",
                json={"stage": new_stage, "notes": reason},
            )
            if response.status_code == 200:
                return response.json()
    except Exception as e:
        print(f"Failed to update CRM stage: {e}")
    return {"error": "Failed to update CRM"}
