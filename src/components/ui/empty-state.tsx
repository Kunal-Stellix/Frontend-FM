import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-[2rem] border border-dashed border-base-300 bg-base-200/40 px-8 py-10 text-center",
        className,
      )}
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {icon ?? <Inbox className="h-7 w-7" />}
      </div>
      <h3 className="mt-5 text-xl font-semibold text-base-content">{title}</h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-base-content/70">{description}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
