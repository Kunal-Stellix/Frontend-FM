import uuid
from datetime import datetime
from pydantic import BaseModel


class CategoryResponse(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    color: str
    created_at: datetime

    model_config = {"from_attributes": True}