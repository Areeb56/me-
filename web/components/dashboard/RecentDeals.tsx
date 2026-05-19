import { useEffect, useState } from "react";

export const RecentDeals = () => {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentDeals = async () => {
      try {
        setLoading(true);
        // In a real implementation, we would fetch from the API
        // For now, we'll use mock data that simulates what would come from the database
        const mockDeals = [
          { id: 1, company: "Acme Corp", amount: 15000, date: "2024-01-15", status: "won" },
          { id: 2, company: "Beta Inc", amount: 8500, date: "2024-01-14", status: "won" },
          { id: 3, company: "Gamma LLC", amount: 12000, date: "2024-01-13", status: "won" },
          { id: 4, company: "Delta Corp", amount: 7500, date: "2024-01-12", status: "lost" },
          { id: 5, company: "Epsilon Inc", amount: 9500, date: "2024-01-11", status: "won" },
        ];
        setDeals(mockDeals);
        setError(null);
      } catch (err) {
        console.error("Error fetching recent deals:", err);
        setError("Failed to fetch recent deals");
      } finally {
        setLoading(false);
      }
    };

    fetchRecentDeals();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full border-4 border-indigo-600 border-t-transparent w-12 h-12"></div>
          <span className="ml-4 text-gray-400">Loading recent deals...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-center py-8 text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-semibold mb-4">Recent Won Deals</h3>
      <div className="space-y-3">
        {deals
          .filter((deal) => deal.status === "won")
          .map((deal) => (
            <div key={deal.id} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
              <div>
                <h4 className="font-medium">{deal.company}</h4>
                <p className="text-sm text-gray-400">{deal.date}</p>
              </div>
              <p className="font-bold text-green-400">${deal.amount.toLocaleString()}</p>
            </div>
          ))}
      </div>
    </div>
  );
};
