"use client";

import { useEffect, useState } from "react";
import { Palette, Save } from "lucide-react";
import { fetchPortalSettings, updatePortalSettings } from "@/lib/feedbackApi";
import { applyBrandColor } from "@/lib/brandTheme";
import type { PortalSettings } from "@/types/admin";
import { BrandColorPicker } from "./BrandColorPicker";
import { BrandPreviewCard } from "./BrandPreviewCard";
import { LogoUploader } from "./LogoUploader";

const FALLBACK_SETTINGS: PortalSettings = {
  portalName: "Feedback Hub",
  logoUrl: null,
  brandColor: "#2563eb",
};

export function PortalSettingsForm() {
  const [settings, setSettings] = useState<PortalSettings>(FALLBACK_SETTINGS);
  const [savedSettings, setSavedSettings] = useState<PortalSettings>(FALLBACK_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadSettings = async () => {
      try {
        setLoading(true);
        const response = await fetchPortalSettings();
        if (!active) return;
        setSettings(response);
        setSavedSettings(response);
      } catch (loadError) {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : "Failed to load settings.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadSettings();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    applyBrandColor(settings.brandColor);
  }, [settings.brandColor]);

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(savedSettings);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const response = await updatePortalSettings(settings);
      setSettings(response);
      setSavedSettings(response);
      setSuccessMessage("Portal branding saved.");
      window.setTimeout(() => setSuccessMessage(null), 3000);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <section className="overflow-hidden rounded-[30px] border border-base-300/80 bg-gradient-to-br from-base-100 via-base-100 to-primary/10 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.5)]">
        <div className="grid gap-5 px-6 py-6 sm:px-7 sm:py-7 lg:grid-cols-[minmax(0,1.1fr)_minmax(220px,0.9fr)] lg:items-end">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-base-content">General Settings</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-base-content/60">
                Adjust the portal identity, uploaded mark, and brand accent from one organized
                workspace panel.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
            <SettingMetric
              label="Portal name"
              value={settings.portalName || "Untitled portal"}
              // helper="Primary workspace label"
            />
            <SettingMetric
              label="Change state"
              value={hasChanges ? "Unsaved changes" : "Up to date"}
             // helper={hasChanges ? "Save to publish updates" : "Everything is saved"}
            />
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <section className="rounded-[30px] border border-base-300/80 bg-base-100/95 p-6 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.5)] sm:p-7">
          <div className="mb-5 flex items-center justify-between gap-3 border-b border-base-300/80 pb-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-base-content/45">
                Workspace Editor
              </p>
              <h3 className="mt-1 text-xl font-bold text-base-content">Brand and identity</h3>
            </div>
            <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Live draft
            </div>
          </div>

          <div className="space-y-5">
            <label className="form-control rounded-[24px] border border-base-300/70 bg-gradient-to-br from-base-100 to-base-200/35 p-5">
              {/* <span className="mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-base-content/45">
                Identity
              </span> */}
              <span className="mb-2 text-sm font-medium text-base-content">Portal name</span>
              <input
                type="text"
                value={settings.portalName}
                onChange={(event) =>
                  setSettings((current) => ({ ...current, portalName: event.target.value }))
                }
                className="input input-bordered border-base-300 bg-base-100"
                placeholder="Feedback Hub"
              />
            </label>

            <div className="rounded-[24px] border border-base-300/70 bg-gradient-to-br from-base-100 to-base-200/35 p-5">
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-base-content/45">
                Brand asset
              </p>
              <p className="mb-2 text-sm font-medium text-base-content">Logo</p>
              <LogoUploader
                logoUrl={settings.logoUrl}
                portalName={settings.portalName}
                onChange={(logoUrl) => setSettings((current) => ({ ...current, logoUrl }))}
              />
            </div>

            <div className="rounded-[24px] border border-base-300/70 bg-gradient-to-br from-base-100 to-base-200/35 p-5">
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-base-content/45">
                Visual system
              </p>
              <p className="mb-2 text-sm font-medium text-base-content">Brand color</p>
              <BrandColorPicker
                value={settings.brandColor}
                onChange={(brandColor) =>
                  setSettings((current) => ({ ...current, brandColor: brandColor.trim() }))
                }
              />
            </div>
          </div>

          {(error || successMessage) && (
            <div className="mt-6">
              {error ? <div className="alert alert-error">{error}</div> : null}
              {successMessage ? <div className="alert alert-success">{successMessage}</div> : null}
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-base-300/80 pt-6">
            <p className="text-sm text-base-content/60">
              {hasChanges ? "You have unsaved branding changes." : "All branding changes saved."}
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving || !hasChanges}
            >
              {saving ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save settings
                </>
              )}
            </button>
          </div>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-8">
          <div className="rounded-[28px] border border-base-300/80 bg-base-100/95 p-5 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.5)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-base-content/45">
              Preview
            </p>
            <p className="mt-2 text-lg font-semibold text-base-content">Live portal snapshot</p>
            <p className="mt-2 text-sm leading-6 text-base-content/60">
              As you update the form, the preview reflects the current branding state in real
              time.
            </p>
          </div>
          <BrandPreviewCard settings={settings} />
        </aside>
      </div>
    </div>
  );
}

function SettingMetric({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="rounded-[22px] border border-base-300/70 bg-base-100/85 p-4 backdrop-blur">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-base-content/45">
        {label}
      </p>
      <p className="mt-2 break-words text-base font-semibold text-base-content">{value}</p>
      {helper && <p className="mt-1 text-sm text-base-content/55">{helper}</p>}
    </div>
  );
}
