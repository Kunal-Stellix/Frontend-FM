# Backend Completion Prompt — Product Feedback Platform
## Context for Claude Code

You are continuing backend development on a **Frill.io-style Product Feedback Platform** built with:
- **FastAPI** + **Pydantic v2** + **SQLAlchemy 2.0 (async)** + **PostgreSQL** + **Redis**
- **Alembic** for migrations
- **JWT** for auth (access + refresh tokens)
- **passlib[bcrypt]** for password hashing
- Docker + docker-compose

Repository branch: `dev`
Backend root: `backend/`
App root: `backend/app/`

---

## WHAT HAS ALREADY BEEN IMPLEMENTED

### Infrastructure & Core
- `pyproject.toml` (Poetry), `Dockerfile`, `docker-compose.yml`, `wait_for_db.py`
- `app/core/config.py` — Pydantic Settings with env vars
- `app/core/database.py` — SQLAlchemy 2.0 async engine + AsyncSessionLocal
- `app/core/redis.py` — async Redis init/close
- `app/core/security.py` — JWT creation/verification, bcrypt hashing
- `app/core/dependencies.py` — get_db, get_current_user dependencies
- `app/main.py` — FastAPI app, CORS, lifespan, all routers registered
- `alembic/` — migrations configured for async

### Models (SQLAlchemy)
- `app/models/user.py` — User (id UUID PK, email UNIQUE, name, hashed_password, role ENUM[admin|moderator|member], avatar_url, is_active, created_at, updated_at)
- `app/models/category.py` — Category (id, name UNIQUE, slug UNIQUE, color, created_at)
- `app/models/idea.py` — Idea (id, title, description, status ENUM[under_review|planned|in_progress|shipped|declined], author_id FK->users, category_id FK->categories, vote_count INT, comment_count INT, is_public BOOL, created_at, updated_at)
- `app/models/vote.py` — Vote (id, user_id FK->users CASCADE, idea_id FK->ideas CASCADE, created_at; UniqueConstraint user_id+idea_id)
- `app/models/follower.py` — Follower (user_id FK->users CASCADE, idea_id FK->ideas CASCADE; composite PK)
- `app/models/comment.py` — Comment (id, idea_id FK->ideas CASCADE, author_id FK->users SET NULL, parent_id FK->comments CASCADE nullable, body TEXT, created_at, updated_at)
- `app/models/__init__.py` — exports all models

### Schemas (Pydantic v2)
- `app/schemas/user.py` — RegisterRequest, LoginRequest, TokenResponse, UserResponse, RefreshRequest
- `app/schemas/idea.py` — IdeaCreate, IdeaResponse, IdeaListResponse
- `app/schemas/vote.py` — VoteResponse
- `app/schemas/category.py` — CategoryResponse
- `app/schemas/comment.py` — CommentCreate, CommentResponse, CommentListResponse

### Services
- `app/services/auth_service.py` — register, login, refresh, logout (Redis token blacklist)
- `app/services/categories.py` — seed_default_categories
- `app/services/ideas.py` — list ideas (sort/filter/search/paginate), create idea, get idea, search ideas
- `app/services/votes.py` — toggle vote, get vote status
- `app/services/comment_service.py` — create comment, list comments (threaded by parent_id), delete comment

### API Routes (all under /api/v1)
- `app/api/v1/routes/auth.py` — POST /auth/register, POST /auth/login, POST /auth/refresh, GET /auth/me, POST /auth/logout
- `app/api/v1/routes/categories.py` — GET /categories
- `app/api/v1/routes/ideas.py` — GET /ideas, POST /ideas, GET /ideas/search, GET /ideas/{id}
- `app/api/v1/routes/votes.py` — POST /ideas/{id}/vote, DELETE /ideas/{id}/vote, GET /ideas/{id}/vote
- `app/api/v1/routes/comments.py` — GET /ideas/{id}/comments, POST /ideas/{id}/comments, DELETE /ideas/{id}/comments/{comment_id}

### Repositories
- `app/repositories/user_repository.py` — get_by_email, get_by_id, create_user

---

## WHAT NEEDS TO BE BUILT

---

## PHASE 1 — Roadmap (Day 3 Remainder)

### 1.1 New DB Models — `app/models/roadmap.py`

**RoadmapItem**
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID (PK) | default=uuid4() |
| title | VARCHAR(255) | NOT NULL |
| description | TEXT | nullable |
| status | ENUM | planned, in_progress, shipped |
| sort_order | INTEGER | default=0 |
| created_at | TIMESTAMPTZ | server_default=now() |
| updated_at | TIMESTAMPTZ | onupdate=now() |

**RoadmapIdeaLink** (junction)
| Field | Type | Constraints |
|-------|------|-------------|
| roadmap_item_id | UUID (FK->roadmap_items ON DELETE CASCADE) | composite PK |
| idea_id | UUID (FK->ideas ON DELETE CASCADE) | composite PK |

Add both to `app/models/__init__.py`.

### 1.2 Alembic Migration
Generate and apply migration for `roadmap_items` and `roadmap_idea_links` tables.

### 1.3 Schemas — `app/schemas/roadmap.py`
- `RoadmapStatus` enum: planned, in_progress, shipped
- `RoadmapItemCreate`: title (min 1, max 255), description (max 2000, optional), status: RoadmapStatus, idea_ids: list[UUID] (can be empty)
- `RoadmapItemUpdate`: all fields optional (partial update)
- `RoadmapItemResponse`: id, title, description, status, linked_ideas: list[IdeaResponse] (slim: id, title, vote_count, status), total_votes: int (sum of vote_count across linked ideas), sort_order, created_at
- `RoadmapBoardResponse`: planned: list[RoadmapItemResponse], in_progress: list[RoadmapItemResponse], shipped: list[RoadmapItemResponse]

### 1.4 Service — `app/services/roadmap_service.py`
- `get_roadmap_board(db)` -> RoadmapBoardResponse
- `create_roadmap_item(db, data: RoadmapItemCreate)` -> RoadmapItem (validate idea_ids exist, create links)
- `update_roadmap_item(db, item_id: UUID, data: RoadmapItemUpdate)` -> RoadmapItem (replace links atomically)
- `delete_roadmap_item(db, item_id: UUID)` -> bool
- `get_roadmap_item(db, item_id: UUID)` -> RoadmapItem | None

### 1.5 Admin Idea Status Service — `app/services/admin_service.py`
- `update_idea_status(db, idea_id, status, note)` -> Idea (triggers notification fan-out to followers)
- `approve_idea(db, idea_id)` -> set is_public=True
- `reject_idea(db, idea_id, reason)` -> set is_public=False
- `merge_ideas(db, primary_id, secondary_ids)` -> Idea
  - Transfer all votes and followers from secondaries to primary
  - Delete secondary idea records
  - Recalculate primary vote_count

### 1.6 Schema additions — `app/schemas/idea.py`
- `IdeaStatusUpdate`: status: IdeaStatus, note: str | None (max 500)
- `IdeaRejectRequest`: reason: str | None (max 500)
- `IdeaMergeRequest`: primary_idea_id: UUID, secondary_idea_ids: list[UUID] (min 1 item)

### 1.7 Routes

**`app/api/v1/routes/roadmap.py`**
GET /roadmap -> RoadmapBoardResponse (public)
GET /admin/roadmap/{id} -> RoadmapItemResponse (admin)
POST /admin/roadmap -> RoadmapItemResponse 201 (admin)
PATCH /admin/roadmap/{id} -> RoadmapItemResponse (admin)
DELETE /admin/roadmap/{id} -> { "deleted": true } (admin)

text

**`app/api/v1/routes/admin.py`**
PATCH /admin/ideas/{id}/status -> IdeaResponse (admin)
GET /admin/ideas -> IdeaListResponse (admin)
POST /admin/ideas/{id}/approve -> IdeaResponse (admin)
POST /admin/ideas/{id}/reject -> { "rejected": true } (admin)
POST /admin/ideas/{id}/merge -> IdeaResponse (primary) (admin)

text

Register both in `app/main.py`.

---

## PHASE 2 — Changelog (Day 4 Part A)

### 2.1 New DB Models — `app/models/changelog.py`

**ChangelogEntry**
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID (PK) | |
| title | VARCHAR(255) | NOT NULL |
| body | TEXT | markdown |
| type | ENUM | new_feature, improvement, bug_fix |
| linked_idea_id | UUID (FK->ideas) | nullable, ON DELETE SET NULL |
| created_by | UUID (FK->users) | NOT NULL |
| published_at | TIMESTAMPTZ | server_default=now() |

**ChangelogSubscriber**
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID (PK) | |
| email | VARCHAR(255) | UNIQUE NOT NULL |
| unsubscribe_token | VARCHAR(64) | UNIQUE NOT NULL, generated on creation |
| created_at | TIMESTAMPTZ | |

### 2.2 Alembic Migration for changelog tables.

### 2.3 Schemas — `app/schemas/changelog.py`
- `ChangelogType` enum: new_feature, improvement, bug_fix
- `ChangelogEntryCreate`: title, body, type: ChangelogType, linked_idea_id: UUID | None
- `ChangelogEntryResponse`: id, title, body, type, linked_idea (slim IdeaResponse or None), published_at
- `ChangelogListResponse`: items, total, page, has_next
- `SubscribeRequest`: email: EmailStr

### 2.4 Service — `app/services/changelog_service.py`
- `list_changelog(db, type_filter, page, page_size)` -> ChangelogListResponse
- `get_changelog_entry(db, entry_id)` -> ChangelogEntry | None
- `create_changelog_entry(db, data, author_id)` -> ChangelogEntry
- `subscribe_changelog(db, email)` -> upsert subscriber with unique token
- `unsubscribe_changelog(db, token)` -> delete by token, 404 if not found

### 2.5 Routes — `app/api/v1/routes/changelog.py`
GET /changelog -> ChangelogListResponse (public, ?type ?page)
GET /changelog/{id} -> ChangelogEntryResponse (public)
POST /changelog/subscribe -> { "subscribed": true } (public)
DELETE /changelog/unsubscribe -> { "unsubscribed": true } (public, ?token=)
POST /admin/changelog -> ChangelogEntryResponse 201 (admin)

text

---

## PHASE 3 — Notifications (Day 4 Part B)

### 3.1 New DB Model — `app/models/notification.py`

**Notification**
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID (PK) | |
| user_id | UUID (FK->users ON DELETE CASCADE) | NOT NULL |
| type | ENUM | status_change, comment_reply, idea_merged, changelog_published |
| title | VARCHAR(255) | NOT NULL |
| body | TEXT | NOT NULL |
| link | TEXT | relative URL |
| is_read | BOOLEAN | default=False |
| created_at | TIMESTAMPTZ | |

### 3.2 Alembic Migration for notifications.

### 3.3 Schemas — `app/schemas/notification.py`
- `NotificationType` enum: status_change, comment_reply, idea_merged, changelog_published
- `NotificationResponse`: id, type, title, body, link, is_read, created_at
- `NotificationListResponse`: items: list[NotificationResponse], unread_count: int

### 3.4 Service — `app/services/notification_service.py`
- `create_notification(db, user_id, type, title, body, link)` -> Notification
- `fan_out_to_followers(db, idea_id, type, title, body, link)` -> creates Notification for every follower
- `get_user_notifications(db, user_id, page, page_size)` -> NotificationListResponse (unread first)
- `mark_all_read(db, user_id)` -> int
- `mark_single_read(db, notification_id, user_id)` -> Notification

**Call fan_out_to_followers from:**
- `admin_service.update_idea_status()` -> type=status_change
- `comment_service.create_comment()` -> if reply, notify parent comment author -> type=comment_reply
- `admin_service.merge_ideas()` -> notify followers of merged ideas -> type=idea_merged
- `changelog_service.create_changelog_entry()` -> notify users whose email matches a subscriber -> type=changelog_published

### 3.5 Routes — `app/api/v1/routes/notifications.py`
GET /notifications -> NotificationListResponse (auth)
PATCH /notifications/read-all -> { "updated": int } (auth)
PATCH /notifications/{id}/read -> NotificationResponse (auth)

text

---

## PHASE 4 — Admin Dashboard (Day 4 Part C)

### 4.1 Schemas — `app/schemas/admin.py`
- `ActivityItem`: type: str, message: str, created_at: datetime
- `AdminDashboardResponse`: pending_ideas_count, top_ideas (list[IdeaResponse] top 5 by votes), recent_activity (list[ActivityItem] last 20), total_ideas, total_votes, total_users

### 4.2 Add `get_admin_dashboard(db)` to `app/services/admin_service.py`

### 4.3 Route — add to `app/api/v1/routes/admin.py`
GET /admin/dashboard -> AdminDashboardResponse (admin)

text

---

## PHASE 5 — RBAC Middleware (Day 5 Part A)

### Update `app/core/dependencies.py`
```python
def require_role(*roles: str):
    async def checker(current_user = Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return checker

require_admin = require_role("admin")
require_moderator_or_admin = require_role("admin", "moderator")
```

Apply:
- All `/admin/*` routes -> `require_admin`
- Idea approve/reject -> `require_moderator_or_admin`
- Settings/webhooks/apikeys -> `require_admin` only

---

## PHASE 6 — JWT SSO (Day 5 Part B)

### Schema additions — `app/schemas/user.py`
- `SSOTokenRequest`: token: str
- `SSOTokenClaims`: sub, email, name, plan: str | None, exp: int

### Add `sso_authenticate(db, token)` to `app/services/auth_service.py`
- Verify JWT using SSO_SECRET from settings
- Upsert user by email (create with role=member if new)
- Return TokenResponse + UserResponse
- Raise 401 if expired or invalid

### Route addition — `app/api/v1/routes/auth.py`
POST /auth/sso -> TokenResponse + UserResponse (public)

text

Add `SSO_SECRET` to `app/core/config.py` and `.env.example`.

---

## PHASE 7 — Portal Settings (Day 5 Part C)

### Model — `app/models/portal_settings.py`
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID (PK) | singleton |
| portal_name | VARCHAR(255) | default='Feedback' |
| logo_url | TEXT | nullable |
| brand_color | VARCHAR(7) | hex, default='#2980B9' |
| custom_domain | VARCHAR(255) | nullable |
| domain_verified | BOOLEAN | default=False |
| moderation_on | BOOLEAN | default=False |
| updated_at | TIMESTAMPTZ | onupdate=now() |

### Schemas — `app/schemas/settings.py`
- `PortalSettingsResponse`: all fields
- `PortalSettingsUpdate`: all optional; brand_color must match `^#[0-9A-Fa-f]{6}$`

### Service — `app/services/settings_service.py`
- `get_settings(db)` -> PortalSettings (create with defaults if not exists)
- `update_settings(db, data)` -> PortalSettings

### Routes — `app/api/v1/routes/admin_settings.py`
GET /admin/settings -> PortalSettingsResponse (admin)
PATCH /admin/settings -> PortalSettingsResponse (admin)

text

---

## PHASE 8 — Webhooks (Day 5 Part D)

### Model — `app/models/webhook.py`
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID (PK) | |
| url | TEXT | NOT NULL, https:// only |
| secret | VARCHAR(64) | HMAC signing secret |
| events | ARRAY[TEXT] | list of subscribed events |
| is_active | BOOLEAN | default=True |
| created_at | TIMESTAMPTZ | |

### Schemas — `app/schemas/webhook.py`
- `WebhookEvent` enum: idea.created, idea.status_changed, idea.merged, comment.created, changelog.published
- `WebhookCreate`: url (https required), events: list[WebhookEvent] (min 1), secret: str | None
- `WebhookResponse`: id, url, events, is_active, secret (only on creation, None on reads), created_at

### Service — `app/services/webhook_service.py`
- `list_webhooks(db)` -> list[Webhook]
- `create_webhook(db, data)` -> Webhook (auto-generate secret with secrets.token_hex(32) if not provided)
- `delete_webhook(db, webhook_id)` -> bool
- `dispatch_event(db, event, payload)` -> fire-and-forget background task
  - HTTP POST with JSON payload + HMAC-SHA256 in X-Webhook-Signature header
  - 5s timeout, log failure silently, never raise

**Call dispatch_event from:** approve_idea, update_idea_status, merge_ideas, create_comment, create_changelog_entry

### Routes — `app/api/v1/routes/webhooks.py`
GET /admin/webhooks -> list[WebhookResponse] (admin)
POST /admin/webhooks -> WebhookResponse 201 (admin)
DELETE /admin/webhooks/{id} -> { "deleted": true } (admin)

text

---

## PHASE 9 — API Keys (Day 5 Part E)

### Model — `app/models/api_key.py`
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID (PK) | |
| name | VARCHAR(255) | NOT NULL |
| key_hash | VARCHAR(255) | SHA-256 of plaintext |
| key_prefix | VARCHAR(8) | first 8 chars |
| created_by | UUID (FK->users) | NOT NULL |
| last_used_at | TIMESTAMPTZ | nullable |
| is_active | BOOLEAN | default=True |
| created_at | TIMESTAMPTZ | |

### Schemas — `app/schemas/apikey.py`
- `ApiKeyCreate`: name: str (min 1, max 255)
- `ApiKeyResponse`: id, name, key_prefix, plaintext_key: str | None (only on creation), last_used_at, created_at

### Service — `app/services/apikey_service.py`
- `list_api_keys(db, user_id)` -> list[ApiKey]
- `create_api_key(db, name, user_id)` -> tuple[ApiKey, plaintext_key]
  - Generate `sk_` + secrets.token_urlsafe(32), store SHA-256 hash only
- `delete_api_key(db, key_id, user_id)` -> bool
- `verify_api_key(db, raw_key)` -> User | None (hash input, lookup, update last_used_at)

### Update `app/core/dependencies.py`
Add `get_current_user_or_api_key`:
- Try Bearer JWT first
- Else try X-API-Key header -> verify_api_key
- Raise 401 if neither valid
Replace get_current_user with this on admin routes.

### Routes — `app/api/v1/routes/apikeys.py`
GET /admin/apikeys -> list[ApiKeyResponse] (admin)
POST /admin/apikeys -> ApiKeyResponse 201 (admin)
DELETE /admin/apikeys/{id} -> { "deleted": true } (admin)

text

---

## PHASE 10 — Rate Limiting (Day 5 Part F)

Add `slowapi` to `pyproject.toml`.

Configure in `app/main.py`:
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
```

Apply limits:
- POST /auth/register — 10/minute
- POST /auth/login — 10/minute
- POST /auth/sso — 20/minute
- GET /ideas — 60/minute
- POST /changelog/subscribe — 5/minute

---

## PHASE 11 — Production Docker (Day 5 Part G)

### `backend/docker-compose.prod.yml`
- Services: api, db (postgres:16), redis, nginx
- API: `uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2`
- No code volume mounts; env_file: .env

### `backend/nginx.conf`
- Port 80 -> api:8000 reverse proxy
- Gzip enabled
- Commented-out HTTPS block as placeholder

---

## PHASE 12 — Full Test Suite

**Zero tests exist. Build complete coverage.**

### `backend/tests/conftest.py`
- Async test DB (in-memory SQLite or separate Postgres)
- `async_session` fixture — fresh DB per test (create_all/drop_all)
- `async_client` fixture — httpx.AsyncClient with overridden get_db
- `test_user` fixture — returns (user_dict, token)
- `test_admin` fixture — user with role=admin, returns (user_dict, token)
- `auth_headers(token)` helper

Add to `pyproject.toml`:
```toml
[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
```

---

### AUTH TESTS — `tests/test_auth.py`
Happy paths:
- Register -> 201, tokens returned
- Login with correct credentials -> 200
- GET /auth/me with valid token -> 200
- Refresh with valid refresh_token -> 200, new pair
- Logout -> 200

Edge cases:
- Duplicate email register -> 409
- Password < 8 chars -> 422
- Invalid email format -> 422
- Empty name -> 422
- Wrong password login -> 401
- Non-existent email login -> 401
- /auth/me no token -> 401
- /auth/me malformed token -> 401
- /auth/me expired token -> 401
- Refresh with access token (not refresh) -> 401
- Refresh after logout (blacklisted) -> 401
- Double logout -> idempotent

---

### IDEAS TESTS — `tests/test_ideas.py`
Happy paths:
- GET /ideas (no auth) -> 200 + pagination
- POST /ideas -> 201, auto-creates follower for submitter
- GET /ideas/{id} -> voted_by_me=False
- GET /ideas/search?q=test -> max 5 results
- Sort by votes, newest, updated, comments
- Filter by status, category_id, q
- Pagination page/page_size

Edge cases:
- POST no auth -> 401
- Title < 3 or > 255 chars -> 422
- Description > 5000 chars -> 422
- Non-existent category_id -> 404
- Invalid UUID in path -> 422
- Non-existent idea -> 404
- search q < 2 chars -> 422
- page=0 -> 422
- voted_by_me=True when user has voted

---

### VOTE TESTS — `tests/test_votes.py`
Happy paths:
- POST vote -> voted=True, vote_count=1
- POST vote again (toggle) -> voted=False, vote_count=0
- DELETE vote -> decremented
- GET vote status before/after
- Auto-creates follower on first vote

Edge cases:
- Vote on non-existent idea -> 404
- GET vote no auth -> 401
- DELETE when not voted -> define and test behavior
- Concurrent double-vote -> unique constraint prevents duplicate
- vote_count never negative
- vote_count consistent with actual Vote rows

---

### COMMENT TESTS — `tests/test_comments.py`
Happy paths:
- GET comments no auth -> 200
- POST comment -> 201
- POST reply with parent_id -> nested under parent
- DELETE by author -> 200
- DELETE by admin -> 200
- comment_count increments/decrements

Edge cases:
- POST no auth -> 401
- Empty body -> 422
- Body > 2000 chars -> 422
- GET on non-existent idea -> 404
- DELETE by non-author non-admin -> 403
- DELETE non-existent -> 404
- Reply with parent_id from different idea -> 400
- 3rd-level nesting: only 2 levels in response

---

### ROADMAP TESTS — `tests/test_roadmap.py`
Happy paths:
- GET /roadmap -> 3-column board
- POST /admin/roadmap -> 201
- With idea_ids -> linked_ideas populated, total_votes correct
- GET /admin/roadmap/{id} -> 200
- PATCH -> links replaced atomically
- DELETE -> 200

Edge cases:
- Non-admin POST -> 403
- Non-existent idea_id in list -> 404
- PATCH with empty idea_ids -> clears all links
- GET non-existent -> 404
- DELETE cascades roadmap_idea_links

---

### ADMIN TESTS — `tests/test_admin.py`
Happy paths:
- PATCH status -> updated
- GET /admin/ideas -> un-approved list
- Approve -> is_public=True
- Reject -> is_public=False
- Merge -> votes transferred, secondaries deleted
- GET dashboard -> stats correct

Edge cases:
- All admin routes with member token -> 403
- All admin routes no token -> 401
- Invalid status value -> 422
- primary_id in secondary_ids -> 400
- Non-existent secondary -> 404
- Status change triggers Notification per follower
- After merge: no duplicate votes

---

### CHANGELOG TESTS — `tests/test_changelog.py`
Happy paths:
- GET /changelog -> paginated
- GET /changelog/{id} -> 200
- POST /admin/changelog -> 201
- Subscribe new email -> subscribed
- Subscribe duplicate email -> idempotent 200
- Unsubscribe valid token -> unsubscribed
- Filter by type

Edge cases:
- Non-admin POST -> 403
- Non-existent entry -> 404
- Invalid unsubscribe token -> 404
- Invalid email subscribe -> 422
- Invalid type filter -> 422

---

### NOTIFICATION TESTS — `tests/test_notifications.py`
Happy paths:
- GET /notifications -> unread_count correct
- PATCH read-all -> updated count
- PATCH single read -> is_read=True
- Status change creates notification for all followers
- Reply creates notification for parent comment author

Edge cases:
- No auth -> 401
- Read notification of another user -> 403
- Read non-existent -> 404
- Already-read -> idempotent 200

---

### RBAC TESTS — `tests/test_rbac.py`
- Member token on any /admin/* -> 403
- Moderator can approve/reject but NOT settings/webhooks/apikeys -> 403
- Admin can access all
- No token -> 401
- X-API-Key valid -> 200
- X-API-Key invalid -> 401

---

### WEBHOOK TESTS — `tests/test_webhooks.py`
Happy paths:
- POST -> 201, secret in response
- GET list -> secret=null
- DELETE -> deleted
- Status change dispatches POST to webhook (mock httpx)

Edge cases:
- http:// URL -> 422
- Empty events -> 422
- Delete non-existent -> 404
- Delivery failure -> logged, API still 200
- Dispatch non-blocking (API responds before delivery)

---

### API KEY TESTS — `tests/test_apikeys.py`
Happy paths:
- POST -> 201, plaintext_key present
- GET list -> plaintext_key=null
- DELETE -> deleted
- X-API-Key header with plaintext -> 200 on protected route

Edge cases:
- Non-admin POST -> 403
- Invalid X-API-Key -> 401
- Deactivated key -> 401
- Delete non-existent -> 404
- Plaintext not in DB, only hash
- last_used_at updated on use

---

## Files To Create / Update
backend/
app/
models/
roadmap.py NEW
changelog.py NEW
notification.py NEW
portal_settings.py NEW
webhook.py NEW
api_key.py NEW
__init__.py UPDATE
schemas/
roadmap.py NEW
changelog.py NEW
notification.py NEW
admin.py NEW
settings.py NEW
webhook.py NEW
apikey.py NEW
idea.py UPDATE
user.py UPDATE
services/
roadmap_service.py NEW
admin_service.py NEW
changelog_service.py NEW
notification_service.py NEW
settings_service.py NEW
webhook_service.py NEW
apikey_service.py NEW
comment_service.py UPDATE
api/v1/routes/
roadmap.py NEW
admin.py NEW
changelog.py NEW
notifications.py NEW
admin_settings.py NEW
webhooks.py NEW
apikeys.py NEW
auth.py UPDATE
core/
dependencies.py UPDATE
config.py UPDATE
main.py UPDATE
alembic/versions/
xxxx_add_roadmap_tables.py NEW
xxxx_add_changelog_tables.py NEW
xxxx_add_notifications.py NEW
xxxx_add_day5_tables.py NEW
tests/
conftest.py NEW
test_auth.py NEW
test_ideas.py NEW
test_votes.py NEW
test_comments.py NEW
test_roadmap.py NEW
test_admin.py NEW
test_changelog.py NEW
test_notifications.py NEW
test_rbac.py NEW
test_webhooks.py NEW
test_apikeys.py NEW
docker-compose.prod.yml NEW
nginx.conf NEW

text

---

## Implementation Rules for Claude Code

1. Async everywhere — all DB ops use `await` with `AsyncSession`
2. Pydantic v2 — use `model_config = ConfigDict(from_attributes=True)`
3. UUID PKs — use `uuid.uuid4()` as default
4. No raw SQL — use SQLAlchemy ORM with `select()`, `update()`, `delete()`
5. HTTP exceptions — always `HTTPException` with correct status codes
6. Alembic migrations — every new model needs a migration
7. Denormalized counters — vote_count and comment_count updated atomically in same transaction
8. Tests use separate DB — override get_db in conftest.py
9. Test isolation — each test independent; rollback after each
10. Webhook dispatch is non-blocking — API returns before delivery
11. API key plaintext never stored — SHA-256 hash only; plaintext returned once on creation
12. Token blacklist — logout adds refresh token to Redis with matching TTL

---

## .env.example additions
SSO_SECRET=your_sso_shared_secret_here