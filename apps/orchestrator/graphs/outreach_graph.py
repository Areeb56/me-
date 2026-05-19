from langgraph.graph import StateGraph, END
from typing import TypedDict, Optional

class OutreachState(TypedDict):
    lead_id: str
    contact_id: str
    campaign_id: str
    email_subject: Optional[str]
    email_body: Optional[str]
    sequence_step: int
    status: str
    errors: list

async def generate_email(state: OutreachState) -> dict:
    from agents.outreach_agent import generate_outreach_email
    result = await generate_outreach_email(
        lead_id=state["lead_id"],
        contact_id=state["contact_id"],
        campaign_id=state["campaign_id"],
    )
    return {
        **state,
        "email_subject": result.get("subject", ""),
        "email_body": result.get("body", ""),
        "status": "generated",
    }

async def schedule_email(state: OutreachState) -> dict:
    return {**state, "status": "scheduled"}

async def send_email(state: OutreachState) -> dict:
    return {**state, "status": "sent"}

def build_outreach_graph():
    workflow = StateGraph(OutreachState)

    workflow.add_node("generate_email", generate_email)
    workflow.add_node("schedule_email", schedule_email)
    workflow.add_node("send_email", send_email)

    workflow.set_entry_point("generate_email")
    workflow.add_edge("generate_email", "schedule_email")
    workflow.add_edge("schedule_email", "send_email")
    workflow.add_edge("send_email", END)

    return workflow.compile()
