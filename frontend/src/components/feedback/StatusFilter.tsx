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
    <ul className="menu menu-sm rounded-box p-0 gap-0.5">
      {/* "All" item */}
      <li>
        <button
          type="button"
          onClick={() => onChange([])}
          className={selected.length === 0 ? "active font-semibold" : ""}
        >
          <span className="flex-1">All statuses</span>
        </button>
      </li>

      {/* Individual statuses */}
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
              className={isActive ? "active font-semibold" : ""}
            >
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${status.dotClass}`} />
              <span className="flex-1">{status.label}</span>
              {typeof count === "number" ? (
                <span className="badge badge-sm badge-ghost tabular-nums">
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
