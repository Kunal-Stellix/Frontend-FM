import type { SortOption } from "@/types/idea";

type SortControlsProps = {
  value: SortOption;
  onChange: (sort: SortOption) => void;
};

const sortOptions: Array<{ value: SortOption; label: string }> = [
  { value: "most_votes", label: "Top" },
  { value: "newest", label: "New" },
  { value: "recently_updated", label: "Active" },
  { value: "most_commented", label: "Hot" },
];

export function SortControls({ value, onChange }: SortControlsProps) {
  return (
    <div role="tablist" className="tabs tabs-bordered tabs-sm">
      {sortOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          onClick={() => onChange(option.value)}
          className={`tab font-medium ${
            option.value === value ? "tab-active" : ""
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
