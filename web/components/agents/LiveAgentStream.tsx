import { useEffect, useState } from "react";
import { initSocket, getSocket } from "@/lib/socket";

export const LiveAgentStream = () => {
  const [steps, setSteps] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const socket = initSocket();
    setLoading(true);

    // Join the agent-runs room
    socket.emit("join-room", "agent-runs");

    // Listen for agent step events
    socket.on("agent:step", (data: any) => {
      setSteps(prev => [
        {
          id: `${data.runId}-${Date.now()}`,
          agentType: data.agentType,
          step: data.step,
          output: data.output,
          timestamp: data.timestamp
        },
        ...prev
      ].slice(0, 50)); // Keep only the last 50 steps
    });

    // Listen for agent completion events
    socket.on("agent:done", (data: any) => {
      setSteps(prev => [
        {
          id: `${data.runId}-done-${Date.now()}`,
          agentType: data.agentType,
          step: "completed",
          output: `Result: ${data.result} (Tokens: ${data.tokensUsed})`,
          timestamp: new Date().toISOString()
        },
        ...prev
      ].slice(0, 50));
    });

    // Cleanup on unmount
    return () => {
      socket.emit("leave-room", "agent-runs");
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full border-4 border-indigo-600 border-t-transparent w-12 h-12"></div>
          <span className="ml-4 text-gray-400">Connecting to agent stream...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Live Agent Stream</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-sm text-green-400">Connected</span>
        </div>
      </div>
      <div className="h-96 overflow-y-auto space-y-2 bg-gray-900/50 rounded-lg p-4">
        {steps.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No agent activity yet. Start a workflow to see live updates.
          </div>
        ) : (
          <div>
            {steps.map((step, index) => (
              <div key={step.id} className={`border-t py-2 ${index % 2 === 0 ? "bg-gray-800" : "bg-gray-700"}`}>
                <div className="flex justify-between">
                  <span className="font-medium">{step.agentType}</span>
                  <span className="text-sm text-gray-500">{new Date(step.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="font-semibold">{step.step}</div>
                <p className="text-sm">{step.output}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
