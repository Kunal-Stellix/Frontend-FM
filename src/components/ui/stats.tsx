import { cn } from "@/lib/utils";

type BaseProps = {
  children: React.ReactNode;
  className?: string;
};

type StatItemProps = {
  title: React.ReactNode;
  value: React.ReactNode;
  description?: React.ReactNode;
  valueClassName?: string;
};

export function Stats({ children, className }: BaseProps) {
  return <div className={cn("stats stats-vertical w-full bg-base-100 shadow sm:stats-horizontal", className)}>{children}</div>;
}

export function StatItem({ title, value, description, valueClassName }: StatItemProps) {
  return (
    <div className="stat">
      <div className="stat-title">{title}</div>
      <div className={cn("stat-value", valueClassName)}>{value}</div>
      {description ? <div className="stat-desc">{description}</div> : null}
    </div>
  );
}
