import { cn } from "@/lib/utils";

type FeedbackStatus =
  | "new"
  | "under-review"
  | "planned"
  | "in-progress"
  | "completed"
  | "closed";

type FeedbackStatusBadgeProps = {
  status: FeedbackStatus;
  className?: string;
};

const statusLabels: Record<FeedbackStatus, string> = {
  new: "New",
  "under-review": "Under review",
  planned: "Planned",
  "in-progress": "In progress",
  completed: "Completed",
  closed: "Closed",
};

const statusClasses: Record<FeedbackStatus, string> = {
  new: "badge-info",
  "under-review": "badge-warning",
  planned: "badge-primary",
  "in-progress": "badge-secondary",
  completed: "badge-success",
  closed: "badge-ghost",
};

export function FeedbackStatusBadge({ status, className }: FeedbackStatusBadgeProps) {
  return (
    <span className={cn("badge badge-soft gap-1.5 px-3 py-3 font-medium", statusClasses[status], className)}>
      {statusLabels[status]}
    </span>
  );
}

export type { FeedbackStatus };
