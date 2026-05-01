# API Payloads for Swagger UI Testing
Base URL: `http://localhost:8000/api/v1`

---

## Auth

### POST /auth/register
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### POST /auth/login
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
**Copy `tokens.access_token` from response — use as Bearer token for all protected routes**

### POST /auth/refresh
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### GET /auth/me
- **Auth:** Bearer token (from login response)
- No body

### POST /auth/logout
- **Auth:** Bearer token
- No body

### POST /auth/sso
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Categories

### GET /categories
- **Auth:** None
- No body

---

## Ideas

### GET /ideas
- **Auth:** Optional Bearer
- Query params: `sort=newest|votes|updated|comments`, `status=under_review|planned|in_progress|shipped|declined`, `category_id=uuid`, `q=search text`, `page=1`, `page_size=20`

### POST /ideas
- **Auth:** Bearer
```json
{
  "title": "Dark Mode Support",
  "description": "Please add a dark mode option to the dashboard.",
  "category_id": "uuid-here"
}
```

### GET /ideas/search
- **Auth:** Optional Bearer
- Query: `q=minimum 2 characters`

### GET /ideas/{idea_id}
- **Auth:** Optional Bearer
- Path: `idea_id` = UUID

---

## Votes

### POST /ideas/{idea_id}/vote
- **Auth:** Bearer
- Path: `idea_id` = UUID
- No body

### GET /ideas/{idea_id}/vote
- **Auth:** Bearer
- Path: `idea_id` = UUID

### DELETE /ideas/{idea_id}/vote
- **Auth:** Bearer
- Path: `idea_id` = UUID

---

## Comments

### GET /ideas/{idea_id}/comments
- **Auth:** None
- Query: `page=1`, `page_size=20`

### POST /ideas/{idea_id}/comments
- **Auth:** Bearer
```json
{
  "body": "This is a great idea!",
  "parent_id": null
}
```
`parent_id` is optional — omit for top-level comment, set to comment UUID for replies.

### DELETE /ideas/{idea_id}/comments/{comment_id}
- **Auth:** Bearer (author or admin only)
- Path: `idea_id`, `comment_id`

---

## Roadmap

### GET /roadmap
- **Auth:** None
- No body

---

## Changelog

### GET /changelog
- **Auth:** None
- Query: `type=new_feature|improvement|bug_fix`, `page=1`, `page_size=20`

### GET /changelog/{entry_id}
- **Auth:** None

### POST /changelog/subscribe
- **Auth:** None
```json
{
  "email": "user@example.com"
}
```

### DELETE /changelog/unsubscribe
- **Auth:** None
- Query: `token=unsubscribe-token-string`

### POST /admin/changelog
- **Auth:** Bearer (admin only)
```json
{
  "title": "New Feature Released",
  "body": "We have added dark mode support.",
  "type": "new_feature",
  "linked_idea_id": "uuid-here-or-null"
}
```

---

## Notifications

### GET /notifications
- **Auth:** Bearer
- Query: `page=1`, `page_size=20`

### PATCH /notifications/read-all
- **Auth:** Bearer

### PATCH /notifications/{notification_id}/read
- **Auth:** Bearer
- Path: `notification_id` = UUID

---

## Admin Settings

### GET /admin/settings
- **Auth:** Bearer (admin only)

### PATCH /admin/settings
- **Auth:** Bearer (admin only)
```json
{
  "portal_name": "My Feedback Hub",
  "logo_url": "https://example.com/logo.png",
  "brand_color": "#FF5733",
  "custom_domain": "feedback.example.com",
  "moderation_on": true
}
```

---

## Webhooks (admin)

### GET /admin/webhooks
- **Auth:** Bearer (admin only)

### POST /admin/webhooks
- **Auth:** Bearer (admin only)
```json
{
  "url": "https://example.com/webhook",
  "events": ["idea.created", "idea.status_changed", "idea.merged", "comment.created", "changelog.published"],
  "secret": "optional-secret-will-be-generated"
}
```

### DELETE /admin/webhooks/{webhook_id}
- **Auth:** Bearer (admin only)
- Path: `webhook_id` = UUID

---

## API Keys (admin)

### GET /admin/apikeys
- **Auth:** Bearer (admin only)

### POST /admin/apikeys
- **Auth:** Bearer (admin only)
```json
{
  "name": "My API Key"
}
```
**Response includes `plaintext_key` — shown only once, save it!**

### DELETE /admin/apikeys/{key_id}
- **Auth:** Bearer (admin only)
- Path: `key_id` = UUID

---

## Admin Ideas

### GET /admin/ideas
- **Auth:** Bearer (admin only)
- Query: `status=under_review|planned|in_progress|shipped|declined`, `page=1`

### PATCH /admin/ideas/{idea_id}/status
- **Auth:** Bearer (moderator or admin)
```json
{
  "status": "planned",
  "note": "We are planning this for Q3"
}
```

### POST /admin/ideas/{idea_id}/approve
- **Auth:** Bearer (moderator or admin)

### POST /admin/ideas/{idea_id}/reject
- **Auth:** Bearer (moderator or admin)
```json
{
  "reason": "Already exists in our roadmap"
}
```

### POST /admin/ideas/{idea_id}/merge
- **Auth:** Bearer (moderator or admin)
```json
{
  "primary_idea_id": "uuid-of-primary",
  "secondary_idea_ids": ["uuid-1", "uuid-2"]
}
```

---

## Admin Roadmap

### GET /admin/roadmap/{item_id}
- **Auth:** Bearer (admin only)

### POST /admin/roadmap
- **Auth:** Bearer (admin only)
```json
{
  "title": "Q3 Roadmap",
  "description": "Planned features for Q3",
  "status": "planned",
  "idea_ids": ["uuid-of-idea-1", "uuid-of-idea-2"]
}
```

### PATCH /admin/roadmap/{item_id}
- **Auth:** Bearer (admin only)
```json
{
  "title": "Updated title",
  "status": "in_progress",
  "idea_ids": ["uuid-of-idea"]
}
```

### DELETE /admin/roadmap/{item_id}
- **Auth:** Bearer (admin only)

---

## Admin Dashboard

### GET /admin/dashboard
- **Auth:** Bearer (admin only)

---

# Using Bearer Token in Swagger

1. Click **Authorize** button (green lock icon) at top of Swagger UI
2. Enter: `Bearer your-access-token-here`
3. Click **Authorize**, then **Close**
4. All protected endpoints now use your token automatically
