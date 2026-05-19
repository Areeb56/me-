import React from "react";
import { useContext, useEffect, useState } from "react";
import { useSocket } from "../../lib/socket";

export function AgentsDashboard() {
  const socket = useSocket();
  const [agents, setAgents] = useState([
    { id: 1, name: "TerminalAI", status: "idle", type: "terminal", description: "Executes terminal commands" },
    { id: 2, name: "ResearchAI", status: "idle", type: "research", description: "Researches and summarizes information" },
    { id: 3, name: "CodingAI", status: "idle", type: "coder", description: "Writes and edits code" },
    { id: 4, name: "BrowserAI", status: "idle", type: "browser", description: "Controls web browser" },
    { id: 5, name: "DeploymentAI", status: "idle", type: "deploy", description: "Handles deployment processes" },
    { id: 6, name: "GitHubAI", status: "idle", type: "github", description: "Manages GitHub operations" },
    { id: 7, name: "EmailAI", status: "idle", type: "email", description: "Sends and manages emails" },
    { id: 8, name: "MemoryAI", status: "idle", type: "memory", description: "Manages memory and context" }
  ]);

  useEffect(() => {
    if (socket) {
      socket.on("agentStatusUpdate", (data: { agentId: number; status: string }) => {
        setAgents(prev =>
          prev.map(agent =>
            agent.id === data.agentId ? { ...agent, status: data.status } : agent
          )
        );
      });
    }

    return () => {
      if (socket) {
        socket.off("agentStatusUpdate");
      }
    };
  }, [socket]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Agent Activity</h1>
        <p className="text-muted-foreground">Monitor and control your AI agents</p>
      </div>

      <div className="grid gap-6">
        <div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card">
            <h3 className="font-semibold mb-4">Active Agents</h3>
            <p className="text-3xl font-bold">{agents.filter(a => a.status === "running").length}</p>
            <p className="text-sm text-muted-foreground">{agents.filter(a => a.status === "running").length} running, {agents.filter(a => a.status === "idle").length} idle</p>
          </div>

          <div className="glass-card">
            <h3 className="font-semibold mb-4">Tasks Completed</h3>
            <p className="text-3xl font-bold">1,245</p>
            <p className="text-sm text-muted-foreground">+156 today</p>
          </div>

          <div className="glass-card">
            <h3 className="font-semibold mb-4">Success Rate</h3>
            <p className="text-3xl font-bold">94%</p>
            <p className="text-sm text-muted-foreground">+2.1% from yesterday</p>
          </div>

          <div className="glass-card">
            <h3 className="font-semibold mb-4">Avg. Response Time</h3>
            <p className="text-3xl font-bold">1.2s</p>
            <p className="text-sm text-muted-foreground">-0.3s from yesterday</p>
          </div>
        </div>

        <div className="grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass-card">
            <h3 className="font-semibold mb-4">Agent Status Overview</h3>
            <div className="h-96">
              {/* Status chart would go here */}
              <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">Agent Status Chart</p>
              </div>
            </div>
          </div>

          <div className="glass-card">
            <h3 className="font-semibold mb-4">Task Distribution</h3>
            <div className="h-96">
              {/* Task distribution chart would go here */}
              <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">Task Distribution Chart</p>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Agent Stream */}
        <div className="glass-card">
          <h3 className="font-semibold mb-4">Real-time Agent Stream</h3>
          <div className="h-96 space-y-4">
            {agents.map(agent => (
              <div key={agent.id} className="flex items-start space-x-3 text-sm">
                <div className="h-8 w-8 flex items-center justify-center bg-[#18181b]/60 rounded-lg">
                  {agent.type === "terminal" && <span>&#128279;</span>}
                  {agent.type === "research" && <span>&#128279;</span>}
                  {agent.type === "coder" && <span>&#9998;</span>}
                  {agent.type === "browser" && <span>&#128279;</span>}
                  {agent.type === "deploy" && <span>&#128279;</span>}
                  {agent.type === "github" && <span>&#128279;</span>}
                  {agent.type === "email" && <span>&#128231;</span>}
                  {agent.type === "memory" && <span>&#128196;</span>}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{agent.name}: {agent.status === "running" ? "Executing task" : agent.status === "idle" ? "Waiting for task" : agent.status === "completed" ? "Task completed" : agent.status === "error" ? "Error occurred" : "Unknown status"}</p>
                  <p className="text-xs text-muted-foreground">Just now</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}