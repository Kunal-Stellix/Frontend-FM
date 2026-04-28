import { cn } from "@/lib/utils";

type BaseProps = {
  children: React.ReactNode;
  className?: string;
};

export function Card({ children, className }: BaseProps) {
  return <div className={cn("card bg-base-100", className)}>{children}</div>;
}

export function CardBody({ children, className }: BaseProps) {
  return <div className={cn("card-body", className)}>{children}</div>;
}

export function CardTitle({ children, className }: BaseProps) {
  return <h2 className={cn("card-title", className)}>{children}</h2>;
}
