"use client";

import type { WidgetTab } from "@/types/widget";

const tabs: { id: WidgetTab; label: string }[] = [
  { id: "submit", label: "Submit" },
  { id: "browse", label: "Browse" },
  { id: "roadmap", label: "Roadmap" },
  { id: "whats-new", label: "What's New" },
];

export function WidgetTabs({
  value,
  onChange,
}: {
  value: WidgetTab;
  onChange: (tab: WidgetTab) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <div className="inline-flex min-w-full rounded-[20px] border border-base-300 bg-base-100 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex-1 rounded-[14px] px-3 py-2 text-sm font-medium transition ${
              value === tab.id
                ? "text-white"
                : "text-base-content/60 hover:text-base-content"
            }`}
            style={value === tab.id ? { backgroundColor: "var(--brand-color)" } : undefined}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
