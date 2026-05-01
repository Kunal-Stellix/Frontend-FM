import uuid
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.models.roadmap import RoadmapStatus


class IdeaSlim(BaseModel):
    id: uuid.UUID
    title: str
    vote_count: int
    status: "str"  # IdeaStatus as string

    model_config = ConfigDict(from_attributes=True)


class RoadmapItemCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str | None = Field(None, max_length=2000)
    status: RoadmapStatus = RoadmapStatus.planned
    idea_ids: list[uuid.UUID] = []


class RoadmapItemUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = Field(None, max_length=2000)
    status: RoadmapStatus | None = None
    idea_ids: list[uuid.UUID] | None = None


class RoadmapItemResponse(BaseModel):
    id: uuid.UUID
    title: str
    description: str | None
    status: RoadmapStatus
    linked_ideas: list[IdeaSlim] = []
    total_votes: int = 0
    sort_order: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RoadmapBoardResponse(BaseModel):
    planned: list[RoadmapItemResponse] = []
    in_progress: list[RoadmapItemResponse] = []
    shipped: list[RoadmapItemResponse] = []


# Avoid forward reference issues
IdeaSlim.model_rebuild()