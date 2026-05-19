import { useEffect, useState } from "react";

export const AgentStream = () => {
  const [activities, setActivities] = useState<Array<{
    id: number;
    agent: string;
    action: string;
    time: string;
  }>>([
    { id: 1, agent: "TerminalAI", action: "Executing command 'npm install'", time: "2 seconds ago" },
    { id: 2, agent: "ResearchAI", action: "Researching lead 'Acme Corp'", time: "5 seconds ago" },
    { id: 3, agent: "CodingAI", action: "Fixed bug in authentication flow", time: "8 seconds ago" },
    { id: 4, agent: "EmailAI", action: "Sent follow-up to lead 'TechStart'", time: "10 seconds ago" },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate new activity
      const newActivity = {
        id: Date.now(),
        agent: ["TerminalAI", "ResearchAI", "CodingAI", "EmailAI", "MemoryAI"][Math.floor(Math.random() * 5)],
        action: [
          "Executing command",
          "Researching lead",
          "Fixed bug",
          "Sent email",
          "Updated memory",
        ][Math.floor(Math.random() * 5)],
        time: "just now",
      };
      setActivities(prev => [newActivity, ...prev.slice(0, 4)]); // Keep only last 5
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-3">
      {activities.map(activity => (
        <div key={activity.id} className="flex items-start space-x-3 text-sm">
          <div className="h-8 w-8 flex items-center justify-center bg-[#18181b]/60 rounded-lg">
            {activity.agent === "TerminalAI" && <span>&#128279;</span>}
            {activity.agent === "ResearchAI" && <span>&#128279;</span>}
            {activity.agent === "CodingAI" && <span>&#9998;</span>}
            {activity.agent === "EmailAI" && <span>&#128231;</span>}
            {activity.agent === "MemoryAI" && <span>&#128196;</span>}
          </div>
          <div className="flex-1">
            <p className="font-medium">{activity.agent}: {activity.action}</p>
            <p className="text-xs text-muted-foreground">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
};