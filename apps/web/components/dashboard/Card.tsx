import { classNames } from "@/lib/utils";

interface CardProps {
  className?: string;
  title: string;
  value: string | number;
  change?: string;
  icon: React.ComponentType<{
    className?: string;
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
  }>;
}

export default function Card({
  className = "",
  title,
  value,
  change,
  icon: Icon
}: CardProps) {
  const isPositive = change?.startsWith("+") || change?.startsWith("-") === false;

  return (
    <div className={classNames("flex flex-col items-start gap-3 p-6", className)}>
      <div className="flex items-center gap-3 w-full">
        <h3 className="text-sm font-medium text-muted-foreground">
          {title}
        </h3>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>

      <p className="text-2xl font-bold w-full">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>

      {change && (
        <p className={classNames(
          "text-xs font-medium",
          isPositive ? "text-success" : "text-destructive"
        )}>
          {change}
        </p>
      )}
    </div>
  );
}