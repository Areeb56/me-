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

async def generate_outreach_email(lead_id: str, contact_id: str, campaign_id: str) -> dict:
    lead_data = await _fetch_lead(lead_id)
    contact_data = await _fetch_contact(contact_id)
    campaign_data = await _fetch_campaign(campaign_id)

    system_prompt = """You are an expert B2B outreach copywriter.
Write a personalized cold email that:
1. References a specific detail about the prospect's company
2. Identifies their pain point naturally
3. Offers a specific, valuable solution
4. Has a clear, low-friction CTA
5. Is concise (under 150 words)
6. Sounds human and conversational, not salesy

Return JSON with:
- subject: email subject line (under 50 chars)
- body: email body with {{first_name}} personalization
- personalization_tokens: list of facts used"""

    prompt = f"""Write a personalized outreach email:

Company: {lead_data.get('company_name', 'Unknown')}
Industry: {lead_data.get('industry', 'Unknown')}
Domain: {lead_data.get('domain', 'N/A')}
Pain points: {json.dumps(lead_data.get('pain_points', []))}
AI opportunities: {json.dumps(lead_data.get('ai_opportunities', []))}

Contact: {contact_data.get('first_name', '')} {contact_data.get('last_name', '')}
Title: {contact_data.get('title', 'Decision Maker')}

Campaign value prop: {campaign_data.get('value_proposition', 'AI-powered business automation')}

Write a highly personalized email that references their specific situation."""

    response = await router.call(prompt, system=system_prompt, task_type="reasoning")

    try:
        result = json.loads(response)
    except json.JSONDecodeError:
        result = {
            "subject": f"Quick question about {lead_data.get('company_name', 'your')} {lead_data.get('industry', 'business')}",
            "body": f"Hi {contact_data.get('first_name', 'there')},\n\nI noticed {lead_data.get('company_name', 'your company')} is doing interesting work in {lead_data.get('industry', 'your industry')}.\n\nWe help companies like yours automate manual processes and scale efficiently with AI.\n\nWould you be open to a quick 15-minute chat?\n\nBest",
            "personalization_tokens": ["company_name", "industry"],
        }

    memory.add(
        content=f"Generated outreach for {contact_data.get('first_name', '')} at {lead_data.get('company_name', '')}",
        agent_type="outreach_manager",
        metadata={
            "lead_id": lead_id,
            "contact_id": contact_id,
            "campaign_id": campaign_id,
            "subject": result.get("subject", ""),
        },
        importance=0.6,
    )

    return result

async def _fetch_lead(lead_id: str) -> dict:
    api_url = os.getenv("API_URL", "http://localhost:3001")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{api_url}/api/leads/{lead_id}")
            if response.status_code == 200:
                return response.json()
    except Exception:
        pass
    return {}

async def _fetch_contact(contact_id: str) -> dict:
    return {"first_name": "Prospect", "last_name": "", "title": "Decision Maker"}

async def _fetch_campaign(campaign_id: str) -> dict:
    api_url = os.getenv("API_URL", "http://localhost:3001")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{api_url}/api/campaigns/{campaign_id}")
            if response.status_code == 200:
                return response.json()
    except Exception:
        pass
    return {"value_proposition": "AI-powered business automation"}
