"""
File system sandbox for safe file operations.
Restricts file operations to a sandboxed directory.
"""

import os
import shutil
from pathlib import Path
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

class FileSystem:
    def __init__(self, sandbox_path: str = "/workspace"):
        self.sandbox_path = Path(sandbox_path).resolve()
        self._ensure_sandbox_exists()

    def _ensure_sandbox_exists(self):
        """Ensure the sandbox directory exists"""
        self.sandbox_path.mkdir(parents=True, exist_ok=True)

    def _resolve_path(self, path: str) -> Path:
        """Resolve a path within the sandbox and ensure it's safe"""
        # Convert to Path object
        target_path = (self.sandbox_path / path).resolve()

        # Ensure the path is within the sandbox (prevent directory traversal)
        if not str(target_path).startswith(str(self.sandbox_path)):
            raise ValueError(f"Path {path} is outside the sandbox")

        return target_path

    def exists(self, path: str) -> bool:
        """Check if a file or directory exists"""
        try:
            target_path = self._resolve_path(path)
            return target_path.exists()
        except ValueError:
            return False

    def is_file(self, path: str) -> bool:
        """Check if a path is a file"""
        try:
            target_path = self._resolve_path(path)
            return target_path.is_file()
        except ValueError:
            return False

    def is_directory(self, path: str) -> bool:
        """Check if a path is a directory"""
        try:
            target_path = self._resolve_path(path)
            return target_path.is_directory()
        except ValueError:
            return False

    def read_file(self, path: str) -> str:
        """Read the contents of a file"""
        try:
            target_path = self._resolve_path(path)
            with open(target_path, 'r', encoding='utf-8') as f:
                return f.read()
        except ValueError as e:
            raise PermissionError(f"Access denied: {e}")
        except FileNotFoundError:
            raise FileNotFoundError(f"File not found: {path}")
        except Exception as e:
            raise IOError(f"Error reading file {path}: {e}")

    def write_file(self, path: str, content: str, overwrite: bool = False):
        """Write content to a file"""
        try:
            target_path = self._resolve_path(path)

            # Check if file exists and we shouldn't overwrite
            if target_path.exists() and not overwrite:
                raise FileExistsError(f"File already exists: {path}")

            # Ensure parent directory exists
            target_path.parent.mkdir(parents=True, exist_ok=True)

            with open(target_path, 'w', encoding='utf-8') as f:
                f.write(content)

        except ValueError as e:
            raise PermissionError(f"Access denied: {e}")
        except Exception as e:
            raise IOError(f"Error writing file {path}: {e}")

    def create_directory(self, path: str):
        """Create a directory"""
        try:
            target_path = self._resolve_path(path)
            target_path.mkdir(parents=True, exist_ok=True)
        except ValueError as e:
            raise PermissionError(f"Access denied: {e}")
        except Exception as e:
            raise IOError(f"Error creating directory {path}: {e}")

    def delete_file(self, path: str):
        """Delete a file"""
        try:
            target_path = self._resolve_path(path)
            if target_path.is_file():
                target_path.unlink()
            else:
                raise ValueError(f"Path is not a file: {path}")
        except ValueError as e:
            raise PermissionError(f"Access denied: {e}")
        except FileNotFoundError:
            raise FileNotFoundError(f"File not found: {path}")
        except Exception as e:
            raise IOError(f"Error deleting file {path}: {e}")

    def delete_directory(self, path: str):
        """Delete a directory and its contents"""
        try:
            target_path = self._resolve_path(path)
            if target_path.is_directory():
                shutil.rmtree(target_path)
            else:
                raise ValueError(f"Path is not a directory: {path}")
        except ValueError as e:
            raise PermissionError(f"Access denied: {e}")
        except FileNotFoundError:
            raise FileNotFoundError(f"Directory not found: {path}")
        except Exception as e:
            raise IOError(f"Error deleting directory {path}: {e}")

    def list_directory(self, path: str = "") -> List[dict]:
        """List contents of a directory"""
        try:
            target_path = self._resolve_path(path)
            if not target_path.is_directory():
                raise ValueError(f"Path is not a directory: {path}")

            items = []
            for item in target_path.iterdir():
                items.append({
                    "name": item.name,
                    "path": str(item.relative_to(self.sandbox_path)),
                    "type": "directory" if item.is_directory() else "file",
                    "size": item.stat().st_size if item.is_file() else None,
                    "modified": item.stat().st_mtime
                })

            return sorted(items, key=lambda x: (x["type"] == "file", x["name"]))
        except ValueError as e:
            raise PermissionError(f"Access denied: {e}")
        except FileNotFoundError:
            raise FileNotFoundError(f"Directory not found: {path}")
        except Exception as e:
            raise IOError(f"Error listing directory {path}: {e}")

    def move(self, source: str, destination: str):
        """Move a file or directory"""
        try:
            source_path = self._resolve_path(source)
            dest_path = self._resolve_path(destination)

            # Ensure destination parent exists
            dest_path.parent.mkdir(parents=True, exist_ok=True)

            shutil.move(str(source_path), str(dest_path))
        except ValueError as e:
            raise PermissionError(f"Access denied: {e}")
        except FileNotFoundError:
            raise FileNotFoundError(f"Source not found: {source}")
        except Exception as e:
            raise IOError(f"Error moving {source} to {destination}: {e}")

    def copy(self, source: str, destination: str):
        """Copy a file or directory"""
        try:
            source_path = self._resolve_path(source)
            dest_path = self._resolve_path(destination)

            # Ensure destination parent exists
            dest_path.parent.mkdir(parents=True, exist_ok=True)

            if source_path.is_file():
                shutil.copy2(str(source_path), str(dest_path))
            else:
                shutil.copytree(str(source_path), str(dest_path))
        except ValueError as e:
            raise PermissionError(f"Access denied: {e}")
        except FileNotFoundError:
            raise FileNotFoundError(f"Source not found: {source}")
        except Exception as e:
            raise IOError(f"Error copying {source} to {destination}: {e}")

# Global instance
fs = FileSystem()