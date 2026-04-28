"use client";

import { Search, X } from "lucide-react";
import { useRef, useState } from "react";

type IdeaSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export function IdeaSearchBar({ value, onChange }: IdeaSearchBarProps) {
  const [draft, setDraft] = useState(value);
  const debounceTimerRef = useRef<number | null>(null);

  const handleChange = (nextValue: string) => {
    setDraft(nextValue);

    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(() => {
      onChange(nextValue);
    }, 300);
  };

  const handleClear = () => {
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }
    setDraft("");
    onChange("");
  };

  return (
    <label className="input input-bordered w-full flex items-center gap-2 rounded-xl h-12 focus-within:input-primary transition-all duration-200">
      <Search className="h-4 w-4 text-base-content/40" />
      <input
        type="text"
        value={draft}
        onChange={(event) => handleChange(event.target.value)}
        className="grow bg-transparent outline-none text-sm placeholder:text-base-content/40"
        placeholder="Search ideas…"
      />
      {draft ? (
        <button
          type="button"
          onClick={handleClear}
          className="btn btn-ghost btn-xs btn-circle"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : (
        <kbd className="kbd kbd-sm text-base-content/30">⌘K</kbd>
      )}
    </label>
  );
}
