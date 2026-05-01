import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from app.models.changelog import ChangelogType


class IdeaSlim(BaseModel):
    id: uuid.UUID
    title: str
    vote_count: int
    status: str

    model_config = ConfigDict(from_attributes=True)


class ChangelogEntryCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    body: str | None = Field(None, max_length=10000)
    type: ChangelogType
    linked_idea_id: uuid.UUID | None = None


class ChangelogEntryResponse(BaseModel):
    id: uuid.UUID
    title: str
    body: str | None
    type: ChangelogType
    linked_idea: IdeaSlim | None = None
    published_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ChangelogListResponse(BaseModel):
    items: list[ChangelogEntryResponse]
    total: int
    page: int
    has_next: bool


class SubscribeRequest(BaseModel):
    email: EmailStr