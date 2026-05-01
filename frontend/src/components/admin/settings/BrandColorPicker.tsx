"use client";

type BrandColorPickerProps = {
  value: string;
  onChange: (value: string) => void;
};

export function BrandColorPicker({ value, onChange }: BrandColorPickerProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <input
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-14 w-20 cursor-pointer rounded-xl border border-base-300 bg-base-100 p-1"
      />
      <label className="form-control w-full max-w-xs">
        <span className="mb-2 text-sm font-medium text-base-content">Hex value</span>
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="input input-bordered"
          placeholder="#2563eb"
        />
      </label>
    </div>
  );
}
