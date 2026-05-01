import type { Changelog } from "./admin";
import type { Idea, RoadmapItem } from "./idea";

export type WidgetTab = "submit" | "browse" | "roadmap" | "whats-new";

export type WidgetSession = {
  token: string;
  userName: string;
  userEmail: string;
  source: "url-token";
};

export type WidgetBootstrapData = {
  session: WidgetSession | null;
  ideas: Idea[];
  roadmap: RoadmapItem[];
  changelog: Changelog[];
};
