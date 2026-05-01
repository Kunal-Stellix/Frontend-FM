"use client";

import Image from "next/image";

type LogoUploaderProps = {
  logoUrl: string | null;
  portalName: string;
  onChange: (nextLogoUrl: string | null) => void;
};

export function LogoUploader({ logoUrl, portalName, onChange }: LogoUploaderProps) {
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const nextValue = typeof reader.result === "string" ? reader.result : null;
      onChange(nextValue);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={`${portalName} logo`}
            width={64}
            height={64}
            unoptimized
            className="h-16 w-16 rounded-2xl border border-base-300 object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-base-300 bg-base-200 text-sm font-bold text-base-content/50">
            Logo
          </div>
        )}

        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <label className="btn btn-sm btn-outline">
              Upload logo
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              onClick={() => onChange(null)}
            >
              Remove
            </button>
          </div>
          <p className="text-xs text-base-content/55">
            Recommended for square marks and portal avatars.
          </p>
        </div>
      </div>

      <p className="text-xs text-base-content/60">
        Placeholder flow for now. The selected image is stored locally so branding previews stay
        consistent while backend uploads are pending.
      </p>
    </div>
  );
}
