import uuid
from datetime import datetime
from pydantic import BaseModel, Field
from app.models.idea import IdeaStatus
from app.schemas.category import CategoryResponse


class AuthorResponse(BaseModel):
    id: uuid.UUID
    name: str
    avatar_url: str | None = None

    model_config = {"from_attributes": True}


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

    model_config = {"from_attributes": True}


class IdeaListResponse(BaseModel):
    items: list[IdeaResponse]
    total: int
    page: int
    page_size: int
    has_next: bool