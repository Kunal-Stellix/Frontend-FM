import { RoadmapKanban } from "@/components/roadmap/RoadmapKanban";

export const metadata = {
  title: "Roadmap - Product Feedback Platform",
  description: "See what we're working on and what we've recently shipped.",
};

export default function RoadmapPage() {
  return <RoadmapKanban />;
}
