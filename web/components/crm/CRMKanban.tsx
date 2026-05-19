export const CRMKanban = () => {
  const columns = [
    { id: "prospect", title: "Prospect", count: 12, color: "bg-blue-500" },
    { id: "contacted", title: "Contacted", count: 8, color: "bg-yellow-500" },
    { id: "replied", title: "Replied", count: 5, color: "bg-green-500" },
    { id: "meeting_booked", title: "Meeting Booked", count: 3, color: "bg-purple-500" },
    { id: "won", title: "Won", count: 12, color: "bg-emerald-500" },
    { id: "lost", title: "Lost", count: 7, color: "bg-red-500" },
  ];

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {columns.map((column) => (
          <div
            key={column.id}
            className={`p-4 rounded-lg ${column.color}/20 border border-${column.color}/50`}
          >
            <h3 className="font-semibold mb-3 flex items-center justify-between">
              <span>{column.title}</span>
              <span className="text-sm text-gray-400">{column.count}</span>
            </h3>
            <div className="space-y-2">
              {/* Sample cards */}
              <div className="p-3 bg-gray-700 rounded-lg">
                <h4 className="font-medium">Acme Corp</h4>
                <p className="text-sm text-gray-400">John Doe</p>
                <p className="text-sm text-gray-400 mt-1">$15,000</p>
              </div>
              <div className="p-3 bg-gray-700 rounded-lg">
                <h4 className="font-medium">Beta Inc</h4>
                <p className="text-sm text-gray-400">Jane Smith</p>
                <p className="text-sm text-gray-400 mt-1">$8,500</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
