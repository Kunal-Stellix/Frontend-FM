from datetime import datetime, timezone
from enum import Enum
import uuid

from sqlalchemy import String, Boolean, DateTime, Text, Enum as SAEnum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class RoleEnum(str, Enum):
    admin = "admin"
    moderator = "moderator"
    member = "member"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid(), 
        index=True
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[RoleEnum] = mapped_column(
        SAEnum(RoleEnum),
        default=RoleEnum.member,
        nullable=False
    )
    avatar_url: Mapped[str | None] = mapped_column(
        Text,           # ✅ String(500) → Text
        nullable=True
    )
    is_active: Mapped[bool] = mapped_column(   
        Boolean,
        default=True,
        nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),             
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),             
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # User model mein yeh relationships add karo (end mein)
    ideas: Mapped[list["Idea"]] = relationship("Idea", back_populates="author")
    votes: Mapped[list["Vote"]] = relationship("Vote", back_populates="user")
    followers: Mapped[list["Follower"]] = relationship("Follower", back_populates="user")

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email}>"