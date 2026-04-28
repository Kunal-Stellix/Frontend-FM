import { cn } from "@/lib/utils";
import { FeedbackAvatar } from "./feedback-avatar";

type CommentThreadItemProps = {
  author: string;
  role: string;
  postedAt: string;
  message: string;
  presence?: "online" | "away" | "busy" | "offline";
  highlighted?: boolean;
  className?: string;
};

export function CommentThreadItem({
  author,
  role,
  postedAt,
  message,
  presence = "offline",
  highlighted = false,
  className,
}: CommentThreadItemProps) {
  return (
    <div className={cn("flex items-start gap-4", className)}>
      <FeedbackAvatar name={author} size="sm" presence={presence} />
      <div
        className={cn(
          "w-full rounded-3xl border border-base-300 bg-base-100 px-5 py-4 shadow-sm",
          highlighted && "border-primary/20 bg-primary/5",
        )}
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="font-semibold text-base-content">{author}</p>
          <span className="badge badge-outline badge-sm">{role}</span>
          <span className="text-xs text-base-content/60">{postedAt}</span>
        </div>
        <p className="mt-3 text-sm leading-6 text-base-content/75">{message}</p>
      </div>
    </div>
  );
}
