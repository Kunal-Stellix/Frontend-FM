import type { Category, Idea, IdeaStatus, RoadmapItem } from "@/types/idea";
import type {
  ApiKey,
  Changelog,
  CreateApiKeyResponse,
  Notification,
  AdminDashboard,
  AdminIdea,
  PortalSettings,
  TeamMember,
  Webhook,
} from "@/types/admin";

// ---------------------------------------------------------------------------
// Idea mock data
// ---------------------------------------------------------------------------

export const MOCK_CATEGORIES: Category[] = [
  { id: "1", label: "UI / UX", slug: "ui-ux", color: "#2563eb" },
  { id: "2", label: "Performance", slug: "performance", color: "#0f766e" },
  { id: "3", label: "Integrations", slug: "integrations", color: "#9333ea" },
  { id: "4", label: "Mobile", slug: "mobile", color: "#ea580c" },
  { id: "5", label: "API", slug: "api", color: "#475569" },
  { id: "6", label: "Security", slug: "security", color: "#b91c1c" },
];

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();
const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString();

const categoryBySlug = Object.fromEntries(MOCK_CATEGORIES.map((category) => [category.slug, category]));

const makeIdea = ({
  id,
  title,
  description,
  status,
  voteCount,
  commentCount,
  hasVoted = false,
  categories,
  authorId,
  authorName,
  createdAt,
  updatedAt,
}: {
  id: string;
  title: string;
  description: string;
  status: IdeaStatus;
  voteCount: number;
  commentCount: number;
  hasVoted?: boolean;
  categories: Array<keyof typeof categoryBySlug>;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}): Idea => ({
  id,
  title,
  description,
  excerpt: description.length > 120 ? `${description.slice(0, 117)}...` : description,
  status,
  voteCount,
  commentCount,
  hasVoted,
  categories: categories.map((category) => categoryBySlug[category]),
  authorId,
  authorName,
  createdAt,
  updatedAt,
});

export const MOCK_IDEAS: Idea[] = [
  makeIdea({
    id: "1",
    title: "Add dark mode support",
    description: "Late-night support teams need a calmer interface that reduces glare across dashboards, feedback triage, and idea review.",
    status: "planned",
    voteCount: 128,
    commentCount: 14,
    categories: ["ui-ux"],
    authorId: "u1",
    authorName: "Sarah M.",
    createdAt: daysAgo(18),
    updatedAt: daysAgo(2),
  }),
  makeIdea({
    id: "2",
    title: "CSV export for reports",
    description: "Teams want to export filtered report views into CSV so they can share weekly digests with finance and operations.",
    status: "shipped",
    voteCount: 94,
    commentCount: 6,
    categories: ["api", "performance"],
    authorId: "u2",
    authorName: "Jordan K.",
    createdAt: daysAgo(24),
    updatedAt: daysAgo(1),
  }),
  makeIdea({
    id: "3",
    title: "Slack integration for comment alerts",
    description: "Route idea updates and comment mentions into Slack channels so product squads can respond without opening the app constantly.",
    status: "in_progress",
    voteCount: 76,
    commentCount: 22,
    categories: ["integrations"],
    authorId: "u3",
    authorName: "Amina P.",
    createdAt: daysAgo(10),
    updatedAt: minutesAgo(90),
  }),
  makeIdea({
    id: "4",
    title: "Custom webhook support",
    description: "Enterprise customers need outbound webhooks whenever idea status changes so they can sync roadmap updates into internal tools.",
    status: "under_review",
    voteCount: 55,
    commentCount: 8,
    categories: ["api", "integrations"],
    authorId: "u4",
    authorName: "Chris T.",
    createdAt: daysAgo(6),
    updatedAt: daysAgo(1),
  }),
  makeIdea({
    id: "5",
    title: "Two-factor authentication",
    description: "Admins need stronger account protection for customer feedback workspaces that include sensitive roadmap planning.",
    status: "planned",
    voteCount: 43,
    commentCount: 3,
    categories: ["security"],
    authorId: "u5",
    authorName: "Mina R.",
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5),
  }),
  makeIdea({
    id: "6",
    title: "Bulk tag ideas",
    description: "Support teams want to tag similar ideas in bulk after importing feedback from calls and tickets.",
    status: "declined",
    voteCount: 12,
    commentCount: 1,
    categories: ["ui-ux"],
    authorId: "u6",
    authorName: "Leo D.",
    createdAt: daysAgo(40),
    updatedAt: daysAgo(25),
  }),
  makeIdea({
    id: "7",
    title: "Offline-friendly mobile review mode",
    description: "Mobile PMs need to read and queue feedback decisions while traveling with poor connectivity.",
    status: "under_review",
    voteCount: 67,
    commentCount: 11,
    categories: ["mobile", "performance"],
    authorId: "u7",
    authorName: "Priya S.",
    createdAt: daysAgo(4),
    updatedAt: minutesAgo(30),
  }),
  makeIdea({
    id: "8",
    title: "SAML single sign-on",
    description: "Security teams want SAML support so employees can access the feedback portal through existing identity providers.",
    status: "planned",
    voteCount: 81,
    commentCount: 10,
    categories: ["security", "integrations"],
    authorId: "u8",
    authorName: "Noah B.",
    createdAt: daysAgo(12),
    updatedAt: daysAgo(3),
  }),
  makeIdea({
    id: "9",
    title: "Saved filter views for triage teams",
    description: "Product ops needs reusable combinations of status, category, and sort settings to speed up weekly triage sessions.",
    status: "in_progress",
    voteCount: 51,
    commentCount: 9,
    categories: ["ui-ux", "performance"],
    authorId: "u9",
    authorName: "Elena V.",
    createdAt: daysAgo(8),
    updatedAt: daysAgo(2),
  }),
  makeIdea({
    id: "10",
    title: "Public idea sharing link",
    description: "Customer-facing teams want a read-only share link they can send to clients when confirming roadmap direction.",
    status: "planned",
    voteCount: 39,
    commentCount: 5,
    categories: ["api", "ui-ux"],
    authorId: "u10",
    authorName: "Daniel C.",
    createdAt: daysAgo(15),
    updatedAt: daysAgo(7),
  }),
  makeIdea({
    id: "11",
    title: "Faster board loading for large workspaces",
    description: "Boards with thousands of ideas should load faster with lighter payloads and deferred metadata.",
    status: "shipped",
    voteCount: 58,
    commentCount: 13,
    categories: ["performance"],
    authorId: "u11",
    authorName: "Tara G.",
    createdAt: daysAgo(20),
    updatedAt: minutesAgo(300),
  }),
  makeIdea({
    id: "12",
    title: "Dark theme for mobile app",
    description: "Users have requested a dedicated dark theme on mobile so feedback review feels consistent across platforms.",
    status: "under_review",
    voteCount: 44,
    commentCount: 4,
    categories: ["mobile", "ui-ux"],
    authorId: "u12",
    authorName: "Owen L.",
    createdAt: daysAgo(9),
    updatedAt: daysAgo(4),
  }),
];

// ---------------------------------------------------------------------------
// Admin / Changelog / Notification mock data
// ---------------------------------------------------------------------------

export const MOCK_CHANGELOG: Changelog[] = [
  {
    id: "1",
    date: new Date().toISOString(),
    type: "new_feature",
    title: "Dark Mode is finally here!",
    body: "<p>We've completely overhauled our UI to support a stunning new dark mode. You can toggle it from your profile settings or let it automatically sync with your system preferences.</p><ul><li>Glassmorphism effects updated</li><li>High-contrast text for better readability</li></ul>",
    ideaId: "idea-123"
  },
  {
    id: "2",
    date: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    type: "improvement",
    title: "Faster loading times on the feedback board",
    body: "<p>We optimized our database queries and implemented aggressive caching. The feedback board now loads <strong>3x faster</strong> than before, even on mobile connections.</p>",
  },
  {
    id: "3",
    date: new Date(Date.now() - 86400000 * 7).toISOString(), // 7 days ago
    type: "bug_fix",
    title: "Fixed upvote button not responding on Safari",
    body: "<p>Some users reported that the upvote button required double-tapping on Safari iOS. This has been resolved and the interaction is snappy again.</p>",
    ideaId: "idea-456"
  }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    message: "Admin responded to your idea: 'Add dark mode support'",
    timestamp: new Date().toISOString(),
    link: "/feedback/idea-123",
    read: false,
    iconType: "comment"
  },
  {
    id: "n2",
    message: "Your idea 'Add dark mode support' was moved to Shipped!",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    link: "/feedback/idea-123",
    read: false,
    iconType: "status_change"
  },
  {
    id: "n3",
    message: "JohnDoe mentioned you in a comment",
    timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
    link: "/feedback/idea-789",
    read: true,
    iconType: "mention"
  }
];

export const MOCK_ADMIN_IDEAS: AdminIdea[] = [
  {
    id: "idea-123",
    title: "Add dark mode support",
    description: "It burns my eyes at night. Please add dark mode.",
    excerpt: "It burns my eyes at night. Please add dark mode.",
    status: "shipped",
    voteCount: 342,
    commentCount: 45,
    hasVoted: true,
    categories: [{ id: "c1", label: "UI/UX", slug: "ui-ux" }],
    authorId: "user-1",
    authorName: "Sarah Connor",
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "idea-456",
    title: "Integrate with Slack",
    description: "Would love to get notifications in our Slack channel when new feedback is posted.",
    excerpt: "Would love to get notifications in our Slack channel...",
    status: "planned",
    voteCount: 156,
    commentCount: 12,
    hasVoted: false,
    categories: [{ id: "c2", label: "Integrations", slug: "integrations" }],
    authorId: "user-2",
    authorName: "Mike Ross",
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "idea-789",
    title: "Mobile App for iOS",
    description: "We need a dedicated mobile app rather than just a responsive site.",
    excerpt: "We need a dedicated mobile app rather than just a responsive site.",
    status: "under_review",
    voteCount: 89,
    commentCount: 34,
    hasVoted: false,
    categories: [{ id: "c3", label: "Mobile", slug: "mobile" }],
    authorId: "user-3",
    authorName: "Harvey Specter",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  }
];

export const MOCK_ADMIN_DASHBOARD: AdminDashboard = {
  queueCount: 14,
  topIdeas: MOCK_ADMIN_IDEAS,
  activityFeed: [
    {
      id: "act-1",
      action: "approved 'Integrate with Slack'",
      timestamp: new Date().toISOString(),
      user: "Admin Team"
    },
    {
      id: "act-2",
      action: "merged 3 duplicates into 'Dark Mode'",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      user: "Moderator Jane"
    }
  ]
};

export const MOCK_ROADMAP: RoadmapItem[] = MOCK_ADMIN_IDEAS.filter(idea => 
  ["planned", "in_progress", "shipped"].includes(idea.status)
).map(idea => ({ ...idea }));

export const MOCK_PORTAL_SETTINGS: PortalSettings = {
  portalName: "Feedback Hub",
  logoUrl: null,
  brandColor: "#2563eb",
};

export const MOCK_TEAM_MEMBERS: TeamMember[] = [
  {
    id: "team-1",
    name: "Mia Johnson",
    email: "mia@feedbackhub.dev",
    role: "admin",
    status: "active",
    invitedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
  },
  {
    id: "team-2",
    name: "Arjun Patel",
    email: "arjun@feedbackhub.dev",
    role: "moderator",
    status: "active",
    invitedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: "team-3",
    name: "Sara Lee",
    email: "sara@feedbackhub.dev",
    role: "member",
    status: "pending",
    invitedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    lastActiveAt: null,
  },
];

export const MOCK_WEBHOOKS: Webhook[] = [
  {
    id: "wh_1",
    url: "https://example.com/hooks/feedback",
    event: "idea.status_changed",
    status: "active",
    secretPreview: "whsec_4f8e...ac19",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
  },
  {
    id: "wh_2",
    url: "https://ops.example.com/changelog",
    event: "changelog.published",
    status: "paused",
    secretPreview: "whsec_98ca...fe02",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
  },
];

export const MOCK_API_KEYS: ApiKey[] = [
  {
    id: "key_1",
    name: "Default integration",
    prefix: "fm_live_1ab2",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
    lastUsedAt: new Date(Date.now() - 1000 * 60 * 38).toISOString(),
    revokedAt: null,
  },
  {
    id: "key_2",
    name: "QA automation",
    prefix: "fm_live_9xy7",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    lastUsedAt: null,
    revokedAt: null,
  },
];

export const MOCK_NEW_API_KEY_RESPONSE: CreateApiKeyResponse = {
  key: {
    id: "key_new",
    name: "Generated key",
    prefix: "fm_live_abcd",
    createdAt: new Date().toISOString(),
    lastUsedAt: null,
    revokedAt: null,
  },
  plainTextToken: "fm_live_abcd1234secret5678",
};
