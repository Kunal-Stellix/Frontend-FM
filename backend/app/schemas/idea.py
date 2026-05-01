import uuid
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.models.idea import IdeaStatus


class AuthorResponse(BaseModel):
    id: uuid.UUID
    name: str
    avatar_url: str | None = None

    model_config = ConfigDict(from_attributes=True)


class CategoryResponse(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    color: str | None = None

    model_config = ConfigDict(from_attributes=True)


class IdeaCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: str | None = Field(None, max_length=5000)
    category_id: uuid.UUID | None = None


class IdeaResponse(BaseModel):
    id: uuid.UUID
    title: str
    description: str | None
    status: IdeaStatus
    author: AuthorResponse
    category: CategoryResponse | None
    vote_count: int
    comment_count: int
    voted_by_me: bool = False
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class IdeaListResponse(BaseModel):
    items: list[IdeaResponse]
    total: int
    page: int
    page_size: int
    has_next: bool


class IdeaStatusUpdate(BaseModel):
    status: IdeaStatus
    note: str | None = Field(None, max_length=500)


class IdeaRejectRequest(BaseModel):
    reason: str | None = Field(None, max_length=500)


class IdeaMergeRequest(BaseModel):
    primary_idea_id: uuid.UUID
    secondary_idea_ids: list[uuid.UUID] = Field(..., min_length=1)