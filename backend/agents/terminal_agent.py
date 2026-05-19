"""
Terminal AI agent responsible for executing terminal commands and managing processes.
"""

from typing import Dict, Any
import asyncio
import logging
from datetime import datetime

# Import core components
from ..core.terminal_manager import terminal_manager
from ..core.file_system import fs
from ..core.task_queue import task_queue
from ..core.ws_manager import manager

logger = logging.getLogger(__name__)

class TerminalAgent:
    def __init__(self):
        self.agent_type = "TerminalAI"

    async def process_task(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process a terminal task"""
        subtask_id = task_data.get("subtask_id", "unknown")
        description = task_data.get("description", "")
        params = task_data.get("params", {})

        try:
            # Broadcast start
            await manager.broadcast_event(
                event_type="agent:start",
                payload={"description": description, "subtask_id": subtask_id},
                agent=self.agent_type,
                task_id=task_data.get("task_id")
            )

            # Extract parameters
            command = params.get("command", "")
            cwd = params.get("cwd", "/workspace")
            timeout = params.get("timeout", 30)
            inputs = params.get("inputs", [])  # List of inputs to provide during execution

            if not command:
                raise ValueError("No command provided")

            # Create and start terminal session
            session_id = await terminal_manager.create_session(command=command, cwd=cwd)
            started = await terminal_manager.start_session(session_id)

            if not started:
                raise RuntimeError("Failed to start terminal session")

            # Wait for command to complete with timeout
            start_time = asyncio.get_event_loop().time()
            while True:
                session = await terminal_manager.get_session(session_id)
                if session and session.state in ["finished", "error"]:
                    break
                if asyncio.get_event_loop().time() - start_time > timeout:
                    await terminal_manager.terminate_session(session_id)
                    raise TimeoutError(f"Command timed out after {timeout} seconds")
                await asyncio.sleep(0.1)

            # Get final session state
            session = await terminal_manager.get_session(session_id)
            output = session.output if session else ""
            exit_code = session.exit_code if session else -1

            # Provide inputs if needed (this would be handled in a more sophisticated implementation)
            # For now, we assume the command doesn't need interactive input

            # Clean up session
            await terminal_manager.remove_session(session_id)

            # Broadcast completion
            await manager.broadcast_event(
                event_type="agent:log",
                payload={
                    "message": f"Executed command: {command}",
                    "subtask_id": subtask_id,
                    "exit_code": exit_code,
                    "output_length": len(output)
                },
                agent=self.agent_type,
                task_id=task_data.get("task_id")
            )

            # Return result
            result = {
                "success": exit_code == 0,
                "subtask_id": subtask_id,
                "command": command,
                "exit_code": exit_code,
                "output": output,
                "message": f"Command executed with exit code {exit_code}"
            }

            # If there was output, truncate it for the response to avoid huge responses
            if len(output) > 1000:
                result["output"] = output[:1000] + "... [output truncated]"

            return result

        except Exception as e:
            error_msg = f"Error in TerminalAI: {str(e)}"
            # Broadcast error
            await manager.broadcast_event(
                event_type="agent:error",
                payload={"error": error_msg, "subtask_id": subtask_id},
                agent=self.agent_type,
                task_id=task_data.get("task_id")
            )
            return {
                "success": False,
                "error": error_msg,
                "subtask_id": subtask_id
            }

# Global instance
terminal_agent = TerminalAgent()