"""
Main entry point for the AIOS backend.
Initializes the FastAPI application and includes all routers.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# Import routers
from routers import agents, workspace, browser, models, deploy

# Import core components
from core.ws_manager import manager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting AIOS Backend...")
    yield
    # Shutdown
    print("Shutting down AIOS Backend...")

app = FastAPI(
    title="AIOS Backend",
    description="Backend for Autonomous AI Operating System",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(agents.router, prefix="/api/agents", tags=["agents"])
app.include_router(workspace.router, prefix="/api/workspace", tags=["workspace"])
app.include_router(browser.router, prefix="/api/browser", tags=["browser"])
app.include_router(models.router, prefix="/api/models", tags=["models"])
app.include_router(deploy.router, prefix="/api/deploy", tags=["deploy"])

# WebSocket endpoint
@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket, client_id: str):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo back for now - in real implementation, this would handle specific messages
            await manager.send_personal_message(f"Echo: {data}", websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        manager.disconnect(websocket)

@app.get("/")
async def root():
    return {"message": "Welcome to AIOS Backend"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "aios-backend"}