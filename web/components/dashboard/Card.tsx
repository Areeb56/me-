import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface CardProps {
  title: string;
  value: string;
  change?: string;
  icon: React.ComponentType<{ className?: string }> | string;
}

export const Card = ({ title, value, change, icon }: CardProps) => {
  const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        {typeof icon === "string" ? (
          <div className="text-sm text-gray-400">{icon}</div>
        ) : (
          <icon className="h-5 w-5 text-gray-400" />
        )}
      </div>
      <p className="text-2xl font-bold text-gray-100">{value}</p>
      {change && (
        <p className={cn("text-sm", change.startsWith("-") ? "text-red-400" : "text-green-400")}>
          {change}
        </p>
      )}
    </div>
  );
};
