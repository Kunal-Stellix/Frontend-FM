from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field



class CommentCreate(BaseModel):
    body: str = Field(..., min_length=1, max_length=2000)
    parent_id: UUID | None = None


class CommentAuthorResponse(BaseModel):
    id: UUID
    name: str
    avatar_url: str | None = None
    role: str

    model_config = {"from_attributes": True}


class CommentResponse(BaseModel):
    id: UUID
    body: str
    author: CommentAuthorResponse | None = None
    parent_id: UUID | None = None
    replies: list["CommentResponse"] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CommentListResponse(BaseModel):
    items: list[CommentResponse]
    total: int
    page: int
    has_next: bool


CommentResponse.model_rebuild()