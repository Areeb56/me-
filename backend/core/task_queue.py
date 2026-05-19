"""
Task queue management using Redis.
Handles queuing and processing of agent tasks.
"""

import json
import uuid
from typing import Optional, List
import redis.asyncio as redis
from datetime import datetime

class TaskQueue:
    def __init__(self, redis_url: str = "redis://redis:6379"):
        self.redis_url = redis_url
        self.redis: Optional[redis.Redis] = None

    async def connect(self):
        """Initialize Redis connection"""
        if not self.redis:
            self.redis = redis.from_url(self.redis_url)

    async def disconnect(self):
        """Close Redis connection"""
        if self.redis:
            await self.redis.close()

    async def enqueue_task(self, task_type: str, payload: dict, priority: int = 0) -> str:
        """Add a task to the queue"""
        await self.connect()

        task_id = str(uuid.uuid4())
        task = {
            "id": task_id,
            "type": task_type,
            "payload": payload,
            "priority": priority,
            "created_at": datetime.now().isoformat(),
            "status": "queued"
        }

        # Store task in hash for quick lookup
        await self.redis.hset(f"task:{task_id}", mapping=task)

        # Add to sorted set for priority queue (higher priority first)
        await self.redis.zadd("task_queue", {task_id: -priority})  # Negative for ascending order

        return task_id

    async def dequeue_task(self) -> Optional[dict]:
        """Get the next task from the queue"""
        await self.connect()

        # Get the highest priority task (lowest score in our case)
        result = await self.redis.zpopmin("task_queue")
        if not result:
            return None

        task_id, _ = result[0]
        task_data = await self.redis.hgetall(f"task:{task_id}")

        if task_data:
            # Update status to processing
            await self.redis.hset(f"task:{task_id}", "status", "processing")
            return {k.decode(): v.decode() if isinstance(v, bytes) else v for k, v in task_data.items()}

        return None

    async def complete_task(self, task_id: str, result: dict = None):
        """Mark a task as completed"""
        await self.connect()

        updates = {
            "status": "completed",
            "completed_at": datetime.now().isoformat()
        }

        if result:
            updates["result"] = json.dumps(result)

        await self.redis.hset(f"task:{task_id}", mapping=updates)

    async def fail_task(self, task_id: str, error: str):
        """Mark a task as failed"""
        await self.connect()

        await self.redis.hset(f"task:{task_id}", mapping={
            "status": "failed",
            "failed_at": datetime.now().isoformat(),
            "error": error
        })

    async def get_task(self, task_id: str) -> Optional[dict]:
        """Get task details by ID"""
        await self.connect()
        task_data = await self.redis.hgetall(f"task:{task_id}")
        if task_data:
            return {k.decode(): v.decode() if isinstance(v, bytes) else v for k, v in task_data.items()}
        return None

    async def get_queue_length(self) -> int:
        """Get the number of tasks in the queue"""
        await self.connect()
        return await self.redis.zcard("task_queue")

# Global instance
task_queue = TaskQueue()