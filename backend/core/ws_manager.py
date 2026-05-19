"""
WebSocket manager for handling real-time communication.
Manages connections and broadcasts events to clients.
"""

from typing import Dict, List
from fastapi import WebSocket
import json
import asyncio
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, client_id: str = "default"):
        """Accept a new WebSocket connection"""
        await websocket.accept()
        if client_id not in self.active_connections:
            self.active_connections[client_id] = []
        self.active_connections[client_id].append(websocket)
        logger.info(f"WebSocket connected: {client_id}")

    def disconnect(self, websocket: WebSocket, client_id: str = "default"):
        """Remove a WebSocket connection"""
        if client_id in self.active_connections:
            if websocket in self.active_connections[client_id]:
                self.active_connections[client_id].remove(websocket)
                if not self.active_connections[client_id]:
                    del self.active_connections[client_id]
        logger.info(f"WebSocket disconnected: {client_id}")

    async def send_personal_message(self, message: str, websocket: WebSocket):
        """Send a message to a specific WebSocket"""
        try:
            await websocket.send_text(message)
        except Exception as e:
            logger.error(f"Error sending personal message: {e}")

    async def send_json_message(self, data: dict, websocket: WebSocket):
        """Send JSON data to a specific WebSocket"""
        try:
            await websocket.send_json(data)
        except Exception as e:
            logger.error(f"Error sending JSON message: {e}")

    async def broadcast(self, message: str, client_id: str = "default"):
        """Broadcast a message to all connections for a client"""
        if client_id in self.active_connections:
            for connection in self.active_connections[client_id]:
                try:
                    await connection.send_text(message)
                except Exception as e:
                    logger.error(f"Error broadcasting to {client_id}: {e}")
                    # Remove broken connection
                    self.active_connections[client_id].remove(connection)

    async def broadcast_json(self, data: dict, client_id: str = "default"):
        """Broadcast JSON data to all connections for a client"""
        if client_id in self.active_connections:
            for connection in self.active_connections[client_id]:
                try:
                    await connection.send_json(data)
                except Exception as e:
                    logger.error(f"Error broadcasting JSON to {client_id}: {e}")
                    # Remove broken connection
                    self.active_connections[client_id].remove(connection)

    async def broadcast_event(self, event_type: str, payload: dict, agent: str = None, task_id: str = None, client_id: str = "default"):
        """Broadcast a standardized event"""
        event = {
            "type": event_type,
            "agent": agent,
            "payload": payload,
            "timestamp": asyncio.get_event_loop().time(),
            "task_id": task_id
        }
        await self.broadcast_json(event, client_id)

manager = ConnectionManager()