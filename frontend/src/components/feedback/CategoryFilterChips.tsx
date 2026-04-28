import type { Category } from "@/types/idea";

type CategoryFilterChipsProps = {
  categories: Category[];
  selected: string[];
  onChange: (selected: string[]) => void;
};

export function CategoryFilterChips({
  categories,
  selected,
  onChange,
}: CategoryFilterChipsProps) {
  return (
    <ul className="menu menu-sm rounded-box p-0 gap-0.5">
      {/* "All" item */}
      <li>
        <button
          type="button"
          onClick={() => onChange([])}
          className={selected.length === 0 ? "active font-semibold" : ""}
        >
          <span className="flex-1">All categories</span>
          <span className="badge badge-sm badge-ghost">
            {categories.length}
          </span>
        </button>
      </li>

      {/* Individual categories */}
      {categories.map((category) => {
        const isActive = selected.includes(category.slug);

        return (
          <li key={category.id}>
            <button
              type="button"
              onClick={() =>
                onChange(
                  isActive
                    ? selected.filter((slug) => slug !== category.slug)
                    : [...selected, category.slug],
                )
              }
              className={isActive ? "active font-semibold" : ""}
            >
              {category.color ? (
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: category.color }}
                />
              ) : null}
              <span className="flex-1">{category.label}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
