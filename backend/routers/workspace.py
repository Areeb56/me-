"""
Workspace operations endpoints.
Handles file operations, terminal commands, and git operations.
"""

from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
import os
import json
from pathlib import Path

router = APIRouter()

# Mock file system for now
MOCK_FILES = {
    "src": {
        "type": "directory",
        "children": {
            "components": {
                "type": "directory",
                "children": {
                    "Button.tsx": {"type": "file", "content": "// Button component\nimport React from 'react';\n\nexport const Button = () => {\n  return <button>Click me</button>;\n};\n"},
                    "Header.tsx": {"type": "file", "content": "// Header component\nimport React from 'react';\n\nexport const Header = () => {\n  return <header><h1>My App</h1></header>;\n};\n"}
                }
            },
            "App.tsx": {"type": "file", "content": "// Main App component\nimport React from 'react';\n\nfunction App() {\n  return (\n    <div>\n      <h1>Hello World</h1>\n    </div>\n  );\n}\n\nexport default App;\n"}
        }
    },
    "package.json": {"type": "file", "content": '{\n  "name": "my-app",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^18.2.0"\n  }\n}'},
    "README.md": {"type": "file", "content": "# My Application\n\nThis is a sample project."}
}

@router.get("/files")
async def get_files():
    """Get file system structure"""
    return {"files": MOCK_FILES}

@router.get("/files/{path:path}")
async def get_file(path: str):
    """Get content of a specific file"""
    # Simple path traversal for demo
    parts = path.split("/")
    current = MOCK_FILES

    for part in parts:
        if part in current and current[part]["type"] == "directory":
            current = current[part]["children"]
        elif part in current and current[part]["type"] == "file":
            return {"content": current[part]["content"]}
        else:
            raise HTTPException(status_code=404, detail="File not found")

    raise HTTPException(status_code=404, detail="File not found")

@router.post("/files")
async def create_file(file_data: dict):
    """Create a new file"""
    # In a real implementation, this would create the file on disk
    return {"message": f"File {file_data['name']} created"}

@router.put("/files/{path:path}")
async def update_file(path: str, file_data: dict):
    """Update file content"""
    # In a real implementation, this would update the file on disk
    return {"message": f"File {path} updated"}

@router.delete("/files/{path:path}")
async def delete_file(path: str):
    """Delete a file"""
    # In a real implementation, this would delete the file from disk
    return {"message": f"File {path} deleted"}

# Terminal endpoints
@router.post("/terminal/execute")
async def execute_command(command: dict):
    """Execute a terminal command"""
    # In a real implementation, this would execute the command in a PTY
    return {
        "output": f"Executed: {command.get('cmd', '')}\n",
        "exit_code": 0
    }

@router.post("/terminal/write")
async def write_to_terminal(data: dict):
    """Write data to terminal stdin"""
    return {"message": "Data written to terminal"}

# Git endpoints
@router.get("/git/status")
async def get_git_status():
    """Get git status"""
    return {
        "modified": ["src/components/Button.tsx", "src/components/Header.tsx"],
        "added": ["src/utils/helpers.ts"],
        "deleted": ["src/App.tsx"]
    }

@router.post("/git/commit")
async def git_commit(commit_data: dict):
    """Create a git commit"""
    return {"message": "Commit created", "commit_id": "abc123"}

@router.post("/git/push")
async def git_push():
    """Push to remote repository"""
    return {"message": "Pushed to remote"}