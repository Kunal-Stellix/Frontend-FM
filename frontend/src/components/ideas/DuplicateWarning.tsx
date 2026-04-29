import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import type { DuplicateCheckResponse, IdeaStatus } from "@/types/idea";

type DuplicateWarningProps = {
  duplicates: DuplicateCheckResponse["duplicates"];
  listHref?: string;
};

const statusLabels: Record<IdeaStatus, string> = {
  under_review: "Under Review",
  planned: "Planned",
  in_progress: "In Progress",
  shipped: "Shipped",
  declined: "Declined",
};

const buildIdeaLink = (listHref: string, title: string) => {
  const [pathname, queryString] = listHref.split("?");
  const params = new URLSearchParams(queryString ?? "");
  params.set("search", title);
  const nextQuery = params.toString();
  return nextQuery ? `${pathname}?${nextQuery}` : pathname;
};

export function DuplicateWarning({ duplicates, listHref = "/ideas" }: DuplicateWarningProps) {
  if (duplicates.length === 0) {
    return null;
  }

  return (
    <div role="alert" className="alert alert-warning alert-sm">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <div className="flex-1 space-y-2">
        <p className="text-sm font-semibold">Similar ideas already exist</p>
        <ul className="space-y-1.5">
          {duplicates.map((idea) => (
            <li
              key={idea.id}
              className="flex items-center justify-between gap-3 rounded-lg bg-base-100/60 px-3 py-2 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-base-content">
                  {idea.title}
                </p>
                <p className="text-xs text-base-content/60">
                  {statusLabels[idea.status]} · {idea.voteCount} votes
                </p>
              </div>
              <Link
                href={buildIdeaLink(listHref, idea.title)}
                className="link link-primary shrink-0 text-xs"
              >
                View
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
