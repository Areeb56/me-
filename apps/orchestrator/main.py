from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Any
import asyncio
import httpx
import os
import json
from datetime import datetime, timedelta

from agents.ceo_agent import CEOResponse, run_ceo_pipeline
from agents.research_agent import run_research_graph
from agents.outreach_agent import generate_outreach_email
from agents.reflection_agent import run_reflection
from memory.vector_store import VectorMemory
from models.router import ModelRouter

app = FastAPI(title="AIOS Orchestrator", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

memory = VectorMemory()
model_router = ModelRouter()

class ResearchRequest(BaseModel):
    lead_id: str
    domain: Optional[str] = None
    website_url: Optional[str] = None

class OutreachRequest(BaseModel):
    lead_id: str
    contact_id: str
    campaign_id: str

class PipelineRequest(BaseModel):
    goal: str
    target_count: int = 50
    industry: Optional[str] = None
    filters: Optional[dict] = None

class ReflectRequest(BaseModel):
    campaign_id: Optional[str] = None
    date_range: str = "7d"

class MemoryRequest(BaseModel):
    content: str
    agent_type: Optional[str] = None
    metadata: Optional[dict] = None

class MemorySearchRequest(BaseModel):
    q: str
    agent_type: Optional[str] = None
    limit: int = 10

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "model_router": model_router.get_status(),
    }

@app.post("/run/research")
async def run_research(request: ResearchRequest, background_tasks: BackgroundTasks):
    try:
        result = await run_research_graph(
            lead_id=request.lead_id,
            domain=request.domain,
            website_url=request.website_url,
        )
        return {"run_id": result.get("run_id"), "status": "completed", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/run/outreach")
async def run_outreach(request: OutreachRequest):
    try:
        result = await generate_outreach_email(
            lead_id=request.lead_id,
            contact_id=request.contact_id,
            campaign_id=request.campaign_id,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/run/pipeline")
async def run_pipeline(request: PipelineRequest, background_tasks: BackgroundTasks):
    try:
        background_tasks.add_task(
            run_ceo_pipeline,
            goal=request.goal,
            target_count=request.target_count,
            industry=request.industry,
            filters=request.filters,
        )
        return {"status": "pipeline_started", "goal": request.goal}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/run/reflect")
async def run_reflect_endpoint(request: ReflectRequest):
    try:
        days = int(request.date_range.replace("d", ""))
        result = await run_reflection(
            campaign_id=request.campaign_id,
            days=days,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/run/follow-up")
async def run_follow_up(request: dict):
    from agents.follow_up_agent import generate_follow_up
    try:
        result = await generate_follow_up(
            deal_id=request.get("deal_id"),
            sequence_step=request.get("sequence_step", 1),
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/agents/status")
async def get_agents_status():
    return {
        "agents": [
            {"agent_type": "ceo", "status": "idle"},
            {"agent_type": "coo", "status": "idle"},
            {"agent_type": "research_manager", "status": "idle"},
            {"agent_type": "outreach_manager", "status": "idle"},
            {"agent_type": "follow_up", "status": "idle"},
            {"agent_type": "crm_manager", "status": "idle"},
            {"agent_type": "reflection", "status": "idle"},
            {"agent_type": "optimization", "status": "idle"},
            {"agent_type": "browser", "status": "idle"},
        ]
    }

@app.get("/memories/search")
async def search_memories(q: str, agent_type: Optional[str] = None, limit: int = 10):
    try:
        results = memory.search(q, agent_type=agent_type, limit=limit)
        return {"memories": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/memories")
async def create_memory(request: MemoryRequest):
    try:
        memory_id = memory.add(
            content=request.content,
            agent_type=request.agent_type,
            metadata=request.metadata,
        )
        return {"id": memory_id, "status": "stored"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/metrics")
async def get_metrics():
    return {
        "total_runs": 0,
        "total_tokens": 0,
        "by_agent": [],
    }
