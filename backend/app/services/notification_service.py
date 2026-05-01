import uuid
from sqlalchemy import select, func, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.notification import Notification, NotificationType
from app.models.follower import Follower
from app.schemas.notification import NotificationListResponse


async def create_notification(
    db: AsyncSession,
    user_id: uuid.UUID,
    type: NotificationType,
    title: str,
    body: str,
    link: str | None = None,
) -> Notification:
    notification = Notification(
        user_id=user_id,
        type=type,
        title=title,
        body=body,
        link=link,
    )
    db.add(notification)
    await db.flush()
    await db.refresh(notification)
    return notification


async def fan_out_to_followers(
    db: AsyncSession,
    idea_id: uuid.UUID,
    type: NotificationType,
    title: str,
    body: str,
    link: str | None = None,
) -> list[Notification]:
    result = await db.execute(
        select(Follower).where(Follower.idea_id == idea_id)
    )
    followers = result.scalars().all()
    notifications = []
    for follower in followers:
        notification = Notification(
            user_id=follower.user_id,
            type=type,
            title=title,
            body=body,
            link=link,
        )
        db.add(notification)
        notifications.append(notification)
    await db.flush()
    return notifications


async def get_user_notifications(
    db: AsyncSession,
    user_id: uuid.UUID,
    page: int = 1,
    page_size: int = 20,
) -> NotificationListResponse:
    # Get unread count
    unread_result = await db.execute(
        select(func.count())
        .select_from(Notification)
        .where(Notification.user_id == user_id, Notification.is_read == False)
    )
    unread_count = unread_result.scalar() or 0

    # Get notifications (unread first, then by created_at desc)
    stmt = (
        select(Notification)
        .where(Notification.user_id == user_id)
        .order_by(Notification.is_read.asc(), Notification.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    result = await db.execute(stmt)
    notifications = result.scalars().all()

    return NotificationListResponse(
        items=notifications,
        unread_count=unread_count,
    )


async def mark_all_read(db: AsyncSession, user_id: uuid.UUID) -> int:
    result = await db.execute(
        update(Notification)
        .where(Notification.user_id == user_id, Notification.is_read == False)
        .values(is_read=True)
    )
    await db.flush()
    return result.rowcount or 0


async def mark_single_read(
    db: AsyncSession, notification_id: uuid.UUID, user_id: uuid.UUID
) -> Notification | None:
    notification = await db.get(Notification, notification_id)
    if not notification or notification.user_id != user_id:
        return None
    notification.is_read = True
    await db.flush()
    await db.refresh(notification)
    return notification