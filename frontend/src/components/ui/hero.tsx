import { cn } from "@/lib/utils";

type BaseProps = {
  children: React.ReactNode;
  className?: string;
};

export function Hero({ children, className }: BaseProps) {
  return <div className={cn("hero min-h-screen", className)}>{children}</div>;
}

export function HeroContent({ children, className }: BaseProps) {
  return <div className={cn("hero-content w-full max-w-6xl", className)}>{children}</div>;
}
