import type { Idea } from "./idea";

export type ChangelogEntryType = "new_feature" | "improvement" | "bug_fix";
export type TeamRole = "admin" | "moderator" | "member";
export type TeamMemberStatus = "active" | "pending" | "revoked";
export type WebhookEvent = "idea.created" | "idea.status_changed" | "changelog.published";

export type Changelog = {
  id: string;
  date: string;
  type: ChangelogEntryType;
  title: string;
  body: string; // HTML or markdown
  ideaId?: string; // Optional link to a related idea
};

export type NotificationType = "comment" | "status_change" | "mention" | "system";

export type Notification = {
  id: string;
  message: string;
  timestamp: string;
  link: string;
  read: boolean;
  iconType: NotificationType;
};

export type AdminActivity = {
  id: string;
  action: string;
  timestamp: string;
  user: string;
};

export type AdminDashboard = {
  queueCount: number;
  topIdeas: Idea[];
  activityFeed: AdminActivity[];
};

export type AdminIdea = Idea & {
  isMerging?: boolean;
};

export type PortalSettings = {
  portalName: string;
  logoUrl: string | null;
  brandColor: string;
};

export type BrandingState = PortalSettings;

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  status: TeamMemberStatus;
  invitedAt: string;
  lastActiveAt: string | null;
};

export type InviteTeamMemberPayload = {
  email: string;
  role: TeamRole;
};

export type Webhook = {
  id: string;
  url: string;
  event: WebhookEvent;
  status: "active" | "paused";
  secretPreview: string;
  createdAt: string;
};

export type CreateWebhookPayload = {
  url: string;
  event: WebhookEvent;
};

export type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
};

export type CreateApiKeyResponse = {
  key: ApiKey;
  plainTextToken: string;
};

// API equivalents (what the backend would return)
export type ApiChangelog = {
  id: string;
  created_at: string;
  entry_type: ChangelogEntryType;
  title: string;
  content: string;
  idea_id: string | null;
};

export type ApiNotification = {
  id: string;
  message: string;
  created_at: string;
  target_url: string;
  is_read: boolean;
  type: NotificationType;
};
