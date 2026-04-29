import type { IdeaStatus } from "@/types/idea";

type StatusBadgeProps = {
  status: IdeaStatus;
  className?: string;
};

const STATUS_CONFIG: Record<IdeaStatus, { label: string; badgeClass: string }> = {
  under_review: { label: "Under Review", badgeClass: "badge-warning" },
  planned: { label: "Planned", badgeClass: "badge-info" },
  in_progress: { label: "In Progress", badgeClass: "badge-accent" },
  shipped: { label: "Shipped", badgeClass: "badge-success text-success-content" },
  declined: { label: "Declined", badgeClass: "badge-error text-error-content" },
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.under_review;

  return (
    <span className={`badge font-medium ${config.badgeClass} ${className}`}>
      {config.label}
    </span>
  );
}
