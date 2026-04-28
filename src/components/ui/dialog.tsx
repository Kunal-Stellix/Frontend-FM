import { cn } from "@/lib/utils";

type DialogSize = "sm" | "md" | "lg";

type DialogProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  open?: boolean;
  preview?: boolean;
  size?: DialogSize;
  className?: string;
};

const dialogSizes: Record<DialogSize, string> = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl",
};

export function Dialog({
  title,
  description,
  children,
  actions,
  open = true,
  preview = false,
  size = "md",
  className,
}: DialogProps) {
  if (preview) {
    return (
      <div className={cn("flex h-full items-center justify-center p-4", className)}>
        <div className="absolute inset-0 bg-base-content/20" aria-hidden="true" />
        <div
          className={cn(
            "relative w-full rounded-box border border-base-300 bg-base-100 shadow-xl",
            dialogSizes[size],
          )}
        >
          <div className="space-y-2 p-6">
            <h3 className="text-xl font-semibold text-base-content">{title}</h3>
            {description ? <p className="text-sm text-base-content/70">{description}</p> : null}
          </div>

          <div className="px-6 pb-6">{children}</div>

          {actions ? <div className="modal-action mt-0 px-6 pb-6">{actions}</div> : null}
        </div>
      </div>
    );
  }

  return (
    <dialog className={cn("modal modal-open static", !open && "hidden", className)} open={open}>
      <div className={cn("modal-box border border-base-300 bg-base-100 shadow-xl", dialogSizes[size])}>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-base-content">{title}</h3>
          {description ? <p className="text-sm text-base-content/70">{description}</p> : null}
        </div>

        <div className="mt-6">{children}</div>

        {actions ? <div className="modal-action mt-8">{actions}</div> : null}
      </div>
      <div className="modal-backdrop bg-base-content/20" aria-hidden="true" />
    </dialog>
  );
}
