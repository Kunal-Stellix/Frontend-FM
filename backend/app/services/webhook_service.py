import uuid
import secrets
import asyncio
import hashlib
import hmac
import httpx
import json
from typing import Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.webhook import Webhook


async def list_webhooks(db: AsyncSession) -> list[Webhook]:
    result = await db.execute(select(Webhook))
    return list(result.scalars().all())


async def create_webhook(
    db: AsyncSession,
    url: str,
    events: list[str],
    secret: str | None = None,
) -> Webhook:
    webhook = Webhook(
        url=url,
        secret=secret or secrets.token_hex(32),
        events=events,
    )
    db.add(webhook)
    await db.flush()
    await db.refresh(webhook)
    return webhook


async def delete_webhook(db: AsyncSession, webhook_id: uuid.UUID) -> bool:
    webhook = await db.get(Webhook, webhook_id)
    if not webhook:
        return False
    await db.delete(webhook)
    return True


async def dispatch_event(
    db: AsyncSession,
    event: str,
    payload: dict[str, Any],
) -> None:
    """Fire-and-forget webhook dispatch."""
    result = await db.execute(
        select(Webhook).where(Webhook.is_active == True)
    )
    webhooks = result.scalars().all()

    for webhook in webhooks:
        if event not in webhook.events:
            continue

        asyncio.create_task(
            _deliver_webhook(webhook.url, webhook.secret, event, payload)
        )


async def _deliver_webhook(
    url: str,
    secret: str,
    event: str,
    payload: dict[str, Any],
) -> None:
    """Deliver a webhook with HMAC signature."""
    try:
        body = json.dumps(payload)
        signature = hmac.new(
            secret.encode(),
            body.encode(),
            hashlib.sha256,
        ).hexdigest()

        async with httpx.AsyncClient(timeout=5.0) as client:
            await client.post(
                url,
                content=body,
                headers={
                    "Content-Type": "application/json",
                    "X-Webhook-Signature": signature,
                    "X-Webhook-Event": event,
                },
            )
    except Exception:
        # Log failure silently, never raise
        pass