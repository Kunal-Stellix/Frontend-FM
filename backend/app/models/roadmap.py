import uuid
from enum import Enum
from datetime import datetime, timezone
from sqlalchemy import String, Text, Integer, DateTime, Enum as SAEnum, ForeignKey, func, text, Index, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base


class RoadmapStatus(str, Enum):
    planned = "planned"
    in_progress = "in_progress"
    shipped = "shipped"


class RoadmapItem(Base):
    __tablename__ = "roadmap_items"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()"),
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[RoadmapStatus] = mapped_column(
        SAEnum(RoadmapStatus),
        default=RoadmapStatus.planned,
        nullable=False,
    )
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    ideas = relationship(
        "Idea",
        secondary="roadmap_idea_links",
        back_populates="roadmap_items",
        passive_deletes=True,
    )

    __table_args__ = (
        Index("ix_roadmap_items_status", "status"),
    )


class RoadmapIdeaLink(Base):
    __tablename__ = "roadmap_idea_links"

    roadmap_item_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("roadmap_items.id", ondelete="CASCADE"),
        primary_key=True,
    )
    idea_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("ideas.id", ondelete="CASCADE"),
        primary_key=True,
    )

    __table_args__ = (
        UniqueConstraint("roadmap_item_id", "idea_id", name="uq_roadmap_idea_link"),
    )