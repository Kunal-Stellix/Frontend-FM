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
    <ul className="menu rounded-box gap-2 p-0">
      <li>
        <button
          type="button"
          onClick={() => onChange([])}
          className={`min-h-12 rounded-xl px-4 text-sm ${selected.length === 0 ? "active font-semibold" : "font-medium"}`}
        >
          <span className="flex-1">All statuses</span>
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
              className={`min-h-12 rounded-xl px-4 text-sm ${isActive ? "active font-semibold" : "font-medium"}`}
            >
              <span className={`h-3 w-3 shrink-0 rounded-full ${status.dotClass}`} />
              <span className="flex-1">{status.label}</span>
              {typeof count === "number" ? (
                <span className="badge badge-md badge-ghost tabular-nums">
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
