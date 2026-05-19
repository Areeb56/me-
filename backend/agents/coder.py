"""
Coding AI agent responsible for writing, editing, and debugging code.
"""

from typing import Dict, Any
import json
import os
from datetime import datetime

# Import core components
from ..core.codex import codex  # This would be a wrapper for the actual coding model
from ..core.file_system import fs
from ..core.task_queue import task_queue
from ..core.ws_manager import manager
from ..core.litellm_router import litellm_router

class CoderAgent:
    def __init__(self):
        self.agent_type = "CodingAI"

    async def process_task(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process a coding task"""
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
            language = params.get("language", "javascript")
            framework = params.get("framework", "none")
            file_path = params.get("file_path", f"src/main.{self._get_file_extension(language)}")
            code_prompt = params.get("code_prompt", description)

            # Generate code using LLM
            prompt = f"""
            Write {language} code{f' using {framework} framework' if framework != 'none' else ''} for the following task:
            {description}

            Requirements:
            - Write clean, well-documented code
            - Follow best practices for {language}
            - {'Use ' + framework + ' patterns and conventions' if framework != 'none' else ''}
            - Include appropriate error handling
            - Make the code production-ready

            Return only the code, no explanations.
            """

            messages = [{"role": "user", "content": prompt}]
            response = await litellm_router.completion(
                model="auto",  # Let router choose best available
                messages=messages,
                temperature=0.2,  # Lower temperature for more deterministic code
                max_tokens=2000
            )

            generated_code = response.choices[0].message.content

            # Clean up the code (remove markdown formatting if present)
            if generated_code.startswith("```"):
                lines = generated_code.split('\n')
                # Find first line that's not a code fence
                start_idx = 0
                for i, line in enumerate(lines):
                    if not line.strip().startswith('```'):
                        start_idx = i
                        break
                # Find last line that's not a code fence
                end_idx = len(lines)
                for i in range(len(lines)-1, -1, -1):
                    if not lines[i].strip().startswith('```'):
                        end_idx = i + 1
                        break
                generated_code = '\n'.join(lines[start_idx:end_idx])

            # Write the code to file
            fs.write_file(file_path, generated_code)

            # Broadcast completion
            await manager.broadcast_event(
                event_type="agent:log",
                payload={
                    "message": f"Generated {language} code and saved to {file_path}",
                    "subtask_id": subtask_id,
                    "file_path": file_path
                },
                agent=self.agent_type,
                task_id=task_data.get("task_id")
            )

            # Return result
            return {
                "success": True,
                "subtask_id": subtask_id,
                "file_path": file_path,
                "language": language,
                "framework": framework,
                "code": generated_code,
                "message": f"Successfully generated {language} code"
            }

        except Exception as e:
            error_msg = f"Error in CodingAI: {str(e)}"
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

    def _get_file_extension(self, language: str) -> str:
        """Get file extension for a programming language"""
        extensions = {
            "javascript": "js",
            "typescript": "ts",
            "python": "py",
            "java": "java",
            "cpp": "cpp",
            "c": "c",
            "cs": "cs",
            "go": "go",
            "rs": "rs",
            "php": "php",
            "ruby": "rb",
            "swift": "swift",
            "kotlin": "kt",
            "html": "html",
            "css": "css",
            "scss": "scss",
            "json": "json",
            "yaml": "yaml",
            "md": "md",
            "sql": "sql"
        }
        return extensions.get(language.lower(), "txt")

# Global instance
coder_agent = CoderAgent()