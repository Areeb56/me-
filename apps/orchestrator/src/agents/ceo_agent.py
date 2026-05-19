from typing import Dict, Any
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

class CEOAgent:
    def __init__(self):
        self.name = "CEO Agent"
        self.description = "Receives high-level goals and delegates to COO"
    
    async def execute(self, state):
        """Execute the CEO agent logic"""
        print("{}: Processing goal - {}".format(self.name, state.get("goal", "No goal provided")))
        
        # Delegate to COO agent
        state["current_agent"] = "COO"
        state["delegated_task"] = {
            "type": "goal_decomposition",
            "goal": state.get("goal"),
            "instructions": "Break down the goal into actionable tasks for specialized agents"
        }
        
        return state

def create_ceo_agent_workflow():
    """Create the CEO agent workflow"""
    workflow = StateGraph(dict)
    
    # Add nodes
    workflow.add_node("ceo_agent", CEOAgent().execute)
    
    # Set entry point
    workflow.set_entry_point("ceo_agent")
    
    # Add edge to end
    workflow.add_edge("ceo_agent", END)
    
    # Compile workflow
    memory = MemorySaver()
    app = workflow.compile(checkpointer=memory)
    
    return app

# For testing
if __name__ == "__main__":
    import asyncio
    
    async def test():
        workflow = create_ceo_agent_workflow()
        initial_state = {
            "goal": "Find 50 SaaS leads in fintech, research them, and start outreach",
            "current_agent": "CEO"
        }
        
        result = await workflow.ainvoke(initial_state)
        print("CEO Agent Result:", result)
    
    asyncio.run(test())

