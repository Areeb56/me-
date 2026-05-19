from typing import Dict, Any
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

class COOAgent:
    def __init__(self):
        self.name = "COO Agent"
        self.description = "Routes tasks to specialized managers"
    
    async def execute(self, state):
        """Execute the COO agent logic"""
        print("{}: Routing task - {}".format(self.name, state.get("delegated_task", {}).get("type", "No task")))
        
        # Determine which manager to route to based on task type
        task_type = state.get("delegated_task", {}).get("type")
        
        if task_type == "goal_decomposition":
            state["next_manager"] = "RESEARCH_MANAGER"
        elif task_type == "outreach_creation":
            state["next_manager"] = "OUTREACH_MANAGER"
        elif task_type == "crm_update":
            state["next_manager"] = "CRM_MANAGER"
        else:
            state["next_manager"] = "RESEARCH_MANAGER"  # Default
        
        return state

def create_coo_agent_workflow():
    """Create the COO agent workflow"""
    workflow = StateGraph(dict)
    
    # Add nodes
    workflow.add_node("coo_agent", COOAgent().execute)
    
    # Set entry point
    workflow.set_entry_point("coo_agent")
    
    # Add edge to end
    workflow.add_edge("coo_agent", END)
    
    # Compile workflow
    memory = MemorySaver()
    app = workflow.compile(checkpointer=memory)
    
    return app

# For testing
if __name__ == "__main__":
    import asyncio
    
    async def test():
        workflow = create_coo_agent_workflow()
        initial_state = {
            "delegated_task": {
                "type": "goal_decomposition",
                "goal": "Find 50 SaaS leads in fintech, research them, and start outreach",
                "instructions": "Break down the goal into actionable tasks for specialized agents"
            },
            "current_agent": "COO"
        }
        
        result = await workflow.ainvoke(initial_state)
        print("COO Agent Result:", result)
    
    asyncio.run(test())

