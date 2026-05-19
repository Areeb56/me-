import { useEffect, useState } from "react";

export const LeadsTable = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/leads");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setLeads(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching leads:", err);
        setError("Failed to fetch leads");
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full border-4 border-indigo-600 border-t-transparent w-12 h-12"></div>
          <span className="ml-4 text-gray-400">Loading leads...</span>
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
      {leads.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          No leads found. Click "Launch Research" to generate new leads.
        </div>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="py-3 px-4 text-sm font-medium text-gray-400">Company</th>
              <th className="py-3 px-4 text-sm font-medium text-gray-400">Industry</th>
              <th className="py-3 px-4 text-sm font-medium text-gray-400">Score</th>
              <th className="py-3 px-4 text-sm font-medium text-gray-400">Source</th>
              <th className="py-3 px-4 text-sm font-medium text-gray-400">Status</th>
              <th className="py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-t border-gray-700">
                <td className="py-3 px-4 text-gray-100">{lead.companyName}</td>
                <td className="py-3 px-4 text-gray-100">{lead.industry || "N/A"}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    lead.score >= 90 ? "bg-green-600/20 text-green-400" :
                    lead.score >= 80 ? "bg-yellow-600/20 text-yellow-400" :
                    "bg-red-600/20 text-red-400"
                  }`}>
                    {lead.score}%
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-100">{lead.source || "N/A"}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    lead.status === "qualified" ? "bg-green-600/20 text-green-400" :
                    lead.status === "researching" ? "bg-yellow-600/20 text-yellow-400" :
                    lead.status === "new" ? "bg-blue-600/20 text-blue-400" :
                    lead.status === "disqualified" ? "bg-red-600/20 text-red-400" :
                    "bg-gray-600/20 text-gray-400"
                  }`}>
                    {lead.status}
                  </span>
                </td>
                <td className="py-3 px-4 space-x-2">
                  <button 
                    className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
                    onClick={() => viewLead(lead.id)}
                  >
                    View
                  </button>
                  <button 
                    className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded"
                    onClick={() => contactLead(lead.id)}
                  >
                    Contact
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const viewLead = (id: string) => {
  // TODO: Implement lead view functionality
  alert(`Viewing lead ${id}`);
};

const contactLead = (id: string) => {
  // TODO: Implement contact lead functionality
  alert(`Contacting lead ${id}`);
};
