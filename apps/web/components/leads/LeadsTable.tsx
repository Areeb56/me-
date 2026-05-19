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
      <div className="glass-card">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full border-4 border-[--primary:rgb(59,130,246)] border-t-transparent w-12 h-12"></div>
          <span className="ml-4 text-[--muted-foreground:rgb(160,160,160)]">Loading leads...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card">
        <div className="flex items-center justify-center py-8 text-[--destructive-foreground:rgb(239,68,68)]">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card">
      {leads.length === 0 ? (
        <div className="text-center py-8 text-[--muted-foreground:rgb(160,160,160)]">
          No leads found. Click &quot;Launch Research&quot; to generate new leads.
        </div>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="py-3 px-4 text-sm font-medium text-[--muted-foreground:rgb(160,160,160)]">Company</th>
              <th className="py-3 px-4 text-sm font-medium text-[--muted-foreground:rgb(160,160,160)]">Industry</th>
              <th className="py-3 px-4 text-sm font-medium text-[--muted-foreground:rgb(160,160,160)]">Score</th>
              <th className="py-3 px-4 text-sm font-medium text-[--muted-foreground:rgb(160,160,160)]">Source</th>
              <th className="py-3 px-4 text-sm font-medium text-[--muted-foreground:rgb(160,160,160)]">Status</th>
              <th className="py-3 px-4 text-sm font-medium text-[--muted-foreground:rgb(160,160,160)]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-t border-[--border:rgb(24,24,27)/0.3]">
                <td className="py-3 px-4 text-[--foreground:rgb(224,224,224)]">{lead.companyName}</td>
                <td className="py-3 px-4 text-[--foreground:rgb(224,224,224)]">{lead.industry || "N/A"}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    lead.score >= 90 ? "bg-[--success:rgb(34,197,94)]/20 text-[--success-foreground:rgb(34,197,94)]" : 
                    lead.score >= 80 ? "bg-[--warning:rgb(251,191,36)]/20 text-[--warning-foreground:rgb(251,191,36)]" : 
                    "bg-[--destructive:rgb(239,68,68)]/20 text-[--destructive-foreground:rgb(239,68,68)]"
                  }`}>
                    {lead.score}%
                  </span>
                </td>
                <td className="py-3 px-4 text-[--foreground:rgb(224,224,224)]">{lead.source || "N/A"}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    lead.status === "qualified" ? "bg-[--success:rgb(34,197,94)]/20 text-[--success-foreground:rgb(34,197,94)]" : 
                    lead.status === "researching" ? "bg-[--warning:rgb(251,191,36)]/20 text-[--warning-foreground:rgb(251,191,36)]" : 
                    lead.status === "new" ? "bg-[--info:rgb(59,130,246)]/20 text-[--info-foreground:rgb(59,130,246)]" : 
                    lead.status === "disqualified" ? "bg-[--destructive:rgb(239,68,68)]/20 text-[--destructive-foreground:rgb(239,68,68)]" : 
                    "bg-[--muted:rgb(24,24,27)]/20 text-[--muted-foreground:rgb(160,160,160)]"
                  }`}>
                    {lead.status}
                  </span>
                </td>
                <td className="py-3 px-4 space-x-2">
                  <button 
                    className="px-3 py-1 text-sm bg-[--primary:rgb(59,130,246)] hover:bg-[--primary-hover:rgb(29,78,216)] text-white rounded"
                    onClick={() => viewLead(lead.id)}
                  >
                    View
                  </button>
                  <button 
                    className="px-3 py-1 text-sm bg-[--success:rgb(34,197,94)] hover:bg-[--success-hover:rgb(34,197,94)] text-white rounded"
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
}