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
import type { RoadmapItem } from "@/types/idea";

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
