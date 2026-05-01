# Backend Verification Checklist
> Source: sprint_plan_full.docx — Product Feedback Platform (FastAPI + SQLAlchemy 2.0 + PostgreSQL)

---

## 🗂️ DB Models (14 Tables Total)

### Day 1 — `users`
- [ ] `id` — UUID PK, `default=uuid4()`, `server_default=gen_random_uuid()`
- [ ] `email` — VARCHAR(255), UNIQUE NOT NULL, indexed
- [ ] `name` — VARCHAR(255), NOT NULL
- [ ] `hashed_password` — VARCHAR(255), NOT NULL
- [ ] `role` — ENUM(`admin | moderator | member`), default=`member`
- [ ] `avatar_url` — TEXT, nullable
- [ ] `is_active` — BOOLEAN, default=`True`
- [ ] `created_at` — TIMESTAMPTZ, `server_default=now()`
- [ ] `updated_at` — TIMESTAMPTZ, `onupdate=now()`

### Day 2 — `categories`
- [ ] `id` — UUID PK
- [ ] `name` — VARCHAR(100), UNIQUE NOT NULL
- [ ] `slug` — VARCHAR(100), UNIQUE NOT NULL, url-safe
- [ ] `color` — VARCHAR(7), hex (e.g. `#2980B9`)
- [ ] `created_at` — TIMESTAMPTZ

### Day 2 — `ideas`
- [ ] `id` — UUID PK
- [ ] `title` — VARCHAR(255), NOT NULL
- [ ] `description` — TEXT, nullable
- [ ] `status` — ENUM(`under_review | planned | in_progress | shipped | declined`), default=`under_review`
- [ ] `author_id` — UUID FK → `users.id` ON DELETE SET NULL
- [ ] `category_id` — UUID FK → `categories.id` ON DELETE SET NULL, nullable
- [ ] `vote_count` — INTEGER, default=0 (denormalized, updated on vote toggle)
- [ ] `comment_count` — INTEGER, default=0 (denormalized)
- [ ] `is_public` — BOOLEAN, default=`False` if moderation ON, else `True`
- [ ] `created_at` — TIMESTAMPTZ
- [ ] `updated_at` — TIMESTAMPTZ

### Day 2 — `votes`
- [ ] `id` — UUID PK
- [ ] `user_id` — UUID FK → `users.id` ON DELETE CASCADE
- [ ] `idea_id` — UUID FK → `ideas.id` ON DELETE CASCADE
- [ ] `created_at` — TIMESTAMPTZ
- [ ] `UniqueConstraint('user_id', 'idea_id')` applied

### Day 2 — `followers` (idea subscriptions)
- [ ] `user_id` — UUID FK → `users.id` ON DELETE CASCADE (composite PK)
- [ ] `idea_id` — UUID FK → `ideas.id` ON DELETE CASCADE (composite PK)
- [ ] `created_at` — TIMESTAMPTZ

### Day 3 — `comments`
- [ ] `id` — UUID PK
- [ ] `idea_id` — UUID FK → `ideas.id` ON DELETE CASCADE
- [ ] `author_id` — UUID FK → `users.id` ON DELETE SET NULL
- [ ] `parent_id` — UUID FK → `comments.id` ON DELETE CASCADE, null = top-level
- [ ] `body` — TEXT, NOT NULL
- [ ] `created_at` — TIMESTAMPTZ
- [ ] `updated_at` — TIMESTAMPTZ

### Day 3 — `roadmap_items`
- [ ] `id` — UUID PK
- [ ] `title` — VARCHAR(255), NOT NULL
- [ ] `description` — TEXT, nullable
- [ ] `status` — ENUM(`planned | in_progress | shipped`)
- [ ] `sort_order` — INTEGER (for drag-drop ordering)
- [ ] `created_at` — TIMESTAMPTZ
- [ ] `updated_at` — TIMESTAMPTZ

### Day 3 — `roadmap_idea_links` (junction)
- [ ] `roadmap_item_id` — UUID FK → `roadmap_items.id` ON DELETE CASCADE (composite PK)
- [ ] `idea_id` — UUID FK → `ideas.id` ON DELETE CASCADE (composite PK)

### Day 4 — `changelog_entries`
- [ ] `id` — UUID PK
- [ ] `title` — VARCHAR(255), NOT NULL
- [ ] `body` — TEXT (rich text/markdown)
- [ ] `type` — ENUM(`new_feature | improvement | bug_fix`)
- [ ] `linked_idea_id` — UUID FK → `ideas.id`, nullable
- [ ] `published_at` — TIMESTAMPTZ, default=`now()`
- [ ] `created_by` — UUID FK → `users.id`

### Day 4 — `changelog_subscribers`
- [ ] `id` — UUID PK
- [ ] `email` — VARCHAR(255), UNIQUE NOT NULL
- [ ] `unsubscribe_token` — VARCHAR(64), unique token for one-click unsubscribe
- [ ] `created_at` — TIMESTAMPTZ

### Day 4 — `notifications`
- [ ] `id` — UUID PK
- [ ] `user_id` — UUID FK → `users.id` ON DELETE CASCADE
- [ ] `type` — ENUM(`status_change | comment_reply | idea_merged | changelog_published`)
- [ ] `title` — VARCHAR(255)
- [ ] `body` — TEXT
- [ ] `link` — TEXT (relative URL)
- [ ] `is_read` — BOOLEAN, default=`False`
- [ ] `created_at` — TIMESTAMPTZ

### Day 5 — `portal_settings`
- [ ] `id` — UUID PK (singleton row)
- [ ] `portal_name` — VARCHAR(255), NOT NULL, default=`Feedback`
- [ ] `logo_url` — TEXT, nullable
- [ ] `brand_color` — VARCHAR(7), hex, default=`#2980B9`
- [ ] `custom_domain` — VARCHAR(255), nullable
- [ ] `domain_verified` — BOOLEAN, default=`False`
- [ ] `moderation_on` — BOOLEAN, default=`False`
- [ ] `updated_at` — TIMESTAMPTZ

### Day 5 — `webhooks`
- [ ] `id` — UUID PK
- [ ] `url` — TEXT, NOT NULL (must be `https://`)
- [ ] `secret` — VARCHAR(64), HMAC signing secret
- [ ] `events` — ARRAY[TEXT] (e.g. `['idea.created', 'idea.status_changed']`)
- [ ] `is_active` — BOOLEAN, default=`True`
- [ ] `created_at` — TIMESTAMPTZ

### Day 5 — `api_keys`
- [ ] `id` — UUID PK
- [ ] `name` — VARCHAR(255), label
- [ ] `key_hash` — VARCHAR(255), SHA-256 of plaintext (never store raw)
- [ ] `key_prefix` — VARCHAR(8), first 8 chars shown in UI
- [ ] `created_by` — UUID FK → `users.id`
- [ ] `last_used_at` — TIMESTAMPTZ, nullable
- [ ] `is_active` — BOOLEAN, default=`True`
- [ ] `created_at` — TIMESTAMPTZ

---

## 📦 Pydantic v2 Schemas

### `schemas/auth.py` + `schemas/user.py`
- [ ] `RegisterRequest` — `name` (min 1, max 255), `email` (EmailStr), `password` (min 8, max 128)
- [ ] `LoginRequest` — `email` (EmailStr), `password` (str)
- [ ] `TokenResponse` — `access_token` (JWT, 15min), `refresh_token` (JWT, 7d), `token_type` (literal `bearer`)
- [ ] `UserResponse` — `id`, `name`, `email`, `role` (RoleEnum), `avatar_url`, `created_at`
- [ ] `RefreshRequest` — `refresh_token` (valid non-expired JWT)

### `schemas/idea.py` + `schemas/vote.py`
- [ ] `IdeaCreate` — `title` (min 3, max 255), `description` (max 5000, optional), `category_id` (UUID | None, must exist if provided)
- [ ] `IdeaResponse` — all fields including `voted_by_me` (bool, computed per-user), nested `author` (UserResponse), nested `category` (CategoryResponse | None)
- [ ] `IdeaListResponse` — `items`, `total`, `page`, `page_size` (default 20), `has_next`
- [ ] `VoteResponse` — `voted` (bool), `vote_count` (int, updated total)
- [ ] `CategoryResponse` — `id`, `name`, `slug`, `color`

### `schemas/comment.py`
- [ ] `CommentCreate` — `body` (min 1, max 2000), `parent_id` (UUID | None)
- [ ] `CommentResponse` — `id`, `body`, nested `author`, `parent_id`, `replies` (list[CommentResponse], one level), `created_at`, `updated_at`
- [ ] `CommentListResponse` — `items` (top-level only, replies nested inside), `total`, `page`, `has_next`

### `schemas/roadmap.py`
- [ ] `RoadmapItemCreate` — `title` (min 1, max 255), `description` (max 2000), `status` (RoadmapStatus), `idea_ids` (list[UUID], can be empty)
- [ ] `RoadmapItemResponse` — `id`, `title`, `description`, `status`, `linked_ideas` (slim list), `total_votes` (sum of vote_count), `sort_order`, `created_at`
- [ ] `RoadmapBoardResponse` — `planned`, `in_progress`, `shipped` (each `list[RoadmapItemResponse]`)
- [ ] `IdeaStatusUpdate` — `status` (IdeaStatus), `note` (str | None, optional admin note to followers)

### `schemas/changelog.py`
- [ ] `ChangelogEntryCreate` — `title`, `body`, `type` (ChangelogType), `linked_idea_id` (UUID | None)
- [ ] `ChangelogEntryResponse` — `id`, `title`, `body`, `type`, `linked_idea` (IdeaResponse | None, slim nested), `published_at`
- [ ] `ChangelogListResponse` — `items`, `total`, `page`, `has_next`
- [ ] `SubscribeRequest` — `email` (EmailStr)

### `schemas/notification.py`
- [ ] `NotificationResponse` — `id`, `type` (NotificationType), `title`, `body`, `link`, `is_read`, `created_at`
- [ ] `NotificationListResponse` — `items`, `unread_count`
- [ ] `AdminDashboardResponse` — `pending_ideas_count`, `top_ideas` (list[IdeaResponse] top 5), `recent_activity` (list[ActivityItem] last 20), `total_ideas`, `total_votes`, `total_users`
- [ ] `IdeaRejectRequest` — `reason` (str | None, max 500)
- [ ] `IdeaMergeRequest` — `primary_idea_id` (UUID), `secondary_idea_ids` (list[UUID], min 1)

### `schemas/settings.py` + `schemas/webhook.py` + `schemas/apikey.py`
- [ ] `SSOTokenRequest` — `token` (str, signed JWT from host app)
- [ ] `SSOTokenClaims` (decoded) — `sub`, `email`, `name`, `plan` (str | None), `exp` (unix ts, reject if expired)
- [ ] `PortalSettingsResponse` — `portal_name`, `logo_url`, `brand_color`, `custom_domain`, `domain_verified`, `moderation_on`
- [ ] `PortalSettingsUpdate` — all fields optional; `brand_color` validated against `^#[0-9A-Fa-f]{6}$`
- [ ] `WebhookCreate` — `url` (AnyHttpUrl, https only), `events` (list[WebhookEvent]: `idea.created | idea.status_changed | idea.merged | comment.created | changelog.published`), `secret` (str | None, server generates if None)
- [ ] `WebhookResponse` — `id`, `url`, `events`, `is_active`, `secret` (shown once only), `created_at`
- [ ] `ApiKeyCreate` — `name` (min 1, max 255)
- [ ] `ApiKeyResponse` — `id`, `name`, `key_prefix`, `plaintext_key` (only on creation, None thereafter), `last_used_at`, `created_at`

---

## 🛣️ API Endpoints (44 Total)

### `routers/auth.py`
| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| POST | `/auth/register` | No | `RegisterRequest` | `TokenResponse + UserResponse` |
| POST | `/auth/login` | No | `LoginRequest` | `TokenResponse + UserResponse` |
| POST | `/auth/refresh` | No | `RefreshRequest` | `TokenResponse` |
| GET | `/auth/me` | JWT | — | `UserResponse` |
| POST | `/auth/logout` | JWT | — | `{ message }` |
| POST | `/auth/sso` | No | `SSOTokenRequest` | `TokenResponse + UserResponse` |

- [ ] `/auth/register` wired up
- [ ] `/auth/login` wired up
- [ ] `/auth/refresh` — token rotation logic (invalidate old, issue new pair)
- [ ] `/auth/me` — JWT decode dependency
- [ ] `/auth/logout` wired up
- [ ] `/auth/sso` — validates signed JWT from host app against shared secret, upserts user

### `routers/ideas.py`
| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| GET | `/ideas` | No | `?sort ?status ?category_id ?q ?page ?page_size=20` | `IdeaListResponse` |
| POST | `/ideas` | JWT | `IdeaCreate` | `IdeaResponse (201)` |
| GET | `/ideas/search` | No | `?q=string (min 2 chars)` | `list[IdeaResponse]` (top 5) |
| GET | `/ideas/{id}` | No | — | `IdeaResponse` |

- [ ] `GET /ideas` — all 4 sort modes (`votes | newest | updated | comments`) implemented
- [ ] `GET /ideas` — `status`, `category_id`, `q` filters all work independently and together
- [ ] `GET /ideas` — pagination (`page`, `page_size`) works
- [ ] `POST /ideas` — auto-follows submitter (inserts into `followers`)
- [ ] `GET /ideas/search` — returns top 5 matches (for duplicate detection)
- [ ] `GET /ideas/{id}` — `voted_by_me` computed correctly from current user context

### `routers/votes.py`
| Method | Path | Auth | Response |
|--------|------|------|----------|
| POST | `/ideas/{id}/vote` | JWT | `VoteResponse` |
| DELETE | `/ideas/{id}/vote` | JWT | `VoteResponse` |
| GET | `/ideas/{id}/vote` | JWT | `{ voted: bool }` |

- [ ] Vote toggle — inserts/deletes row in `votes`, updates `vote_count` on `ideas` atomically
- [ ] Unique constraint (`user_id + idea_id`) enforced and handled gracefully (no 500)
- [ ] `POST /ideas/{id}/vote` — auto-follows idea on first vote

### `routers/comments.py`
| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| GET | `/ideas/{id}/comments` | No | `?page=1&page_size=20` | `CommentListResponse` |
| POST | `/ideas/{id}/comments` | JWT | `CommentCreate` | `CommentResponse (201)` |
| DELETE | `/ideas/{id}/comments/{cid}` | JWT | — | `{ deleted: true }` |

- [ ] `GET /ideas/{id}/comments` — threaded by `parent_id` (top-level + nested replies)
- [ ] `POST /ideas/{id}/comments` — triggers notification fan-out to idea followers
- [ ] `DELETE` — only `author` or `admin` can delete (RBAC check)
- [ ] `comment_count` on `ideas` updated on create/delete

### `routers/categories.py`
| Method | Path | Auth | Response |
|--------|------|------|----------|
| GET | `/categories` | No | `list[CategoryResponse]` |

- [ ] Default categories seeded via Alembic or startup script

### `routers/roadmap.py`
| Method | Path | Auth | Response |
|--------|------|------|----------|
| GET | `/roadmap` | No | `RoadmapBoardResponse` |

- [ ] Items grouped into `planned | in_progress | shipped` columns
- [ ] `total_votes` computed as sum of `vote_count` from all `linked_ideas`

### `routers/admin.py` (ideas + roadmap + status)
| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| PATCH | `/admin/ideas/{id}/status` | Admin | `IdeaStatusUpdate` | `IdeaResponse` |
| GET | `/admin/ideas` | Admin | `?status=pending&page=1` | `IdeaListResponse` |
| POST | `/admin/ideas/{id}/approve` | Admin | — | `IdeaResponse` |
| POST | `/admin/ideas/{id}/reject` | Admin | `IdeaRejectRequest` | `{ rejected: true }` |
| POST | `/admin/ideas/{id}/merge` | Admin | `IdeaMergeRequest` | `IdeaResponse (primary)` |
| GET | `/admin/roadmap/{id}` | Admin | — | `RoadmapItemResponse` |
| POST | `/admin/roadmap` | Admin | `RoadmapItemCreate` | `RoadmapItemResponse (201)` |
| PATCH | `/admin/roadmap/{id}` | Admin | `RoadmapItemCreate (partial)` | `RoadmapItemResponse` |
| DELETE | `/admin/roadmap/{id}` | Admin | — | `{ deleted: true }` |
| GET | `/admin/dashboard` | Admin | — | `AdminDashboardResponse` |

- [ ] `PATCH /admin/ideas/{id}/status` — triggers notification fan-out to all followers
- [ ] `POST /admin/ideas/{id}/merge` — votes transferred to primary, secondaries soft/hard deleted
- [ ] `POST /admin/ideas/{id}/reject` — sends optional reason email if `reason` provided
- [ ] Dashboard `recent_activity` — last 20 status changes or high-vote ideas

### `routers/changelog.py`
| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| GET | `/changelog` | No | `?type ?page ?page_size=20` | `ChangelogListResponse` |
| GET | `/changelog/{id}` | No | — | `ChangelogEntryResponse` |
| POST | `/admin/changelog` | Admin | `ChangelogEntryCreate` | `ChangelogEntryResponse (201)` |
| POST | `/changelog/subscribe` | No | `SubscribeRequest` | `{ subscribed: true }` |
| DELETE | `/changelog/unsubscribe` | No | `?token=string` | `{ unsubscribed: true }` |

- [ ] `POST /admin/changelog` — notifies all `changelog_subscribers` on publish
- [ ] Unsubscribe token generated on subscribe, used for one-click unsubscribe

### `routers/notifications.py`
| Method | Path | Auth | Response |
|--------|------|------|----------|
| GET | `/notifications` | JWT | `NotificationListResponse` |
| PATCH | `/notifications/read-all` | JWT | `{ updated: int }` |
| PATCH | `/notifications/{id}/read` | JWT | `NotificationResponse` |

- [ ] `unread_count` computed correctly in list response

### `routers/sso.py`, `routers/settings.py`, `routers/webhooks.py`, `routers/apikeys.py`
| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| GET | `/admin/settings` | Admin | — | `PortalSettingsResponse` |
| PATCH | `/admin/settings` | Admin | `PortalSettingsUpdate` | `PortalSettingsResponse` |
| GET | `/admin/webhooks` | Admin | — | `list[WebhookResponse]` |
| POST | `/admin/webhooks` | Admin | `WebhookCreate` | `WebhookResponse (201)` |
| DELETE | `/admin/webhooks/{id}` | Admin | — | `{ deleted: true }` |
| GET | `/admin/apikeys` | Admin | — | `list[ApiKeyResponse]` |
| POST | `/admin/apikeys` | Admin | `ApiKeyCreate` | `ApiKeyResponse` (with `plaintext_key`) |
| DELETE | `/admin/apikeys/{id}` | Admin | — | `{ deleted: true }` |

- [ ] `portal_settings` is a singleton — GET returns the one row, PATCH upserts
- [ ] Webhook `secret` shown only on creation; masked on subsequent GETs
- [ ] API key `plaintext_key` returned only on `POST`; `None` on all reads
- [ ] `key_hash` stored as SHA-256; raw key never persisted

---

## ⚙️ Services & Cross-Cutting Concerns

### Auth & RBAC
- [ ] Password hashing with `passlib[bcrypt]`
- [ ] JWT access token — 15 min expiry
- [ ] JWT refresh token — 7 day expiry, rotation on use
- [ ] `require_role(admin | moderator | member)` dependency implemented
- [ ] RBAC applied to all `/admin/*` routes
- [ ] API key auth via `X-API-Key` header accepted alongside Bearer JWT
- [ ] SSO JWT verified against shared secret; user upserted on match

### Notification Fan-out Service
- [ ] Status change → fan-out `status_change` notifications to all `followers`
- [ ] New comment → `comment_reply` notification to parent comment author
- [ ] Idea merged → `idea_merged` notification to followers of merged ideas
- [ ] Changelog published → email/notification to `changelog_subscribers`

### Webhook Delivery Service
- [ ] Async HTTP POST on events: `idea.created`, `idea.status_changed`, `idea.merged`, `comment.created`, `changelog.published`
- [ ] HMAC signature on payload using webhook `secret`
- [ ] Delivery within 2s (async background task)
- [ ] Only fires for `is_active=True` webhooks

### Infrastructure
- [ ] `docker-compose.yml` — services: `app` (FastAPI), `db` (postgres:16), `redis`
- [ ] `docker-compose.prod.yml` — Nginx reverse proxy, gzip, SSL-ready, ports 80/443
- [ ] `alembic upgrade head` runs automatically on container start
- [ ] All 14 migrations apply cleanly on a fresh DB
- [ ] `slowapi` rate limiting applied to public endpoints
- [ ] `.env.example` documents all required env vars

---

## ✅ Final Backend Smoke Test Checklist
- [ ] All 44 endpoints return correct responses (verify via `/docs` Swagger UI)
- [ ] `POST /auth/register` → `POST /auth/login` → `GET /auth/me` → `POST /auth/refresh` → `POST /auth/logout` full flow works
- [ ] `POST /auth/sso` → widget authenticated without login screen
- [ ] Vote toggle: add (count+1) → remove (count-1), unique constraint holds
- [ ] Status change → all followers receive `notification` record in DB
- [ ] Webhook fires HTTP POST to registered URL on status change event
- [ ] `X-API-Key` header accepted on admin endpoints
- [ ] RBAC: `moderator` blocked from `/admin/settings`; `member` blocked from approve/reject
- [ ] `docker compose up` starts all services from a clean clone with no manual steps