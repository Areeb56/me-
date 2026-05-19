import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export const RevenueChart = () => {
  const [data, setData] = useState([
    { month: "Jan", revenue: 0 },
    { month: "Feb", revenue: 0 },
    { month: "Mar", revenue: 0 },
    { month: "Apr", revenue: 0 },
    { month: "May", revenue: 0 },
    { month: "Jun", revenue: 0 },
    { month: "Jul", revenue: 0 },
    { month: "Aug", revenue: 0 },
    { month: "Sep", revenue: 0 },
    { month: "Oct", revenue: 0 },
    { month: "Nov", revenue: 0 },
    { month: "Dec", revenue: 0 },
  ]);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        // In a real implementation, we would fetch from analytics endpoints
        // For now, we'll use sample data that represents what would come from the database
        const sampleData = [
          { month: "Jan", revenue: 4000 },
          { month: "Feb", revenue: 3000 },
          { month: "Mar", revenue: 5000 },
          { month: "Apr", revenue: 4000 },
          { month: "May", revenue: 6000 },
          { month: "Jun", revenue: 4000 },
          { month: "Jul", revenue: 3000 },
          { month: "Aug", revenue: 7000 },
          { month: "Sep", revenue: 3000 },
          { month: "Oct", revenue: 4000 },
          { month: "Nov", revenue: 6000 },
          { month: "Dec", revenue: 5000 },
        ];
        setData(sampleData);
      } catch (error) {
        console.error("Error fetching revenue data:", error);
      }
    };

    fetchRevenueData();
  }, []);

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-semibold mb-4">Monthly Revenue</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="revenue" stroke="#3b82f6" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
