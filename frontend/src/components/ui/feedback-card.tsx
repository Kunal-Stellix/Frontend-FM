import { MessageSquareText, Triangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardBody } from "./card";
import { FeedbackAvatar } from "./feedback-avatar";
import { FeedbackStatusBadge, type FeedbackStatus } from "./feedback-status-badge";

type FeedbackCardProps = {
  title: string;
  summary: string;
  status: FeedbackStatus;
  author: string;
  team?: string;
  updatedAt: string;
  votes: number;
  comments: number;
  className?: string;
};

export function FeedbackCard({
  title,
  summary,
  status,
  author,
  team,
  updatedAt,
  votes,
  comments,
  className,
}: FeedbackCardProps) {
  return (
    <Card className={cn("border border-base-300 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md", className)}>
      <CardBody className="gap-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <FeedbackStatusBadge status={status} />
            <h3 className="text-xl font-semibold text-base-content">{title}</h3>
            <p className="max-w-2xl text-sm leading-6 text-base-content/70">{summary}</p>
          </div>

          <div className="stats stats-horizontal border border-base-300 bg-base-200/40 shadow-none">
            <div className="stat px-4 py-3">
              <div className="stat-figure text-primary">
                <Triangle className="h-4 w-4 fill-current" />
              </div>
              <div className="stat-title text-xs">Votes</div>
              <div className="stat-value text-2xl">{votes}</div>
            </div>
            <div className="stat px-4 py-3">
              <div className="stat-figure text-secondary">
                <MessageSquareText className="h-4 w-4" />
              </div>
              <div className="stat-title text-xs">Comments</div>
              <div className="stat-value text-2xl">{comments}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-base-300 pt-4">
          <div className="flex items-center gap-3">
            <FeedbackAvatar name={author} size="sm" presence="online" />
            <div>
              <p className="text-sm font-medium text-base-content">{author}</p>
              <p className="text-xs text-base-content/60">
                {team ? `${team} team` : "Customer success"} • Updated {updatedAt}
              </p>
            </div>
          </div>

          <button className="btn btn-ghost btn-sm">Open thread</button>
        </div>
      </CardBody>
    </Card>
  );
}
