"use client";

import Image from "next/image";
import type { PortalSettings } from "@/types/admin";

export function BrandPreviewCard({ settings }: { settings: PortalSettings }) {
  return (
    <div className="rounded-[28px] border border-base-300/80 bg-base-100 p-6 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.5)]">
      <div className="mb-4 flex items-center gap-3">
        {settings.logoUrl ? (
          <Image
            src={settings.logoUrl}
            alt={`${settings.portalName} logo`}
            width={48}
            height={48}
            unoptimized
            className="h-12 w-12 rounded-2xl border border-base-300 object-cover"
          />
        ) : (
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-black text-white"
            style={{ backgroundColor: settings.brandColor }}
          >
            {settings.portalName.slice(0, 2).toUpperCase()}
          </div>
        )}

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-base-content/50">
            Live Preview
          </p>
          <h3 className="text-xl font-bold text-base-content">{settings.portalName}</h3>
        </div>
      </div>

      <div className="rounded-[24px] border border-base-300 bg-base-200/60 p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-base-content">Portal accent</p>
            <p className="text-xs text-base-content/60">
              Buttons, highlights, and widget accents inherit this color.
            </p>
          </div>
          <div
            className="h-11 w-11 rounded-2xl border border-white/60 shadow-inner"
            style={{ backgroundColor: settings.brandColor }}
          />
        </div>

        <div className="rounded-[22px] border border-base-300 bg-base-100 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-base-content">Release digest</span>
            <span
              className="rounded-full px-3 py-1 text-xs font-semibold text-white"
              style={{ backgroundColor: settings.brandColor }}
            >
              Brand CTA
            </span>
          </div>
          <p className="text-sm text-base-content/70">
            Customers see a more cohesive portal when the app shell, widget, and changelog all
            share the same visual accent.
          </p>
        </div>
      </div>
    </div>
  );
}
