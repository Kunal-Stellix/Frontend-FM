import { cn } from "@/lib/utils";

type AvatarSize = "sm" | "md" | "lg";
type PresenceTone = "online" | "away" | "busy" | "offline";

type FeedbackAvatarProps = {
  name: string;
  imageUrl?: string;
  initials?: string;
  size?: AvatarSize;
  presence?: PresenceTone;
  className?: string;
};

const avatarSizes: Record<AvatarSize, string> = {
  sm: "w-10",
  md: "w-12",
  lg: "w-16",
};

const presenceClasses: Record<PresenceTone, string> = {
  online: "online",
  away: "online",
  busy: "online",
  offline: "offline",
};

const presenceToneClasses: Record<PresenceTone, string> = {
  online: "bg-success text-success-content",
  away: "bg-warning text-warning-content",
  busy: "bg-error text-error-content",
  offline: "bg-base-300 text-base-content",
};

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function FeedbackAvatar({
  name,
  imageUrl,
  initials,
  size = "md",
  presence,
  className,
}: FeedbackAvatarProps) {
  const fallbackInitials = initials ?? getInitials(name);

  return (
    <div
      className={cn(
        "avatar",
        !imageUrl && "placeholder",
        presence && presenceClasses[presence],
        className,
      )}
      aria-label={name}
      title={name}
    >
      <div
        className={cn(
          "rounded-full",
          avatarSizes[size],
          !imageUrl && "bg-neutral text-neutral-content",
          presence && presenceToneClasses[presence],
        )}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={name} />
        ) : (
          <span className="font-semibold">{fallbackInitials}</span>
        )}
      </div>
    </div>
  );
}
