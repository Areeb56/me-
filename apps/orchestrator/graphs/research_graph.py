from langgraph.graph import StateGraph, END
from typing import TypedDict, Optional

class ResearchState(TypedDict):
    lead_id: str
    domain: Optional[str]
    website_url: Optional[str]
    company_info: Optional[dict]
    tech_stack: list
    pain_points: list
    ai_opportunities: list
    score: int
    status: str
    errors: list

async def fetch_website(state: ResearchState) -> dict:
    from agents.browser_agent import run_browser_research
    result = await run_browser_research(
        domain=state.get("domain"),
        website_url=state.get("website_url"),
    )
    return {
        **state,
        "company_info": result.get("company_info", {}),
        "tech_stack": result.get("tech_stack", []),
    }

async def analyze_pain_points(state: ResearchState) -> dict:
    from agents.research_agent import _detect_pain_points
    pain_points = await _detect_pain_points(
        research_data={"company_info": state.get("company_info", {})},
        domain=state.get("domain"),
    )
    return {**state, "pain_points": pain_points}

async def analyze_opportunities(state: ResearchState) -> dict:
    from agents.research_agent import _detect_ai_opportunities
    opportunities = await _detect_ai_opportunities(
        research_data={"company_info": state.get("company_info", {})},
        domain=state.get("domain"),
    )
    return {**state, "ai_opportunities": opportunities}

async def score_lead(state: ResearchState) -> dict:
    from agents.research_agent import _score_lead
    score = await _score_lead(
        research_data={"company_info": state.get("company_info", {})},
        pain_points=state.get("pain_points", []),
        ai_opportunities=state.get("ai_opportunities", []),
    )
    return {
        **state,
        "score": score,
        "status": "qualified" if score >= 70 else "disqualified",
    }

def build_research_graph():
    workflow = StateGraph(ResearchState)

    workflow.add_node("fetch_website", fetch_website)
    workflow.add_node("analyze_pain_points", analyze_pain_points)
    workflow.add_node("analyze_opportunities", analyze_opportunities)
    workflow.add_node("score_lead", score_lead)

    workflow.set_entry_point("fetch_website")
    workflow.add_edge("fetch_website", "analyze_pain_points")
    workflow.add_edge("analyze_pain_points", "analyze_opportunities")
    workflow.add_edge("analyze_opportunities", "score_lead")
    workflow.add_edge("score_lead", END)

    return workflow.compile()
