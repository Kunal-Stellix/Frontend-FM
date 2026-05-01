import uuid
import secrets
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.changelog import ChangelogEntry, ChangelogSubscriber, ChangelogType
from app.models.notification import NotificationType
from app.schemas.changelog import (
    ChangelogEntryCreate,
    ChangelogListResponse,
    ChangelogEntryResponse,
)
from app.services.notification_service import create_notification
from app.services.webhook_service import dispatch_event


async def _notify_subscribers(
    db: AsyncSession,
    entry_id: uuid.UUID,
    title: str,
    body_preview: str,
) -> None:
    """Notify all registered users whose email matches a subscriber."""
    from app.models.user import User
    result = await db.execute(select(ChangelogSubscriber))
    subscribers = result.scalars().all()

    for sub in subscribers:
        # Look up user by email - only registered users get in-app notifications
        user_result = await db.execute(
            select(User).where(User.email == sub.email)
        )
        user = user_result.scalar_one_or_none()
        if user:
            await create_notification(
                db,
                user_id=user.id,
                type=NotificationType.changelog_published,
                title=f"Changelog: {title[:50]}",
                body=body_preview[:200] if body_preview else "New update available",
                link=f"/changelog/{entry_id}",
            )


async def list_changelog(
    db: AsyncSession,
    type_filter: ChangelogType | None = None,
    page: int = 1,
    page_size: int = 10,
) -> ChangelogListResponse:
    stmt = select(ChangelogEntry)
    if type_filter:
        stmt = stmt.where(ChangelogEntry.type == type_filter)

    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = (await db.execute(count_stmt)).scalar() or 0

    stmt = stmt.order_by(ChangelogEntry.published_at.desc())
    stmt = stmt.options(selectinload(ChangelogEntry.linked_idea))
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(stmt)
    entries = result.scalars().all()

    items = [
        ChangelogEntryResponse(
            id=e.id,
            title=e.title,
            body=e.body,
            type=e.type,
            linked_idea={
                "id": e.linked_idea.id,
                "title": e.linked_idea.title,
                "vote_count": e.linked_idea.vote_count,
                "status": e.linked_idea.status.value if hasattr(e.linked_idea.status, 'value') else str(e.linked_idea.status),
            } if e.linked_idea else None,
            published_at=e.published_at,
        )
        for e in entries
    ]

    return ChangelogListResponse(
        items=items,
        total=total,
        page=page,
        has_next=page * page_size < total,
    )


async def get_changelog_entry(
    db: AsyncSession, entry_id: uuid.UUID
) -> ChangelogEntry | None:
    result = await db.execute(
        select(ChangelogEntry)
        .options(selectinload(ChangelogEntry.linked_idea))
        .where(ChangelogEntry.id == entry_id)
    )
    return result.scalar_one_or_none()


async def create_changelog_entry(
    db: AsyncSession,
    data: ChangelogEntryCreate,
    author_id: uuid.UUID,
) -> ChangelogEntry:
    entry = ChangelogEntry(
        title=data.title,
        body=data.body,
        type=data.type,
        linked_idea_id=data.linked_idea_id,
        created_by=author_id,
    )
    db.add(entry)
    await db.flush()
    await db.refresh(entry)

    # Notify registered subscribers
    await _notify_subscribers(
        db,
        entry_id=entry.id,
        title=entry.title,
        body_preview=entry.body or "",
    )

    # Dispatch webhook
    await dispatch_event(
        db,
        event="changelog.published",
        payload={
            "entry_id": str(entry.id),
            "title": entry.title,
            "type": entry.type.value,
            "linked_idea_id": str(entry.linked_idea_id) if entry.linked_idea_id else None,
        },
    )

    return entry


async def subscribe_changelog(db: AsyncSession, email: str) -> ChangelogSubscriber:
    # Check if exists
    result = await db.execute(
        select(ChangelogSubscriber).where(ChangelogSubscriber.email == email)
    )
    existing = result.scalar_one_or_none()

    if existing:
        return existing

    subscriber = ChangelogSubscriber(
        email=email,
        unsubscribe_token=secrets.token_hex(32),
    )
    db.add(subscriber)
    await db.flush()
    await db.refresh(subscriber)
    return subscriber


async def unsubscribe_changelog(db: AsyncSession, token: str) -> bool:
    result = await db.execute(
        select(ChangelogSubscriber).where(
            ChangelogSubscriber.unsubscribe_token == token
        )
    )
    subscriber = result.scalar_one_or_none()
    if not subscriber:
        return False
    await db.delete(subscriber)
    return True