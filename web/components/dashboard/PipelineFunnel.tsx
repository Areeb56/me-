import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export const PipelineFunnel = () => {
  const [data, setData] = useState([
    { stage: "Prospect", value: 0 },
    { stage: "Contacted", value: 0 },
    { stage: "Replied", value: 0 },
    { stage: "Meeting Booked", value: 0 },
    { stage: "Won", value: 0 },
    { stage: "Lost", value: 0 },
  ]);

  useEffect(() => {
    const fetchPipelineData = async () => {
      try {
        // In a real implementation, we would fetch from analytics endpoints
        // For now, we'll use sample data that represents what would come from the database
        const sampleData = [
          { stage: "Prospect", value: 45 },
          { stage: "Contacted", value: 32 },
          { stage: "Replied", value: 24 },
          { stage: "Meeting Booked", value: 18 },
          { stage: "Won", value: 12 },
          { stage: "Lost", value: 15 },
        ];
        setData(sampleData);
      } catch (error) {
        console.error("Error fetching pipeline data:", error);
      }
    };

    fetchPipelineData();
  }, []);

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-semibold mb-4">Sales Pipeline</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="stage" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#8b5cf6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
