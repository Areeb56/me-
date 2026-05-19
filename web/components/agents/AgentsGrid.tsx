export const AgentsGrid = () => {
  const agents = [
    { name: "CEO Agent", status: "active", tasks: 3, model: "llama3:70b" },
    { name: "COO Agent", status: "active", tasks: 2, model: "llama3:70b" },
    { name: "Research Agent", status: "running", tasks: 5, model: "llama3:70b" },
    { name: "Outreach Agent", status: "idle", tasks: 0, model: "mistral:7b" },
    { name: "Follow-up Agent", status: "idle", tasks: 0, model: "mistral:7b" },
    { name: "CRM Agent", status: "active", tasks: 1, model: "mistral:7b" },
    { name: "Browser Agent", status: "idle", tasks: 0, model: "llama3:70b" },
    { name: "Reflection Agent", status: "idle", tasks: 0, model: "llama3:70b" },
  ];

  return (
    <div className="grid gap-4">
      {agents.map((agent) => (
        <div
          key={agent.name}
          className="bg-gray-800 rounded-xl p-4 border border-gray-700"
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold">{agent.name}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-middle ${
              agent.status === "active" ? "bg-green-600/20 text-green-400" :
              agent.status === "running" ? "bg-yellow-600/20 text-yellow-400" :
              agent.status === "idle" ? "bg-blue-600/20 text-blue-400" :
              "bg-gray-600/20 text-gray-400"
            }`}>
              {agent.status}
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-400">
            <span>Tasks: {agent.tasks}</span>
            <span>Model: {agent.model}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
