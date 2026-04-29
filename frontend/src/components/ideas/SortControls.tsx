import type { SortOption } from "@/types/idea";

type SortControlsProps = {
  value: SortOption;
  onChange: (sort: SortOption) => void;
};

const sortOptions: Array<{ value: SortOption; label: string }> = [
  { value: "most_votes", label: "Most Votes" },
  { value: "newest", label: "Newest" },
  { value: "recently_updated", label: "Recently Updated" },
  { value: "most_commented", label: "Most Commented" },
];

export function SortControls({ value, onChange }: SortControlsProps) {
  const activeOption =
    sortOptions.find((option) => option.value === value) ?? sortOptions[0];

  return (
    <div className="dropdown dropdown-end">
      <button
        type="button"
        tabIndex={0}
        role="button"
        className="btn btn-sm rounded-xl border-base-300 bg-base-100 font-medium shadow-sm"
        aria-label="Sort ideas"
      >
        Sort: {activeOption.label}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 opacity-60"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <ul
        tabIndex={0}
        className="dropdown-content menu z-20 mt-2 w-56 rounded-box border border-base-200 bg-base-100 p-2 shadow-lg"
      >
        {sortOptions.map((option) => (
          <li key={option.value}>
            <button
              type="button"
              onClick={() => onChange(option.value)}
              className={option.value === value ? "active font-medium" : "font-medium"}
            >
              {option.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
