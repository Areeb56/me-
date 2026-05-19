"""
Terminal manager for handling PTY-based terminal sessions.
Provides interface for executing commands in isolated environments.
"""

import asyncio
import pty
import os
import signal
from typing import Optional, Dict, Any
import logging
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)

class TerminalState(Enum):
    IDLE = "idle"
    RUNNING = "running"
    FINISHED = "finished"
    ERROR = "error"

@dataclass
class TerminalSession:
    id: str
    pid: Optional[int] = None
    fd: Optional[int] = None
    command: str = ""
    cwd: str = "/workspace"
    output: str = ""
    state: TerminalState = TerminalState.IDLE
    exit_code: Optional[int] = None

class TerminalManager:
    def __init__(self):
        self.sessions: Dict[str, TerminalSession] = {}

    async def create_session(self, command: str = "", cwd: str = "/workspace") -> str:
        """Create a new terminal session"""
        session_id = f"term-{len(self.sessions) + 1}"

        session = TerminalSession(
            id=session_id,
            command=command,
            cwd=cwd,
            state=TerminalState.IDLE
        )

        self.sessions[session_id] = session
        return session_id

    async def start_session(self, session_id: str) -> bool:
        """Start a terminal session"""
        if session_id not in self.sessions:
            return False

        session = self.sessions[session_id]

        try:
            # Create pseudo-terminal
            pid, fd = pty.fork()

            if pid == 0:  # Child process
                # Change to working directory
                os.chdir(session.cwd)

                # Execute command
                if session.command:
                    args = session.command.split()
                    os.execvp(args[0], args)
                else:
                    # Start shell
                    os.execvp(os.environ.get('SHELL', 'sh'), ['sh'])
            else:  # Parent process
                session.pid = pid
                session.fd = fd
                session.state = TerminalState.RUNNING

                # Start reading output asynchronously
                asyncio.create_task(self._read_output(session_id))

                return True

        except Exception as e:
            logger.error(f"Failed to start terminal session {session_id}: {e}")
            session.state = TerminalState.ERROR
            return False

    async def _read_output(self, session_id: str):
        """Read output from a terminal session"""
        if session_id not in self.sessions:
            return

        session = self.sessions[session_id]

        try:
            while session.state == TerminalState.RUNNING and session.fd is not None:
                try:
                    # Read available data
                    data = os.read(session.fd, 1024).decode('utf-8', errors='ignore')
                    if data:
                        session.output += data
                    else:
                        # No data available, wait a bit
                        await asyncio.sleep(0.01)
                except OSError:
                    # No more data available
                    break

            # Process has ended
            if session.pid:
                try:
                    _, exit_code = os.waitpid(session.pid, 0)
                    session.exit_code = exit_code
                except:
                    session.exit_code = -1

            session.state = TerminalState.FINISHED

        except Exception as e:
            logger.error(f"Error reading output from session {session_id}: {e}")
            session.state = TerminalState.ERROR
        finally:
            # Clean up file descriptor
            if session.fd is not None:
                try:
                    os.close(session.fd)
                except:
                    pass
                session.fd = None

    async def write_input(self, session_id: str, data: str) -> bool:
        """Write input to a terminal session"""
        if session_id not in self.sessions:
            return False

        session = self.sessions[session_id]

        if session.state != TerminalState.RUNNING or session.fd is None:
            return False

        try:
            os.write(session.fd, data.encode('utf-8'))
            return True
        except Exception as e:
            logger.error(f"Error writing to terminal session {session_id}: {e}")
            return False

    async def resize_terminal(self, session_id: str, rows: int, cols: int) -> bool:
        """Resize the terminal"""
        if session_id not in self.sessions:
            return False

        session = self.sessions[session_id]

        if session.fd is None:
            return False

        try:
            # Set window size
            import struct
            import fcntl
            winsize = struct.pack("HHHH", rows, cols, 0, 0)
            fcntl.ioctl(session.fd, termios.TIOCSWINSZ, winsize)
            return True
        except Exception as e:
            logger.error(f"Error resizing terminal {session_id}: {e}")
            return False

    async def terminate_session(self, session_id: str) -> bool:
        """Terminate a terminal session"""
        if session_id not in self.sessions:
            return False

        session = self.sessions[session_id]

        if session.state == TerminalState.RUNNING and session.pid:
            try:
                os.kill(session.pid, signal.SIGTERM)
                # Wait a bit for graceful termination
                await asyncio.sleep(0.5)
                # Force kill if still running
                if session.state == TerminalState.RUNNING:
                    os.kill(session.pid, signal.SIGKILL)
            except:
                pass

        session.state = TerminalState.FINISHED
        return True

    async def get_session(self, session_id: str) -> Optional[TerminalSession]:
        """Get a terminal session by ID"""
        return self.sessions.get(session_id)

    async def get_sessions(self) -> List[TerminalSession]:
        """Get all terminal sessions"""
        return list(self.sessions.values())

    async def remove_session(self, session_id: str) -> bool:
        """Remove a terminal session"""
        if session_id in self.sessions:
            # Terminate if still running
            await self.terminate_session(session_id)
            del self.sessions[session_id]
            return True
        return False

# Global instance
terminal_manager = TerminalManager()