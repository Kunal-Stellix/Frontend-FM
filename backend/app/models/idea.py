import uuid
from enum import Enum
from datetime import datetime, timezone
from sqlalchemy import String, Text, Boolean, Integer, DateTime, Enum as SAEnum, ForeignKey, func, text, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base


class IdeaStatus(str, Enum):
    under_review = "under_review"
    planned = "planned"
    in_progress = "in_progress"
    shipped = "shipped"
    declined = "declined"


class Idea(Base):
    __tablename__ = "ideas"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()"),
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[IdeaStatus] = mapped_column(
        SAEnum(IdeaStatus),
        default=IdeaStatus.under_review,
        nullable=False,
    )
    author_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    category_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("categories.id", ondelete="SET NULL"),
        nullable=True,
    )
    vote_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    comment_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_public: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    author: Mapped["User"] = relationship("User", back_populates="ideas")
    category: Mapped["Category"] = relationship("Category", back_populates="ideas")
    votes: Mapped[list["Vote"]] = relationship("Vote", back_populates="idea", cascade="all, delete-orphan")
    followers: Mapped[list["Follower"]] = relationship("Follower", back_populates="idea", cascade="all, delete-orphan")

    # Indexes
    __table_args__ = (
        Index("ix_ideas_status", "status"),
        Index("ix_ideas_category_id", "category_id"),
        Index("ix_ideas_created_at", "created_at"),
    )

    def __repr__(self) -> str:
        return f"<Idea id={self.id} title={self.title}>"