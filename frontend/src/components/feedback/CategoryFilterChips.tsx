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
    <ul className="menu rounded-box gap-2 p-0">
      <li>
        <button
          type="button"
          onClick={() => onChange([])}
          className={`min-h-12 rounded-xl px-4 text-sm ${selected.length === 0 ? "active font-semibold" : "font-medium"}`}
        >
          <span className="flex-1">All categories</span>
          <span className="badge badge-md badge-ghost">
            {categories.length}
          </span>
        </button>
      </li>

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
              className={`min-h-12 rounded-xl px-4 text-sm ${isActive ? "active font-semibold" : "font-medium"}`}
            >
              {category.color ? (
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
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
