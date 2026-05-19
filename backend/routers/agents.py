"""
Agent management endpoints.
Handles creation, monitoring, and control of AI agents.
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List, Dict, Any
import uuid
import asyncio

router = APIRouter()

# Mock agent data for now
agents_data = {
    "coding": {"id": "coding-1", "name": "CodingAI", "status": "idle", "current_task": None},
    "terminal": {"id": "terminal-1", "name": "TerminalAI", "status": "idle", "current_task": None},
    "browser": {"id": "browser-1", "name": "BrowserAI", "status": "idle", "current_task": None},
    "research": {"id": "research-1", "name": "ResearchAI", "status": "idle", "current_task": None},
    "deploy": {"id": "deploy-1", "name": "DeploymentAI", "status": "idle", "current_task": None},
    "github": {"id": "github-1", "name": "GitHubAI", "status": "idle", "current_task": None},
    "email": {"id": "email-1", "name": "EmailAI", "status": "idle", "current_task": None},
    "memory": {"id": "memory-1", "name": "MemoryAI", "status": "idle", "current_task": None}
}

@router.get("/")
async def get_agents():
    """Get status of all agents"""
    return {"agents": list(agents_data.values())}

@router.get("/{agent_id}")
async def get_agent(agent_id: str):
    """Get details of a specific agent"""
    if agent_id in agents_data:
        return agents_data[agent_id]
    return {"error": "Agent not found"}

@router.post("/{agent_id}/task")
async def assign_task(agent_id: str, task: dict):
    """Assign a task to an agent"""
    if agent_id in agents_data:
        agents_data[agent_id]["status"] = "running"
        agents_data[agent_id]["current_task"] = task
        # In a real implementation, this would trigger the agent to start working
        return {"message": f"Task assigned to {agents_data[agent_id]['name']}"}
    return {"error": "Agent not found"}

@router.post("/{agent_id}/stop")
async def stop_agent(agent_id: str):
    """Stop an agent's current task"""
    if agent_id in agents_data:
        agents_data[agent_id]["status"] = "idle"
        agents_data[agent_id]["current_task"] = None
        return {"message": f"Stopped {agents_data[agent_id]['name']}"}
    return {"error": "Agent not found"}

# WebSocket endpoint for real-time agent updates
@router.websocket("/ws")
async def agent_websocket(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Send periodic updates about agent status
            await asyncio.sleep(2)
            await websocket.send_json({
                "type": "agent_update",
                "data": list(agents_data.values())
            })
    except WebSocketDisconnect:
        pass