import type { IdeaStatus } from "@/types/idea";

type StatusFilterProps = {
  selected: IdeaStatus[];
  onChange: (statuses: IdeaStatus[]) => void;
  counts?: Partial<Record<IdeaStatus, number>>;
};

const statusConfig: Array<{
  value: IdeaStatus;
  label: string;
  dotClass: string;
}> = [
  { value: "under_review", label: "Under Review", dotClass: "bg-warning" },
  { value: "planned",      label: "Planned",      dotClass: "bg-info" },
  { value: "in_progress",  label: "In Progress",  dotClass: "bg-accent" },
  { value: "shipped",      label: "Shipped",      dotClass: "bg-success" },
  { value: "declined",     label: "Declined",     dotClass: "bg-error" },
];

export function StatusFilter({ selected, onChange, counts }: StatusFilterProps) {
  return (
    <ul className="flex flex-col gap-1">
      <li>
        <button
          type="button"
          onClick={() => onChange([])}
          className={`group flex w-full items-center min-h-10 rounded-lg px-2 text-sm transition-colors hover:bg-base-200/60 ${
            selected.length === 0
              ? "bg-base-200/40 font-bold text-base-content"
              : "font-medium text-base-content/70"
          }`}
        >
          <span className="flex-1 text-left">All Statuses</span>
        </button>
      </li>

      {statusConfig.map((status) => {
        const isActive = selected.includes(status.value);
        const count = counts?.[status.value];

        return (
          <li key={status.value}>
            <button
              type="button"
              onClick={() =>
                onChange(
                  isActive
                    ? selected.filter((v) => v !== status.value)
                    : [...selected, status.value],
                )
              }
              className={`group flex w-full items-center gap-3 min-h-10 rounded-lg px-2 text-sm transition-colors hover:bg-base-200/60 ${
                isActive
                  ? "bg-base-200/40 font-bold text-base-content"
                  : "font-medium text-base-content/70"
              }`}
            >
              <span className={`h-3.5 w-3.5 shrink-0 rounded-full border-[2px] ${status.dotClass.replace('bg-', 'border-')} ${isActive ? status.dotClass : 'bg-transparent'} transition-colors`} />
              <span className="flex-1 text-left">{status.label}</span>
              {typeof count === "number" ? (
                <span className={`text-xs font-semibold tabular-nums ${isActive ? "text-base-content/60" : "text-base-content/40 group-hover:text-base-content/60"}`}>
                  {count}
                </span>
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
