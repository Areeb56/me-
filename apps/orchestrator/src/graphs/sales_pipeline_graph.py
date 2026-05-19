from typing import Dict, Any, TypedDict, Optional, List
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
import uuid

# Import agent classes
from agents.follow_up_agent import FollowUpAgent
from agents.browser_agent import BrowserAgent
from agents.reflection_agent import ReflectionAgent
from agents.optimization_agent import OptimizationAgent

# We'\''ll define placeholder agent functions since we cannot import from relative paths in this context
# In a real implementation, these would be imported from the agents module

def create_ceo_agent_workflow():
    """Placeholder for CEO agent workflow"""
    pass

def create_coo_agent_workflow():
    """Placeholder for COO agent workflow"""
    pass

def create_research_agent_workflow():
    """Placeholder for Research agent workflow"""
    pass

def create_outreach_agent_workflow():
    """Placeholder for Outreach agent workflow"""
    pass

def create_crm_agent_workflow():
    """Placeholder for CRM agent workflow"""
    pass

# Define the state schema
class SalesPipelineState(TypedDict):
    lead_id: Optional[str]
    contact_id: Optional[str]
    deal_id: Optional[str]
    research_data: Optional[Dict[str, Any]]
    outreach_data: Optional[Dict[str, Any]]
    reply_data: Optional[Dict[str, Any]]
    stage: str  # prospect, contacted, replied, meeting_booked, won, lost
    errors: List[str]
    retry_count: int
    goal: str
    current_agent: str
    delegated_task: Optional[Dict[str, Any]]
    next_manager: Optional[str]
    company_name: str
    contact_name: str
    deal_stage: str
    interaction_type: str
    # Add any other fields needed by the agents
    email_sent: bool
    reply_received: bool
    follow_up_count: int
    max_follow_ups: int
    follow_up_email: Optional[Dict[str, str]]
    lead_score: Optional[int]
    lead_qualified: Optional[bool]
    next_step: Optional[str]
    reply_classification: Optional[str]
    answer_generated: Optional[bool]
    meeting_booked: bool
    deal_won: bool
    deal_lost: bool
    crm_updated: bool
    insights_generated: bool
    reflection_insights: List[str]
    reflection_metrics: Optional[Dict[str, Any]]
    optimization_plan: List[Dict[str, Any]]
    optimizations_applied: List[Dict[str, Any]]

# Agent instances
follow_up_agent = FollowUpAgent()
browser_agent = BrowserAgent()
reflection_agent = ReflectionAgent()
optimization_agent = OptimizationAgent()

async def ceo_node(state: SalesPipelineState) -> SalesPipelineState:
    """CEO agent node"""
    print("CEO Agent: Processing goal - {}".format(state.get("goal", "No goal provided")))
    state["current_agent"] = "COO"
    state["delegated_task"] = {
        "type": "goal_decomposition",
        "goal": state.get("goal"),
        "instructions": "Break down the goal into actionable tasks for specialized agents"
    }
    return state

async def coo_node(state: SalesPipelineState) -> SalesPipelineState:
    """COO agent node"""
    print("COO Agent: Routing task - {}".format(state.get("delegated_task", {}).get("type", "No task")))
    task_type = state.get("delegated_task", {}).get("type")
    if task_type == "goal_decomposition":
        state["next_manager"] = "RESEARCH_MANAGER"
    elif task_type == "outreach_creation":
        state["next_manager"] = "OUTREACH_MANAGER"
    elif task_type == "crm_update":
        state["next_manager"] = "CRM_MANAGER"
    else:
        state["next_manager"] = "RESEARCH_MANAGER"
    return state

async def research_manager_node(state: SalesPipelineState) -> SalesPipelineState:
    """Research Manager node - spawns research workers"""
    print("Research Manager: Spawning research workers for lead")
    state["current_agent"] = "BROWSER_AGENT"  # Now goes to browser agent for web research
    return state

async def browser_node(state: SalesPipelineState) -> SalesPipelineState:
    """Browser Agent node - performs web research"""
    print("Browser Agent: Starting web research")
    # Call the browser agent
    result = await browser_agent.execute(state)
    # The agent updates state and returns it
    return result

async def research_worker_node(state: SalesPipelineState) -> SalesPipelineState:
    """Research Worker node - performs actual research"""
    print("Research Worker: Researching company - {}".format(state.get("company_name", "Unknown Company")))
    state["research_data"] = {
        "company_name": state.get("company_name"),
        "industry": state.get("industry", "Technology"),
        "pain_points": ["Manual processes", "Data silos", "Inefficient reporting"],
        "ai_opportunities": ["Process automation", "Predictive analytics", "Natural language interfaces"],
        "score": 85
    }
    state["current_agent"] = "RESEARCH_COMPLETE"
    return state

async def scoring_node(state: SalesPipelineState) -> SalesPipelineState:
    """Score the lead based on research data"""
    print("Scoring lead based on research data")
    research_data = state.get("research_data", {})
    score = research_data.get("score", 0)
    state["lead_score"] = score
    if score >= 70:
        state["lead_qualified"] = True
        state["next_step"] = "generate_outreach"
    else:
        state["lead_qualified"] = False
        state["next_step"] = "disqualify"
    return state

async def outreach_manager_node(state: SalesPipelineState) -> SalesPipelineState:
    """Outreach Manager node - generates personalized outreach"""
    print("Outreach Manager: Generating personalized outreach")
    state["current_agent"] = "OUTREACH_AGENT"
    return state

async def outreach_worker_node(state: SalesPipelineState) -> SalesPipelineState:
    """Outreach Worker node - creates email content"""
    print("Outreach Worker: Generating outreach for {} - {}".format(
        state.get("company_name"), state.get("contact_name")))
    company_name = state.get("company_name", "Unknown Company")
    contact_name = state.get("contact_name", "Valued Customer")
    pain_points = state.get("pain_points", ["business challenges"])
    
    email_subject = "Helping {} with {}".format(company_name, pain_points[0] if pain_points else "business challenges")
    email_body = """\n\nHi {},\n\nI noticed that {} might be facing challenges with {}. \nOur AI-powered solutions have helped similar companies in your industry to overcome these challenges.\n\nWould you be open to a brief call to discuss how we might be able to help?\n\nBest regards,\nThe AIOS Team""".format(contact_name, company_name, pain_points[0] if pain_points else "business challenges")
    
    state["outreach_data"] = {
        "subject": email_subject,
        "body": email_body
    }
    state["current_agent"] = "OUTREACH_COMPLETE"
    return state

async def send_email_node(state: SalesPipelineState) -> SalesPipelineState:
    """Send the outreach email"""
    print("Sending email to {} <{}>".format(
        state.get("contact_name"), state.get("contact_email", "no email")))
    state["email_sent"] = True
    state["current_agent"] = "EMAIL_SENT"
    return state

async def monitor_reply_node(state: SalesPipelineState) -> SalesPipelineState:
    """Monitor for replies to the sent email"""
    print("Monitoring for replies...")
    state["reply_received"] = False
    state["current_agent"] = "MONITORING_REPLY"
    return state

async def classify_reply_node(state: SalesPipelineState) -> SalesPipelineState:
    """Classify the reply and determine next steps"""
    print("Classifying reply")
    reply_received = state.get("reply_received", False)
    if not reply_received:
        state["next_step"] = "follow_up"
        return state
    
    reply_content = state.get("reply_content", "").lower()
    if "interested" in reply_content or "yes" in reply_content:
        state["reply_classification"] = "interested"
        state["next_step"] = "book_meeting"
    elif "not interested" in reply_content or "no" in reply_content:
        state["reply_classification"] = "not_interested"
        state["next_step"] = "mark_lost"
    elif "question" in reply_content or "?" in reply_content:
        state["reply_classification"] = "question"
        state["next_step"] = "generate_answer"
    else:
        state["reply_classification"] = "unknown"
        state["next_step"] = "follow_up"
    return state

async def generate_answer_node(state: SalesPipelineState) -> SalesPipelineState:
    """Generate an answer to a question in the reply"""
    print("Generating answer to question")
    state["answer_generated"] = True
    state["current_agent"] = "ANSWER_GENERATED"
    return state

async def follow_up_node(state: SalesPipelineState) -> SalesPipelineState:
    """Follow-up Agent node - handles automated follow-up sequences"""
    print("Follow-up Agent: Processing follow-up")
    # Call the follow-up agent
    result = await follow_up_agent.execute(state)
    return result

async def book_meeting_node(state: SalesPipelineState) -> SalesPipelineState:
    """Book a meeting with the lead"""
    print("Booking meeting")
    import random
    success = random.choice([True, False])
    if success:
        state["meeting_booked"] = True
        state["deal_stage"] = "meeting_booked"
        state["next_step"] = "meeting_success"
    else:
        state["meeting_booked"] = False
        state["next_step"] = "meeting_failed"
    return state

async def meeting_success_node(state: SalesPipelineState) -> SalesPipelineState:
    """Handle successful meeting"""
    print("Meeting successful - marking deal as won")
    state["deal_stage"] = "won"
    state["won_at"] = "2024-01-15"
    state["current_agent"] = "DEAL_WON"
    return state

async def meeting_failed_node(state: SalesPipelineState) -> SalesPipelineState:
    """Handle failed meeting attempt"""
    print("Meeting failed - retry or mark as lost")
    retry_count = state.get("retry_count", 0)
    if retry_count < 2:
        state["retry_count"] = retry_count + 1
        state["next_step"] = "book_meeting"
    else:
        state["deal_stage"] = "lost"
        state["lost_reason"] = "Failed to book meeting after multiple attempts"
        state["current_agent"] = "DEAL_LOST"
    return state

async def mark_lost_node(state: SalesPipelineState) -> SalesPipelineState:
    """Mark the deal as lost"""
    print("Marking deal as lost")
    state["deal_stage"] = "lost"
    state["lost_reason"] = state.get("lost_reason", "Lost due to negative response or disqualification")
    state["current_agent"] = "DEAL_LOST"
    return state

async def disqualify_node(state: SalesPipelineState) -> SalesPipelineState:
    """Disqualify the lead based on low score"""
    print("Disqualifying lead due to low score")
    state["deal_stage"] = "disqualified"
    state["lost_reason"] = "Lead score below threshold"
    state["current_agent"] = "LEAD_DISQUALIFIED"
    return state

async def update_crm_node(state: SalesPipelineState) -> SalesPipelineState:
    """Update CRM with the latest deal stage"""
    print("Updating CRM with deal stage: {}".format(state.get("deal_stage")))
    state["crm_updated"] = True
    state["current_agent"] = "CRM_UPDATED"
    return state

async def reflect_node(state: SalesPipelineState) -> SalesPipelineState:
    """Reflection Agent node - analyze performance and suggest improvements"""
    print("Reflection Agent: Analyzing performance")
    # Call the reflection agent
    result = await reflection_agent.execute(state)
    return result

async def optimization_node(state: SalesPipelineState) -> SalesPipelineState:
    """Optimization Agent node - implement A/B testing and update winning templates"""
    print("Optimization Agent: Running optimization cycle")
    # Call the optimization agent
    result = await optimization_agent.execute(state)
    return result

def create_sales_pipeline_graph():
    """Create the sales pipeline graph"""
    workflow = StateGraph(SalesPipelineState)
    
    workflow.add_node("ceo", ceo_node)
    workflow.add_node("coo", coo_node)
    workflow.add_node("research_manager", research_manager_node)
    workflow.add_node("browser_agent", browser_node)
    workflow.add_node("research_worker", research_worker_node)
    workflow.add_node("scoring", scoring_node)
    workflow.add_node("outreach_manager", outreach_manager_node)
    workflow.add_node("outreach_worker", outreach_worker_node)
    workflow.add_node("send_email", send_email_node)
    workflow.add_node("monitor_reply", monitor_reply_node)
    workflow.add_node("classify_reply", classify_reply_node)
    workflow.add_node("generate_answer", generate_answer_node)
    workflow.add_node("follow_up", follow_up_node)
    workflow.add_node("book_meeting", book_meeting_node)
    workflow.add_node("meeting_success", meeting_success_node)
    workflow.add_node("meeting_failed", meeting_failed_node)
    workflow.add_node("mark_lost", mark_lost_node)
    workflow.add_node("disqualify", disqualify_node)
    workflow.add_node("update_crm", update_crm_node)
    workflow.add_node("reflect", reflect_node)
    workflow.add_node("optimize", optimization_node)
    
    workflow.set_entry_point("ceo")
    
    workflow.add_edge("ceo", "coo")
    workflow.add_edge("coo", "research_manager")
    workflow.add_edge("research_manager", "browser_agent")
    workflow.add_edge("browser_agent", "research_worker")
    workflow.add_edge("research_worker", "scoring")
    
    workflow.add_conditional_edges(
        "scoring",
        lambda state: state.get("next_step", "disqualify"),
        {
            "generate_outreach": "outreach_manager",
            "disqualify": "disqualify"
        }
    )
    
    workflow.add_edge("outreach_manager", "outreach_worker")
    workflow.add_edge("outreach_worker", "send_email")
    workflow.add_edge("send_email", "monitor_reply")
    workflow.add_edge("monitor_reply", "classify_reply")
    
    workflow.add_conditional_edges(
        "classify_reply",
        lambda state: state.get("next_step", "follow_up"),
        {
            "book_meeting": "book_meeting",
            "mark_lost": "mark_lost",
            "generate_answer": "generate_answer",
            "follow_up": "follow_up"
        }
    )
    
    workflow.add_edge("generate_answer", "send_email")
    workflow.add_edge("follow_up", "monitor_reply")
    
    workflow.add_conditional_edges(
        "book_meeting",
        lambda state: state.get("next_step", "meeting_failed"),
        {
            "meeting_success": "meeting_success",
            "meeting_failed": "meeting_failed"
        }
    )
    
    workflow.add_edge("meeting_success", "update_crm")
    workflow.add_edge("meeting_failed", "update_crm")
    workflow.add_edge("mark_lost", "update_crm")
    workflow.add_edge("disqualify", "update_crm")
    
    workflow.add_edge("update_crm", "reflect")
    workflow.add_edge("reflect", "optimize")
    workflow.add_edge("optimize", END)
    
    memory = MemorySaver()
    app = workflow.compile(checkpointer=memory)
    
    return app

if __name__ == "__main__":
    import asyncio
    
    async def test():
        workflow = create_sales_pipeline_graph()
        initial_state = {
            "goal": "Find 50 SaaS leads in fintech, research them, and start outreach",
            "company_name": "Acme Corporation",
            "contact_name": "John Doe",
            "contact_email": "john.doe@acme.com",
            "industry": "Technology",
            "stage": "prospect",
            "errors": [],
            "retry_count": 0,
            "current_agent": "CEO",
            "email_sent": False,
            "reply_received": False,
            "follow_up_count": 0,
            "max_follow_ups": 3,
            "lead_score": None,
            "lead_qualified": None,
            "next_step": None,
            "reply_classification": None,
            "answer_generated": False,
            "meeting_booked": False,
            "deal_won": False,
            "deal_lost": False,
            "crm_updated": False,
            "insights_generated": False,
            "reflection_insights": [],
            "reflection_metrics": None,
            "optimization_plan": [],
            "optimizations_applied": []
        }
        
        result = await workflow.ainvoke(initial_state)
        print("Sales Pipeline Result:", result)
    
    asyncio.run(test())
