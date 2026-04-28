import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
};

export function Badge({ children, className }: BadgeProps) {
  return <div className={cn("badge badge-primary badge-outline badge-lg", className)}>{children}</div>;
}
