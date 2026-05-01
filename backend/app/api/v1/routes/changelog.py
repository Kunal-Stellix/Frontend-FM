import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.core.dependencies import get_current_user, require_admin
from app.core.database import get_db
from app.models.user import User
from app.models.changelog import ChangelogType
from app.schemas.changelog import (
    ChangelogEntryCreate,
    ChangelogEntryResponse,
    ChangelogListResponse,
    SubscribeRequest,
)
from app.services import changelog_service

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.get(
    "/changelog",
    response_model=ChangelogListResponse,
    tags=["Changelog"],
)
async def list_changelog(
    db: AsyncSession = Depends(get_db),
    type: ChangelogType | None = None,
    page: int = 1,
    page_size: int = 10,
):
    return await changelog_service.list_changelog(db, type, page, page_size)


@router.get(
    "/changelog/{entry_id}",
    response_model=ChangelogEntryResponse,
    tags=["Changelog"],
)
async def get_changelog_entry(
    entry_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    entry = await changelog_service.get_changelog_entry(db, entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Changelog entry not found")

    linked_idea_data = None
    if entry.linked_idea:
        linked_idea_data = {
            "id": entry.linked_idea.id,
            "title": entry.linked_idea.title,
            "vote_count": entry.linked_idea.vote_count,
            "status": entry.linked_idea.status.value if hasattr(entry.linked_idea.status, 'value') else str(entry.linked_idea.status),
        }

    return ChangelogEntryResponse(
        id=entry.id,
        title=entry.title,
        body=entry.body,
        type=entry.type,
        linked_idea=linked_idea_data,
        published_at=entry.published_at,
    )


@router.post(
    "/changelog/subscribe",
    status_code=status.HTTP_200_OK,
    tags=["Changelog"],
)
@limiter.limit("5/minute")
async def subscribe_changelog(
    request: Request,
    data: SubscribeRequest,
    db: AsyncSession = Depends(get_db),
):
    await changelog_service.subscribe_changelog(db, data.email)
    return {"subscribed": True}


@router.delete(
    "/changelog/unsubscribe",
    status_code=status.HTTP_200_OK,
    tags=["Changelog"],
)
async def unsubscribe_changelog(
    token: str,
    db: AsyncSession = Depends(get_db),
):
    success = await changelog_service.unsubscribe_changelog(db, token)
    if not success:
        raise HTTPException(status_code=404, detail="Invalid unsubscribe token")
    return {"unsubscribed": True}


@router.post(
    "/admin/changelog",
    response_model=ChangelogEntryResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Changelog"],
    dependencies=[Depends(require_admin)],
)
async def create_changelog_entry(
    data: ChangelogEntryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entry = await changelog_service.create_changelog_entry(
        db, data, current_user.id
    )
    return ChangelogEntryResponse(
        id=entry.id,
        title=entry.title,
        body=entry.body,
        type=entry.type,
        linked_idea=None,
        published_at=entry.published_at,
    )