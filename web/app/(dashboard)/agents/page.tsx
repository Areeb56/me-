import { AgentsGrid } from "@/components/agents/AgentsGrid";
import { AgentLogs } from "@/components/agents/AgentLogs";
import { LiveAgentStream } from "@/components/agents/LiveAgentStream";

export default function AgentsPage() {
  return (
    <div className="grid gap-6">
      <div className="md:grid-cols-2">
        <div>
          <h2 className="text-xl font-bold mb-4">AI Agents Status</h2>
          <AgentsGrid />
        </div>
        <div>
          <h2 className="text-xl font-bold mb-4">Agent Logs</h2>
          <AgentLogs />
        </div>
      </div>
      <div className="md:col-span-2">
        <h2 className="text-xl font-bold mb-4">Live Agent Stream</h2>
        <LiveAgentStream />
      </div>
    </div>
  );
}
