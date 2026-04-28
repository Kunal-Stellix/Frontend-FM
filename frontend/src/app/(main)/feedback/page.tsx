import { Suspense } from "react";
import { FeedbackPageClient } from "@/components/feedback";

export default function FeedbackPage() {
  return (
    <Suspense>
      <FeedbackPageClient />
    </Suspense>
  );
}
