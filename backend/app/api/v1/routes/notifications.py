import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.notification import NotificationListResponse
from app.services import notification_service

router = APIRouter()


@router.get(
    "/notifications",
    response_model=NotificationListResponse,
    tags=["Notifications"],
)
async def get_notifications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    page: int = 1,
    page_size: int = 20,
):
    return await notification_service.get_user_notifications(
        db, current_user.id, page, page_size
    )


@router.patch(
    "/notifications/read-all",
    status_code=status.HTTP_200_OK,
    tags=["Notifications"],
)
async def mark_all_read(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    updated = await notification_service.mark_all_read(db, current_user.id)
    return {"updated": updated}


@router.patch(
    "/notifications/{notification_id}/read",
    tags=["Notifications"],
)
async def mark_single_read(
    notification_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notification = await notification_service.mark_single_read(
        db, notification_id, current_user.id
    )
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification