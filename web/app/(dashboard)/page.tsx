import { useEffect, useState } from "react";
import { Card } from "@/components/dashboard/Card";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { RecentDeals } from "@/components/dashboard/RecentDeals";
import { PipelineFunnel } from "@/components/dashboard/PipelineFunnel";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalRevenue: "$0",
    revenueChange: "0%",
    pipelineValue: "$0",
    pipelineChange: "0%",
    activeDeals: 0,
    dealsChange: 0,
    winRate: "0%",
    winRateChange: "0%"
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // In a real implementation, we would fetch from analytics endpoints
        // For now, we'll simulate with some basic data
        setStats({
          totalRevenue: "$124,500",
          revenueChange: "+12.5%",
          pipelineValue: "$89,200",
          pipelineChange: "+8.3%",
          activeDeals: 24,
          dealsChange: 5,
          winRate: "68%",
          winRateChange: "+3.2%"
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card 
          title="Total Revenue" 
          value={stats.totalRevenue} 
          change={stats.revenueChange} 
          icon="TrendingUp"
        />
        <Card 
          title="Pipeline Value" 
          value={stats.pipelineValue} 
          change={stats.pipelineChange} 
          icon="DollarSign"
        />
        <Card 
          title="Active Deals" 
          value={stats.activeDeals.toString()} 
          change={String(stats.dealsChange)} 
          icon="Users"
        />
        <Card 
          title="Win Rate" 
          value={stats.winRate} 
          change={stats.winRateChange} 
          icon="CheckCircle"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RevenueChart />
        <PipelineFunnel />
      </div>
      
      <RecentDeals />
    </div>
  );
}
