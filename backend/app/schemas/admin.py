import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class ActivityItem(BaseModel):
    type: str
    message: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AdminDashboardResponse(BaseModel):
    pending_ideas_count: int
    top_ideas: list["IdeaSlimForAdmin"]
    recent_activity: list[ActivityItem]
    total_ideas: int
    total_votes: int
    total_users: int


class IdeaSlimForAdmin(BaseModel):
    id: uuid.UUID
    title: str
    vote_count: int
    status: str

    model_config = ConfigDict(from_attributes=True)