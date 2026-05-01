import uuid
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class PortalSettingsResponse(BaseModel):
    id: uuid.UUID
    portal_name: str
    logo_url: str | None
    brand_color: str
    custom_domain: str | None
    domain_verified: bool
    moderation_on: bool
    updated_at: datetime | None

    model_config = ConfigDict(from_attributes=True)


class PortalSettingsUpdate(BaseModel):
    portal_name: str | None = Field(None, max_length=255)
    logo_url: str | None = None
    brand_color: str | None = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")
    custom_domain: str | None = Field(None, max_length=255)
    moderation_on: bool | None = None