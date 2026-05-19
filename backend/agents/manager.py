"""
Manager AI - The central orchestrator that coordinates all other agents.
Uses LangGraph to manage the workflow of task decomposition and execution.
"""

from typing import Dict, List, Any, TypedDict, Annotated
from langgraph.graph import StateGraph, END
import asyncio
import json
from datetime import datetime

# Import other agents (would be imported in real implementation)
# from .coder import CoderAgent
# from .terminal import TerminalAgent
# from .browser import BrowserAgent
# from .research import ResearchAgent
# from .deploy import DeployAgent
# from .github import GithubAgent
# from .email import EmailAgent
# from .memory import MemoryAgent

# Import core components
from ..core.task_queue import task_queue
from ..core.ws_manager import manager

class AgentState(TypedDict):
    """State passed between nodes in the LangGraph"""
    task_id: str
    user_goal: str
    subtasks: List[Dict[str, Any]]
    agent_outputs: Dict[str, Any]
    memory_context: str
    error_log: List[str]
    status: str
    ws_channel: str

class ManagerAgent:
    def __init__(self):
        self.graph = self._build_graph()

    def _build_graph(self) -> StateGraph:
        """Build the LangGraph for task orchestration"""
        workflow = StateGraph(AgentState)

        # Add nodes
        workflow.add_node("task_decompose", self.task_decompose)
        workflow.add_node("agent_assign", self.agent_assign)
        workflow.add_node("execute_graph", self.execute_graph)
        workflow.add_node("monitor_nodes", self.monitor_nodes)
        workflow.add_node("memory_sync", self.memory_sync)
        workflow.add_node("respond", self.respond)

        # Add edges
        workflow.set_entry_point("task_decompose")
        workflow.add_edge("task_decompose", "agent_assign")
        workflow.add_edge("agent_assign", "execute_graph")
        workflow.add_edge("execute_graph", "monitor_nodes")
        workflow.add_edge("monitor_nodes", "memory_sync")
        workflow.add_edge("memory_sync", "respond")
        workflow.add_edge("respond", END)

        return workflow.compile()

    async def task_decompose(self, state: AgentState) -> AgentState:
        """Break down the user goal into subtasks"""
        # In a real implementation, this would use an LLM to decompose the task
        # For now, we'll use a simple rule-based approach

        user_goal = state["user_goal"].lower()

        # Simple task decomposition based on keywords
        subtasks = []

        if "website" in user_goal or "web" in user_goal or "html" in user_goal:
            subtasks.append({
                "id": "subtask-1",
                "agent": "BrowserAI",
                "action": "research",
                "description": "Research current web technologies and trends",
                "params": {"query": state["user_goal"]}
            })

        if "code" in user_goal or "program" in user_goal or "software" in user_goal:
            subtasks.append({
                "id": "subtask-2",
                "agent": "CodingAI",
                "action": "write_code",
                "description": "Write code based on requirements",
                "params": {"language": "javascript", "framework": "react"}
            })

        if "email" in user_goal or "send" in user_goal or "message" in user_goal:
            subtasks.append({
                "id": "subtask-3",
                "agent": "EmailAI",
                "action": "send_email",
                "description": "Send emails to target recipients",
                "params": {"template": "professional"}
            })

        if "deploy" in user_goal or "deploy" in user_goal or "host" in user_goal:
            subtasks.append({
                "id": "subtask-4",
                "agent": "DeploymentAI",
                "action": "deploy",
                "description": "Deploy the application to a hosting platform",
                "params": {"platform": "vercel"}
            })

        # If no specific tasks identified, create a general research task
        if not subtasks:
            subtasks.append({
                "id": "subtask-1",
                "agent": "ResearchAI",
                "action": "research",
                "description": "Research the topic to gather information",
                "params": {"query": state["user_goal"]}
            })

        state["subtasks"] = subtasks
        return state

    async def agent_assign(self, state: AgentState) -> AgentState:
        """Assign subtasks to appropriate agents"""
        # In a real implementation, this would consider agent availability, expertise, etc.
        # For now, we'll just enqueue the tasks

        for subtask in state["subtasks"]:
            # Enqueue task for execution
            task_id = await task_queue.enqueue_task(
                task_type=f"{subtask['agent']}_{subtask['action']}",
                payload={
                    "subtask_id": subtask["id"],
                    "description": subtask["description"],
                    "params": subtask["params"],
                    "user_goal": state["user_goal"]
                }
            )
            subtask["task_id"] = task_id

        return state

    async def execute_graph(self, state: AgentState) -> AgentState:
        """Execute the LangGraph (in this case, just wait for tasks to complete)"""
        # In a real implementation, this would manage the execution of the graph
        # For now, we'll simulate waiting for tasks to complete

        # Wait a bit for tasks to be processed
        await asyncio.sleep(2)

        # Update status
        state["status"] = "executing"
        return state

    async def monitor_nodes(self, state: AgentState) -> AgentState:
        """Monitor the execution of agent nodes"""
        # Check status of all subtasks
        completed_count = 0
        failed_count = 0

        for subtask in state["subtasks"]:
            task_info = await task_queue.get_task(subtask["task_id"])
            if task_info:
                if task_info["status"] == "completed":
                    completed_count += 1
                    # Store output
                    if "result" in task_info:
                        state["agent_outputs"][subtask["id"]] = json.loads(task_info["result"])
                elif task_info["status"] == "failed":
                    failed_count += 1
                    state["error_log"].append(f"Subtask {subtask['id']} failed: {task_info.get('error', 'Unknown error')}")

        # Update status based on completion
        total_tasks = len(state["subtasks"])
        if completed_count == total_tasks:
            state["status"] = "completed"
        elif failed_count > 0:
            state["status"] = "partial_failure"
        elif completed_count > 0:
            state["status"] = "partially_completed"
        else:
            state["status"] = "in_progress"

        return state

    async def memory_sync(self, state: AgentState) -> AgentState:
        """Sync results with memory agent"""
        # In a real implementation, this would store results in the memory agent
        # For now, we'll just add a note to the memory context

        memory_entry = f"""
        Task completed at {datetime.now().isoformat()}:
        User Goal: {state['user_goal']}
        Status: {state['status']}
        Completed Subtasks: {len([s for s in state['subtasks'] if s.get('task_id') and
                                (await task_queue.get_task(s['task_id']))['status'] == 'completed'])}
        """

        if state["memory_context"]:
            state["memory_context"] += "\n---\n" + memory_entry
        else:
            state["memory_context"] = memory_entry

        return state

    async def respond(self, state: AgentState) -> AgentState:
        """Generate final response to the user"""
        # Prepare response based on outputs
        if state["status"] == "completed":
            state["agent_outputs"]["final_response"] = {
                "success": True,
                "message": "Task completed successfully",
                "outputs": state["agent_outputs"]
            }
        elif state["status"] == "partial_failure":
            state["agent_outputs"]["final_response"] = {
                "success": False,
                "message": "Task completed with some errors",
                "errors": state["error_log"],
                "outputs": state["agent_outputs"]
            }
        else:
            state["agent_outputs"]["final_response"] = {
                "success": False,
                "message": "Task is still in progress or failed",
                "status": state["status"],
                "errors": state["error_log"]
            }

        # Broadcast completion via WebSocket
        await manager.broadcast_event(
            event_type="agent:complete",
            payload=state["agent_outputs"]["final_response"],
            agent="ManagerAI",
            task_id=state["task_id"]
        )

        return state

    async def process_task(self, user_goal: str) -> Dict[str, Any]:
        """Main entry point for processing a user task"""
        task_id = f"task-{asyncio.get_event_loop().time()}"

        initial_state: AgentState = {
            "task_id": task_id,
            "user_goal": user_goal,
            "subtasks": [],
            "agent_outputs": {},
            "memory_context": "",
            "error_log": [],
            "status": "initialized",
            "ws_channel": f"task-{task_id}"
        }

        # Run the graph
        final_state = await self.graph.ainvoke(initial_state)

        return final_state["agent_outputs"].get("final_response", {
            "success": False,
            "message": "Unknown error occurred"
        })

# Global instance
manager_agent = ManagerAgent()