export const AgentLogs = () => {
  const logs = [
    { id: 1, agent: "Research Agent", action: "Researching Acme Corp", status: "completed", time: "2 min ago" },
    { id: 2, agent: "Outreach Agent", action: "Sending email to John Doe", status: "running", time: "5 min ago" },
    { id: 3, agent: "Follow-up Agent", action: "Following up with Jane Smith", status: "pending", time: "10 min ago" },
    { id: 4, agent: "CRM Agent", action: "Updating deal stage", status: "completed", time: "15 min ago" },
  ];

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <table className="w-full text-left">
        <thead>
          <tr>
            <th className="py-3 px-4 text-sm font-medium text-gray-400">Agent</th>
            <th className="py-3 px-4 text-sm font-medium text-gray-400">Action</th>
            <th className="py-3 px-4 text-sm font-medium text-gray-400">Status</th>
            <th className="py-3 px-4 text-sm font-medium text-gray-400">Time</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-t border-gray-700">
              <td className="py-3 px-4 text-gray-100">{log.agent}</td>
              <td className="py-3 px-4 text-gray-100">{log.action}</td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  log.status === "completed" ? "bg-green-600/20 text-green-400" :
                  log.status === "running" ? "bg-yellow-600/20 text-yellow-400" :
                  log.status === "pending" ? "bg-blue-600/20 text-blue-400" :
                  "bg-red-600/20 text-red-400"
                }`}>
                  {log.status}
                </span>
              </td>
              <td className="py-3 px-4 text-gray-100">{log.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
