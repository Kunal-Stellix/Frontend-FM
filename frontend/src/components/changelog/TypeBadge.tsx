import type { ChangelogEntryType } from "@/types/admin";

type TypeBadgeProps = {
  type: ChangelogEntryType;
  className?: string;
};

const TYPE_CONFIG: Record<ChangelogEntryType, { label: string; badgeClass: string }> = {
  new_feature: { label: "New Feature", badgeClass: "badge-success text-success-content" },
  improvement: { label: "Improvement", badgeClass: "badge-info text-info-content" },
  bug_fix: { label: "Bug Fix", badgeClass: "badge-warning text-warning-content" },
};

export function TypeBadge({ type, className = "" }: TypeBadgeProps) {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.improvement;

  return (
    <span className={`badge font-medium ${config.badgeClass} ${className}`}>
      {config.label}
    </span>
  );
}
