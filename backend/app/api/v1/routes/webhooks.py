import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_current_user, require_admin
from app.core.database import get_db
from app.models.user import User
from app.schemas.webhook import WebhookCreate, WebhookResponse
from app.services import webhook_service

router = APIRouter()


@router.get(
    "/admin/webhooks",
    response_model=list[WebhookResponse],
    tags=["Webhooks"],
    dependencies=[Depends(require_admin)],
)
async def list_webhooks(db: AsyncSession = Depends(get_db)):
    webhooks = await webhook_service.list_webhooks(db)
    return [
        WebhookResponse(
            id=w.id,
            url=w.url,
            events=w.events,
            is_active=w.is_active,
            secret=None,  # Never expose secret on read
            created_at=w.created_at,
        )
        for w in webhooks
    ]


@router.post(
    "/admin/webhooks",
    response_model=WebhookResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Webhooks"],
    dependencies=[Depends(require_admin)],
)
async def create_webhook(
    data: WebhookCreate,
    db: AsyncSession = Depends(get_db),
):
    webhook = await webhook_service.create_webhook(
        db,
        url=str(data.url),
        events=[e.value for e in data.events],
        secret=data.secret,
    )
    return WebhookResponse(
        id=webhook.id,
        url=webhook.url,
        events=webhook.events,
        is_active=webhook.is_active,
        secret=webhook.secret,  # Only exposed on creation
        created_at=webhook.created_at,
    )


@router.delete(
    "/admin/webhooks/{webhook_id}",
    status_code=status.HTTP_200_OK,
    tags=["Webhooks"],
    dependencies=[Depends(require_admin)],
)
async def delete_webhook(
    webhook_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    deleted = await webhook_service.delete_webhook(db, webhook_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Webhook not found")
    return {"deleted": True}