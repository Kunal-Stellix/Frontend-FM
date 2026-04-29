import { Hash, Check } from "lucide-react";
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
          <span className="flex-1 text-left">All Topics</span>
          <span className="text-xs font-semibold tabular-nums text-base-content/40 group-hover:text-base-content/60">
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
              className={`group flex w-full items-center gap-3 min-h-10 rounded-lg px-2 text-sm transition-colors hover:bg-base-200/60 ${
                isActive
                  ? "bg-base-200/40 font-bold text-base-content"
                  : "font-medium text-base-content/70"
              }`}
            >
              <Hash className={`h-4 w-4 shrink-0 transition-colors ${isActive ? "text-primary" : "text-base-content/30 group-hover:text-base-content/50"}`} />
              <span className="flex-1 text-left">{category.label}</span>
              {isActive && <Check className="h-4 w-4 shrink-0 text-primary" />}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
