import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon, Menu, LayoutDashboard, BarChart2, Users, Mail, Settings, Zap, Activity } from "lucide-react";

export const Sidebar = () => {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/(dashboard)", icon: LayoutDashboard, current: pathname === "/" || pathname.startsWith("/(dashboard)") },
    { name: "Analytics", href: "/(dashboard)/analytics", icon: BarChart2, current: pathname.startsWith("/(dashboard)/analytics") },
    { name: "Leads", href: "/(dashboard)/leads", icon: Users, current: pathname.startsWith("/(dashboard)/leads") },
    { name: "CRM", href: "/(dashboard)/crm", icon: Users, current: pathname.startsWith("/(dashboard)/crm") }, // We'll use Users for now, can change to a more appropriate icon
    { name: "Outreach", href: "/(dashboard)/outreach", icon: Mail, current: pathname.startsWith("/(dashboard)/outreach") },
    { name: "Agents", href: "/(dashboard)/agents", icon: Zap, current: pathname.startsWith("/(dashboard)/agents") },
    { name: "Memory", href: "/(dashboard)/memory", icon: Activity, current: pathname.startsWith("/(dashboard)/memory") },
    { name: "Workflows", href: "/(dashboard)/workflows", icon: Activity, current: pathname.startsWith("/(dashboard)/workflows") },
    { name: "Settings", href: "/(dashboard)/settings", icon: Settings, current: pathname.startsWith("/(dashboard)/settings") },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#09090b]/80 backdrop-blur-md border-r border-[#18181b]/40 text-[#e0e0e0] p-4">
      <div className="flex items-center space-x-3 mb-6">
        <div className="h-8 w-8 flex items-center justify-center bg-[#18181b]/60 rounded-lg">
          <Menu className="h-5 w-5" />
        </div>
        <span className="font-bold text-xl text-white">AIOS</span>
      </div>
      <nav className="mt-6 space-y-2">
        {navItems.map((item) => (
          <Link key={item.name} href={item.href} className={`flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium ${
            item.current
              ? "bg-[#18181b]/60 text-white"
              : "hover:bg-[#18181b]/40 hover:text-white"
          }`}>
            <item.icon className="h-4 w-4" />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};