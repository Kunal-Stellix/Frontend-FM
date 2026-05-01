import uuid
from datetime import datetime, timezone
from enum import Enum
from sqlalchemy import String, Text, Boolean, DateTime, func, text, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import ARRAY
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class WebhookEvent(str, Enum):
    idea_created = "idea.created"
    idea_status_changed = "idea.status_changed"
    idea_merged = "idea.merged"
    comment_created = "comment.created"
    changelog_published = "changelog.published"


class Webhook(Base):
    __tablename__ = "webhooks"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()"),
    )
    url: Mapped[str] = mapped_column(Text, nullable=False)
    secret: Mapped[str] = mapped_column(String(64), nullable=False)
    events: Mapped[list[str]] = mapped_column(ARRAY(Text), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    __table_args__ = (
        Index("ix_webhooks_is_active", "is_active"),
    )