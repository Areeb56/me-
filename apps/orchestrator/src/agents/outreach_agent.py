from typing import Dict, Any
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

class OutreachAgent:
    def __init__(self):
        self.name = "Outreach Agent"
        self.description = "Generates personalized outreach messages"
    
    async def execute(self, state):
        """Execute the outreach agent logic"""
        print("{}: Generating outreach for {} - {}".format(self.name, state.get("company_name"), state.get("contact_name")))
        
        # Generate personalized email content
        company_name = state.get("company_name", "Unknown Company")
        contact_name = state.get("contact_name", "Valued Customer")
        pain_points = state.get("pain_points", ["business challenges"])
        
        email_subject = "Helping {} with {}".format(company_name, pain_points[0] if pain_points else "business challenges")
        email_body = """
        Hi {},
        
        I noticed that {} might be facing challenges with {}. 
        Our AI-powered solutions have helped similar companies in your industry to overcome these challenges.
        
        Would you be open to a brief call to discuss how we might be able to help?
        
        Best regards,
        The AIOS Team
        """.format(contact_name, company_name, pain_points[0] if pain_points else "business challenges")
        
        # Update state with generated content
        state["email_content"] = {
            "subject": email_subject,
            "body": email_body
        }
        
        state["current_agent"] = "OUTREACH_COMPLETE"
        
        return state

def create_outreach_agent_workflow():
    """Create the outreach agent workflow"""
    workflow = StateGraph(dict)
    
    # Add nodes
    workflow.add_node("outreach_agent", OutreachAgent().execute)
    
    # Set entry point
    workflow.set_entry_point("outreach_agent")
    
    # Add edge to end
    workflow.add_edge("outreach_agent", END)
    
    # Compile workflow
    memory = MemorySaver()
    app = workflow.compile(checkpointer=memory)
    
    return app

# For testing
if __name__ == "__main__":
    import asyncio
    
    async def test():
        workflow = create_outreach_agent_workflow()
        initial_state = {
            "company_name": "Acme Corporation",
            "contact_name": "John Doe",
            "pain_points": ["Manual processes", "Data silos"],
            "current_agent": "OUTREACH"
        }
        
        result = await workflow.ainvoke(initial_state)
        print("Outreach Agent Result:", result)
    
    asyncio.run(test())

