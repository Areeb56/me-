import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

export default function PipelineFunnel() {
  // Sample data - in a real app, this would come from an API
  const data = [
    { stage: "Prospect", value: 120 },
    { stage: "Contacted", value: 80 },
    { stage: "Replied", value: 60 },
    { stage: "Meeting Booked", value: 40 },
    { stage: "Won", value: 25 },
    { stage: "Lost", value: 15 },
  ];

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="stage" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}