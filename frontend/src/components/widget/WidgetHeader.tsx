"use client";

import Image from "next/image";
import type { PortalSettings } from "@/types/admin";
import type { WidgetSession } from "@/types/widget";

export function WidgetHeader({
  portal,
  session,
}: {
  portal: PortalSettings;
  session: WidgetSession | null;
}) {
  return (
    <header className="rounded-[24px] border border-base-300 bg-base-100 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {portal.logoUrl ? (
            <Image
              src={portal.logoUrl}
              alt={`${portal.portalName} logo`}
              width={44}
              height={44}
              unoptimized
              className="h-11 w-11 rounded-2xl object-cover"
            />
          ) : (
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-black text-white"
              style={{ backgroundColor: portal.brandColor }}
            >
              {portal.portalName.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-base-content/45">
              Embedded Portal
            </p>
            <h1 className="mt-1 text-lg font-bold text-base-content">{portal.portalName}</h1>
          </div>
        </div>

        <div className="text-right text-xs text-base-content/60">
          <p className="font-semibold text-base-content">{session ? session.userName : "Guest mode"}</p>
          <p>{session ? "Host-authenticated preview" : "Public widget preview"}</p>
        </div>
      </div>
    </header>
  );
}
