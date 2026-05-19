from typing import Dict, Any
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
import json
from datetime import datetime

class ReflectionAgent:
    def __init__(self):
        self.name = "Reflection Agent"
        self.description = "Analyzes performance metrics and suggests improvements"
    
    async def execute(self, state):
        """Execute the reflection agent logic"""
        print("{}: Analyzing performance metrics".format(self.name))
        
        # Gather metrics from state
        emails_sent = state.get("email_sent_count", 0)
        replies_received = state.get("reply_received_count", 0)
        meetings_booked = state.get("meeting_booked_count", 0)
        deals_won = state.get("deals_won_count", 0)
        follow_ups_sent = state.get("follow_up_count", 0)
        
        # Calculate rates
        reply_rate = replies_received / max(emails_sent, 1)
        meeting_rate = meetings_booked / max(replies_received, 1)
        win_rate = deals_won / max(meetings_booked, 1)
        
        # Generate insights
        insights = []
        if reply_rate < 0.1:
            insights.append("Low reply rate (<10%) - consider improving subject lines or targeting")
        elif reply_rate < 0.3:
            insights.append("Moderate reply rate (10-30%) - room for improvement in personalization")
        else:
            insights.append("Good reply rate (>30%) - messaging is resonating well")
        
        if meeting_rate < 0.2:
            insights.append("Low meeting conversion (<20%) - consider refining call-to-action or value proposition")
        else:
            insights.append("Good meeting conversion (>20%) - effective at moving conversations forward")
        
        if win_rate < 0.3:
            insights.append("Low win rate (<30%) - may need better qualification or sales process improvements")
        else:
            insights.append("Strong win rate (>30%) - sales process is effective")
        
        # Store insights in state
        state["reflection_insights"] = insights
        state["reflection_metrics"] = {
            "emails_sent": emails_sent,
            "replies_received": replies_received,
            "meetings_booked": meetings_booked,
            "deals_won": deals_won,
            "reply_rate": reply_rate,
            "meeting_rate": meeting_rate,
            "win_rate": win_rate,
            "timestamp": datetime.now().isoformat()
        }
        state["current_agent"] = "REFLECTION_COMPLETE"
        
        print("{}: Generated {} insights".format(self.name, len(insights)))
        for insight in insights:
            print("  - {}".format(insight))
        
        return state

def create_reflection_agent_workflow():
    """Create the reflection agent workflow"""
    workflow = StateGraph(dict)
    
    # Add nodes
    workflow.add_node("reflection_agent", ReflectionAgent().execute)
    
    # Set entry point
    workflow.set_entry_point("reflection_agent")
    
    # Add edge to end
    workflow.add_edge("reflection_agent", END)
    
    # Compile workflow
    memory = MemorySaver()
    app = workflow.compile(checkpointer=memory)
    
    return app

# For testing
if __name__ == "__main__":
    import asyncio
    
    async def test():
        workflow = create_reflection_agent_workflow()
        initial_state = {
            "email_sent_count": 50,
            "reply_received_count": 8,
            "meeting_booked_count": 2,
            "deals_won_count": 1,
            "follow_up_count": 5,
            "current_agent": "REFLECTION"
        }
        
        result = await workflow.ainvoke(initial_state)
        print("Reflection Agent Result:", result)
    
    asyncio.run(test())
