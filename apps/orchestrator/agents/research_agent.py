import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.router import ModelRouter
from memory.vector_store import VectorMemory
from agents.browser_agent import run_browser_research
import json
import httpx
from datetime import datetime

router = ModelRouter()
memory = VectorMemory()

async def run_research_graph(lead_id: str, domain: str = None, website_url: str = None) -> dict:
    research_data = {}

    if domain or website_url:
        browser_result = await run_browser_research(
            domain=domain,
            website_url=website_url,
        )
        research_data["browser"] = browser_result

    pain_points = await _detect_pain_points(research_data, domain)
    ai_opportunities = await _detect_ai_opportunities(research_data, domain)
    score = await _score_lead(research_data, pain_points, ai_opportunities)

    result = {
        "run_id": f"research-{lead_id}-{datetime.utcnow().isoformat()}",
        "lead_id": lead_id,
        "research_data": research_data,
        "pain_points": pain_points,
        "ai_opportunities": ai_opportunities,
        "score": score,
        "status": "qualified" if score >= 70 else "disqualified",
    }

    memory.add(
        content=f"Research completed for lead {lead_id}: score {score}, pain points: {pain_points}",
        agent_type="research_manager",
        metadata={"lead_id": lead_id, "score": score},
        importance=0.7,
    )

    await _update_lead_in_db(lead_id, result)

    return result

async def _detect_pain_points(research_data: dict, domain: str) -> list[str]:
    system_prompt = """You are analyzing a company to identify their business pain points.
Look for signals of:
- Manual processes that could be automated
- Scaling challenges
- Customer support bottlenecks
- Data management issues
- Inefficient workflows
- Revenue growth obstacles

Return a JSON array of strings, each describing a potential pain point."""

    context = json.dumps(research_data, indent=2) if research_data else f"Company domain: {domain}"

    prompt = f"""Analyze this company and identify 3-5 specific pain points:

{context}

Return ONLY a JSON array of pain point descriptions."""

    response = await router.call(prompt, system=system_prompt, task_type="analysis")

    try:
        return json.loads(response)
    except json.JSONDecodeError:
        return ["Inefficient manual processes", "Scaling challenges", "Customer response time"]

async def _detect_ai_opportunities(research_data: dict, domain: str) -> list[str]:
    system_prompt = """Identify how AI could specifically help this company.
Be specific and actionable. Consider:
- AI-powered customer support
- Automated lead qualification
- Predictive analytics
- Content generation
- Process automation
- Personalization at scale

Return a JSON array of strings."""

    context = json.dumps(research_data, indent=2) if research_data else f"Company domain: {domain}"

    prompt = f"""Based on this company profile, identify 3-5 AI implementation opportunities:

{context}

Return ONLY a JSON array of opportunity descriptions."""

    response = await router.call(prompt, system=system_prompt, task_type="analysis")

    try:
        return json.loads(response)
    except json.JSONDecodeError:
        return ["AI chatbot for customer support", "Automated lead scoring", "Predictive analytics dashboard"]

async def _score_lead(research_data: dict, pain_points: list, ai_opportunities: list) -> int:
    system_prompt = """Score this lead from 0-100 based on:
- Company size (larger = higher score, up to 30 points)
- Industry fit for AI (up to 25 points)
- Number and severity of pain points (up to 25 points)
- AI opportunity alignment (up to 20 points)

Return ONLY a number between 0 and 100."""

    prompt = f"""Score this lead:
Pain points: {json.dumps(pain_points)}
AI opportunities: {json.dumps(ai_opportunities)}
Research data: {json.dumps(research_data)}

Return ONLY the score number."""

    response = await router.call(prompt, system=system_prompt, task_type="scoring")

    try:
        score = int(response.strip())
        return max(0, min(100, score))
    except ValueError:
        return 50

async def _update_lead_in_db(lead_id: str, result: dict):
    api_url = os.getenv("API_URL", "http://localhost:3001")
    try:
        await httpx.AsyncClient().patch(
            f"{api_url}/api/leads/{lead_id}",
            json={
                "pain_points": result["pain_points"],
                "ai_opportunities": result["ai_opportunities"],
                "score": result["score"],
                "status": result["status"],
                "raw_research": result["research_data"],
            },
        )
    except Exception as e:
        print(f"Failed to update lead in DB: {e}")
