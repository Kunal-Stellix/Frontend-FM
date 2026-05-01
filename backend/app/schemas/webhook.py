import uuid
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field, ConfigDict, HttpUrl


class WebhookEvent(str, Enum):
    idea_created = "idea.created"
    idea_status_changed = "idea.status_changed"
    idea_merged = "idea.merged"
    comment_created = "comment.created"
    changelog_published = "changelog.published"


class WebhookCreate(BaseModel):
    url: HttpUrl
    events: list[WebhookEvent] = Field(..., min_length=1)
    secret: str | None = None


class WebhookResponse(BaseModel):
    id: uuid.UUID
    url: str
    events: list[str]
    is_active: bool
    secret: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)