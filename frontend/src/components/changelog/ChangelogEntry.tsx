import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Changelog } from "@/types/admin";
import { TypeBadge } from "./TypeBadge";

type ChangelogEntryProps = {
  entry: Changelog;
};

function formatDate(dateString: string) {
  const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

export function ChangelogEntry({ entry }: ChangelogEntryProps) {
  return (
    <article className="relative pl-8 sm:pl-32 py-6 group">
      {/* Timeline dot & line */}
      <div className="hidden sm:flex flex-col items-center absolute left-24 top-0 bottom-0">
        <div className="w-px h-8 bg-base-200"></div>
        <div className="w-3 h-3 rounded-full bg-primary/20 border-2 border-primary z-10"></div>
        <div className="w-px flex-1 bg-base-200 group-last:bg-transparent"></div>
      </div>
      
      {/* Mobile timeline line */}
      <div className="sm:hidden absolute left-0 top-8 bottom-0 w-px bg-base-200 group-last:bg-transparent"></div>
      <div className="sm:hidden absolute left-[-5px] top-8 w-3 h-3 rounded-full bg-primary/20 border-2 border-primary z-10"></div>

      <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
        <div className="sm:w-20 pt-1 shrink-0">
          <time className="text-sm font-medium text-base-content/60 hidden sm:block">
            {formatDate(entry.date)}
          </time>
        </div>

        <div className="flex-1 bg-base-100 p-6 rounded-2xl shadow-sm border border-base-200 hover:border-primary/30 transition-colors">
          <time className="text-xs font-medium text-base-content/60 sm:hidden mb-3 block">
            {formatDate(entry.date)}
          </time>
          
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <TypeBadge type={entry.type} />
            <h3 className="text-xl font-bold text-base-content">{entry.title}</h3>
          </div>

          <div 
            className="prose prose-sm max-w-none text-base-content/80 mb-6"
            dangerouslySetInnerHTML={{ __html: entry.body }}
          />

          {entry.ideaId && (
            <Link 
              href={`/feedback/${entry.ideaId}`}
              className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary-focus transition-colors"
            >
              View related feedback <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
