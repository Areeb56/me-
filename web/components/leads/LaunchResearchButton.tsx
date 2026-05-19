import { useState } from "react";

export const LaunchResearchButton = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      // In a real implementation, we would get the selected lead ID from state or context
      // For now, we'll use a placeholder ID
      const leadId = "1"; // This would come from selected lead state
      
      const response = await fetch(`/api/leads/${leadId}/research`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setMessage(`Research queued: ${result.message}`);
    } catch (error) {
      console.error("Error launching research:", error);
      setMessage("Failed to launch research");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-3">
      <button
        onClick={handleClick}
        disabled={loading}
        className={`px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2 ${loading ? "opacity-70" : ""}`}
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full border-2 border-white w-4 h-4"></div>
            <span>Researching...</span>
          </>
        ) : (
          <>
            <span>Launch Research</span>
          </>
        )}
      </button>
      {message && (
        <span className={`text-sm ${message.includes("Failed") ? "text-red-400" : "text-green-400"}`}>
          {message}
        </span>
      )}
    </div>
  );
};
