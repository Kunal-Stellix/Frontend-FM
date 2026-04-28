import { cn } from "@/lib/utils";

type AlertProps = {
  children: React.ReactNode;
  className?: string;
  tone?: "info" | "success" | "warning" | "error";
};

export function Alert({ children, className, tone = "info" }: AlertProps) {
  return <div className={cn("alert", `alert-${tone}`, className)}>{children}</div>;
}
