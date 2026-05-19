from langgraph.graph import StateGraph, END
from typing import TypedDict, Optional, Any
from datetime import datetime
import json

class SalesPipelineState(TypedDict):
    lead_id: str
    contact_id: Optional[str]
    deal_id: Optional[str]
    research_data: Optional[dict]
    outreach_data: Optional[dict]
    reply_data: Optional[dict]
    stage: str
    errors: list
    retry_count: int
    output: Optional[dict]

async def find_leads(state: SalesPipelineState) -> dict:
    return {**state, "stage": "finding_leads"}

async def research_lead(state: SalesPipelineState) -> dict:
    from agents.research_agent import run_research_graph
    try:
        result = await run_research_graph(
            lead_id=state["lead_id"],
            domain=state.get("research_data", {}).get("domain"),
        )
        return {
            **state,
            "research_data": result,
            "stage": "researched",
        }
    except Exception as e:
        return {
            **state,
            "errors": state["errors"] + [str(e)],
            "retry_count": state["retry_count"] + 1,
        }

async def score_lead(state: SalesPipelineState) -> dict:
    score = state.get("research_data", {}).get("score", 0)
    if score >= 70:
        return {**state, "stage": "qualified"}
    return {**state, "stage": "disqualified"}

async def generate_outreach(state: SalesPipelineState) -> dict:
    from agents.outreach_agent import generate_outreach_email
    try:
        result = await generate_outreach_email(
            lead_id=state["lead_id"],
            contact_id=state.get("contact_id", ""),
            campaign_id="default",
        )
        return {
            **state,
            "outreach_data": result,
            "stage": "outreach_generated",
        }
    except Exception as e:
        return {
            **state,
            "errors": state["errors"] + [str(e)],
            "retry_count": state["retry_count"] + 1,
        }

async def send_email(state: SalesPipelineState) -> dict:
    return {**state, "stage": "email_sent"}

async def monitor_reply(state: SalesPipelineState) -> dict:
    return {**state, "stage": "monitoring"}

async def classify_reply(state: SalesPipelineState) -> dict:
    from agents.crm_agent import classify_reply
    reply_body = state.get("reply_data", {}).get("body", "")
    try:
        result = await classify_reply(email_body=reply_body)
        return {
            **state,
            "reply_data": {**state.get("reply_data", {}), "classification": result},
            "stage": result["classification"],
        }
    except Exception as e:
        return {
            **state,
            "errors": state["errors"] + [str(e)],
            "stage": "error",
        }

async def update_crm(state: SalesPipelineState) -> dict:
    from agents.crm_agent import update_crm_stage
    classification = state.get("reply_data", {}).get("classification", {}).get("classification", "")
    stage_map = {
        "interested": "meeting_booked",
        "not_interested": "lost",
        "question": "replied",
    }
    new_stage = stage_map.get(classification, state["stage"])
    try:
        await update_crm_stage(state.get("deal_id", ""), new_stage)
        return {**state, "stage": new_stage}
    except Exception as e:
        return {**state, "errors": state["errors"] + [str(e)]}

async def book_meeting(state: SalesPipelineState) -> dict:
    return {**state, "stage": "meeting_booked"}

async def reflect(state: SalesPipelineState) -> dict:
    from agents.reflection_agent import run_reflection
    try:
        result = await run_reflection(days=7)
        return {**state, "output": {"reflection": result}}
    except Exception as e:
        return {**state, "errors": state["errors"] + [str(e)]}

def build_sales_pipeline() -> StateGraph:
    workflow = StateGraph(SalesPipelineState)

    workflow.add_node("find_leads", find_leads)
    workflow.add_node("research_lead", research_lead)
    workflow.add_node("score_lead", score_lead)
    workflow.add_node("generate_outreach", generate_outreach)
    workflow.add_node("send_email", send_email)
    workflow.add_node("monitor_reply", monitor_reply)
    workflow.add_node("classify_reply", classify_reply)
    workflow.add_node("update_crm", update_crm)
    workflow.add_node("book_meeting", book_meeting)
    workflow.add_node("reflect", reflect)

    workflow.set_entry_point("find_leads")
    workflow.add_edge("find_leads", "research_lead")
    workflow.add_edge("research_lead", "score_lead")
    workflow.add_edge("generate_outreach", "send_email")
    workflow.add_edge("send_email", "monitor_reply")
    workflow.add_edge("monitor_reply", "classify_reply")
    workflow.add_edge("update_crm", "reflect")
    workflow.add_edge("reflect", END)

    def route_score(state: SalesPipelineState) -> str:
        score = state.get("research_data", {}).get("score", 0)
        return "generate_outreach" if score >= 70 else END

    def route_reply(state: SalesPipelineState) -> str:
        classification = state.get("reply_data", {}).get("classification", {}).get("classification", "")
        if classification == "interested":
            return "book_meeting"
        elif classification == "not_interested":
            return END
        elif classification == "question":
            return "update_crm"
        return "monitor_reply"

    workflow.add_conditional_edges("score_lead", route_score)
    workflow.add_conditional_edges("classify_reply", route_reply)
    workflow.add_edge("book_meeting", END)

    return workflow.compile()
