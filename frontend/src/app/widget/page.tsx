import { Suspense } from "react";
import { WidgetShell } from "@/components/widget/WidgetShell";

export default function WidgetPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-base-200">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      }
    >
      <WidgetShell />
    </Suspense>
  );
}
