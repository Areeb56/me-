from typing import Dict, Any
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
import random

class OptimizationAgent:
    def __init__(self):
        self.name = "Optimization Agent"
        self.description = "Implements A/B testing and updates winning templates"
    
    async def execute(self, state):
        """Execute the optimization agent logic"""
        print("{}: Running optimization cycle".format(self.name))
        
        # Get reflection insights to inform optimization
        insights = state.get("reflection_insights", [])
        metrics = state.get("reflection_metrics", {})
        
        # Determine what to optimize based on insights
        optimizations = []
        
        # Check if we need to A/B test subject lines
        reply_rate = metrics.get("reply_rate", 0)
        if reply_rate < 0.25:  # If reply rate could be better
            optimizations.append({
                "type": "subject_line_test",
                "description": "A/B test email subject lines to improve open rates",
                "variants": [
                    "Helping {company} with {pain_point}",
                    "Question about {company}'s {goal}",
                    "Ideas for improving {company}'s {area}"
                ],
                "traffic_split": [0.5, 0.3, 0.2]  # 50% A, 30% B, 20% C
            })
        
        # Check if we need to optimize email body
        meeting_rate = metrics.get("meeting_rate", 0)
        if meeting_rate < 0.15:  # Low meeting conversion
            optimizations.append({
                "type": "email_body_test",
                "description": "Test different value propositions in email body",
                "variants": [
                    "Focus on cost savings",
                    "Focus on time efficiency", 
                    "Focus on competitive advantage"
                ],
                "traffic_split": [0.4, 0.4, 0.2]
            })
        
        # Check if we need to adjust follow-up timing
        follow_up_count = state.get("follow_up_count", 0)
        if follow_up_count > 0 and reply_rate < 0.1:
            optimizations.append({
                "type": "follow_up_timing",
                "description": "Adjust follow-up sequence timing and frequency",
                "recommendation": "Increase intervals between follow-ups, add value in each touch"
            })
        
        # Store optimization plan
        state["optimization_plan"] = optimizations
        state["optimizations_applied"] = []
        
        # Apply simple optimizations (in production, would set up actual A/B tests)
        for opt in optimizations:
            if opt["type"] in ["subject_line_test", "email_body_test"]:
                # Select winning variant randomly for demo (would be based on test results)
                winning_idx = random.randrange(len(opt["variants"]))
                state["optimizations_applied"].append({
                    "type": opt["type"],
                    "winning_variant": opt["variants"][winning_idx],
                    "applied_at": "now"
                })
                print("{}: Selected variant for {}: {}".format(
                    self.name, opt["type"], opt["variants"][winning_idx]))
            else:
                state["optimizations_applied"].append({
                    "type": opt["type"],
                    "recommendation": opt.get("recommendation", ""),
                    "applied_at": "now"
                })
        
        state["current_agent"] = "OPTIMIZATION_COMPLETE"
        
        print("{}: Completed optimization cycle with {} actions".format(
            self.name, len(state["optimizations_applied"])))
        
        return state

def create_optimization_agent_workflow():
    """Create the optimization agent workflow"""
    workflow = StateGraph(dict)
    
    # Add nodes
    workflow.add_node("optimization_agent", OptimizationAgent().execute)
    
    # Set entry point
    workflow.set_entry_point("optimization_agent")
    
    # Add edge to end
    workflow.add_edge("optimization_agent", END)
    
    # Compile workflow
    memory = MemorySaver()
    app = workflow.compile(checkpointer=memory)
    
    return app

# For testing
if __name__ == "__main__":
    import asyncio
    
    async def test():
        workflow = create_optimization_agent_workflow()
        initial_state = {
            "reflection_insights": ["Low reply rate (<10%) - consider improving subject lines or targeting"],
            "reflection_metrics": {
                "reply_rate": 0.08,
                "meeting_rate": 0.12,
                "win_rate": 0.25
            },
            "follow_up_count": 2,
            "current_agent": "OPTIMIZATION"
        }
        
        result = await workflow.ainvoke(initial_state)
        print("Optimization Agent Result:", result)
    
    asyncio.run(test())
