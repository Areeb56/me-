from typing import Dict, Any
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

class FollowUpAgent:
    def __init__(self):
        self.name = "Follow-up Agent"
        self.description = "Handles automated follow-up sequences for unanswered outreach"
    
    async def execute(self, state):
        """Execute the follow-up agent logic"""
        print("{}: Processing follow-up for lead {}".format(self.name, state.get("lead_id", "unknown")))
        
        # Check if email was sent but no reply received
        email_sent = state.get("email_sent", False)
        reply_received = state.get("reply_received", False)
        follow_up_count = state.get("follow_up_count", 0)
        max_follow_ups = state.get("max_follow_ups", 3)
        
        if email_sent and not reply_received and follow_up_count < max_follow_ups:
            # Generate follow-up email based on previous outreach and any prospect interactions
            previous_subject = state.get("outreach_data", {}).get("subject", "Previous email")
            previous_body = state.get("outreach_data", {}).get("body", "")
            
            # Simple follow-up generation (in production, would use LLM)
            follow_up_subject = "Re: " + previous_subject
            follow_up_body = """\n\nHi {},\n\nJust following up on my previous email about {}. I wanted to see if you had any thoughts or questions.\n\nBest regards,\nThe AIOS Team""".format(
                state.get("contact_name", "Valued Customer"),
                state.get("company_name", "your company")
            )
            
            # Update state with follow-up email
            state["follow_up_email"] = {
                "subject": follow_up_subject,
                "body": follow_up_body
            }
            state["follow_up_count"] = follow_up_count + 1
            state["current_agent"] = "FOLLOW_UP_GENERATED"
            print("{}: Generated follow-up #{}".format(self.name, state["follow_up_count"]))
        else:
            state["current_agent"] = "FOLLOW_UP_SKIPPED"
            if not email_sent:
                print("{}: No email sent yet, skipping follow-up".format(self.name))
            elif reply_received:
                print("{}: Reply received, no follow-up needed".format(self.name))
            else:
                print("{}: Maximum follow-ups reached".format(self.name))
        
        return state

def create_follow_up_agent_workflow():
    """Create the follow-up agent workflow"""
    workflow = StateGraph(dict)
    
    # Add nodes
    workflow.add_node("follow_up_agent", FollowUpAgent().execute)
    
    # Set entry point
    workflow.set_entry_point("follow_up_agent")
    
    # Add edge to end
    workflow.add_edge("follow_up_agent", END)
    
    # Compile workflow
    memory = MemorySaver()
    app = workflow.compile(checkpointer=memory)
    
    return app

# For testing
if __name__ == "__main__":
    import asyncio
    
    async def test():
        workflow = create_follow_up_agent_workflow()
        initial_state = {
            "lead_id": "lead_123",
            "company_name": "Acme Corporation",
            "contact_name": "John Doe",
            "email_sent": True,
            "reply_received": False,
            "follow_up_count": 0,
            "max_follow_ups": 3,
            "current_agent": "FOLLOW_UP"
        }
        
        result = await workflow.ainvoke(initial_state)
        print("Follow-up Agent Result:", result)
    
    asyncio.run(test())
