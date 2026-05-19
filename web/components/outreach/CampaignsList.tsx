export const CampaignsList = () => {
  const campaigns = [
    { id: 1, name: "Q1 Tech Outreach", status: "active", sent: 124, opened: 45, replied: 12, meetings: 3 },
    { id: 2, name: "Finance Partnership", status: "paused", sent: 89, opened: 32, replied: 8, meetings: 2 },
    { id: 3, name: "Healthcare Solutions", status: "draft", sent: 0, opened: 0, replied: 0, meetings: 0 },
  ];

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <table className="w-full text-left">
        <thead>
          <tr>
            <th className="py-3 px-4 text-sm font-medium text-gray-400">Campaign</th>
            <th className="py-3 px-4 text-sm font-medium text-gray-400">Status</th>
            <th className="py-3 px-4 text-sm font-medium text-gray-400">Sent</th>
            <th className="py-3 px-4 text-sm font-medium text-gray-400">Opened</th>
            <th className="py-3 px-4 text-sm font-medium text-gray-400">Replied</th>
            <th className="py-3 px-4 text-sm font-medium text-gray-400">Meetings</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign) => (
            <tr key={campaign.id} className="border-t border-gray-700">
              <td className="py-3 px-4 text-gray-100">{campaign.name}</td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  campaign.status === "active" ? "bg-green-600/20 text-green-400" :
                  campaign.status === "paused" ? "bg-yellow-600/20 text-yellow-400" :
                  "bg-gray-600/20 text-gray-400"
                }`}>
                  {campaign.status}
                </span>
              </td>
              <td className="py-3 px-4 text-gray-100">{campaign.sent}</td>
              <td className="py-3 px-4 text-gray-100">{campaign.opened}</td>
              <td className="py-3 px-4 text-gray-100">{campaign.replied}</td>
              <td className="py-3 px-4 text-gray-100">{campaign.meetings}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
