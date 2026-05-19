from typing import Dict, Any
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

class CRMAgent:
    def __init__(self):
        self.name = "CRM Agent"
        self.description = "Updates CRM records and manages deal stages"
    
    async def execute(self, state):
        """Execute the CRM agent logic"""
        print("{}: Updating CRM for {} - {}".format(self.name, state.get("company_name"), state.get("deal_stage")))
        
        # Update deal stage based on interaction
        current_stage = state.get("deal_stage", "prospect")
        interaction_type = state.get("interaction_type", "none")
        
        # Simple stage progression logic
        stage_mapping = {
            "prospect": "contacted",
            "contacted": "replied", 
            "replied": "meeting_booked",
            "meeting_booked": "won"
        }
        
        if interaction_type == "positive_response" and current_stage in stage_mapping:
            new_stage = stage_mapping[current_stage]
            stage_updated = True
        elif interaction_type == "negative_response":
            new_stage = "lost"
            stage_updated = True
        else:
            new_stage = current_stage
            stage_updated = False
        
        # Update state
        state["deal_stage"] = new_stage
        stage_updated = stage_updated
        state["current_agent"] = "CRM_UPDATE_COMPLETE"
        
        return state

def create_crm_agent_workflow():
    """Create the CRM agent workflow"""
    workflow = StateGraph(dict)
    
    # Add nodes
    workflow.add_node("crm_agent", CRMAgent().execute)
    
    # Set entry point
    workflow.set_entry_point("crm_agent")
    
    # Add edge to end
    workflow.add_edge("crm_agent", END)
    
    # Compile workflow
    memory = MemorySaver()
    app = workflow.compile(checkpointer=memory)
    
    return app

# For testing
if __name__ == "__main__":
    import asyncio
    
    async def test():
        workflow = create_crm_agent_workflow()
        initial_state = {
            "company_name": "Acme Corporation",
            "deal_stage": "prospect",
            "interaction_type": "positive_response",
            "current_agent": "CRM"
        }
        
        result = await workflow.ainvoke(initial_state)
        print("CRM Agent Result:", result)
    
    asyncio.run(test())

