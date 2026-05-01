"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  applyBrandColor,
  getDefaultPortalSettings,
  getStoredPortalSettings,
  subscribeToPortalSettings,
} from "@/lib/brandTheme";

export function BrandThemeProvider({ children }: { children: React.ReactNode }) {
  const settings = useSyncExternalStore(
    subscribeToPortalSettings,
    getStoredPortalSettings,
    getDefaultPortalSettings,
  );

  useEffect(() => {
    applyBrandColor(settings.brandColor);
  }, [settings.brandColor]);

  return <>{children}</>;
}
