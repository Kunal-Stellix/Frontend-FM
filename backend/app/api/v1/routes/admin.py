import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.dependencies import get_current_user, require_admin, require_moderator_or_admin
from app.core.database import get_db
from app.models.user import User
from app.models.idea import Idea, IdeaStatus
from app.models.follower import Follower
from app.schemas.idea import (
    IdeaStatusUpdate,
    IdeaRejectRequest,
    IdeaMergeRequest,
    IdeaResponse,
    IdeaListResponse,
    AuthorResponse,
)
from app.schemas.category import CategoryResponse
from app.schemas.admin import AdminDashboardResponse
from app.models.category import Category
from app.services import admin_service

router = APIRouter()


@router.get(
    "/admin/ideas",
    response_model=IdeaListResponse,
    tags=["Admin"],
    dependencies=[Depends(require_admin)],
)
async def list_ideas_admin(
    db: AsyncSession = Depends(get_db),
    page: int = 1,
    page_size: int = 20,
):
    stmt = select(Idea).order_by(Idea.created_at.desc())
    from sqlalchemy import func
    count_result = await db.execute(select(func.count()).select_from(Idea))
    total = count_result.scalar() or 0

    result = await db.execute(stmt.offset((page - 1) * page_size).limit(page_size))
    ideas = result.scalars().all()

    items = []
    for idea in ideas:
        author = await db.get(User, idea.author_id) if idea.author_id else None
        category = await db.get(Category, idea.category_id) if idea.category_id else None
        items.append(
            IdeaResponse(
                id=idea.id,
                title=idea.title,
                description=idea.description,
                status=idea.status,
                author=AuthorResponse(
                    id=author.id, name=author.name, avatar_url=author.avatar_url
                ) if author else AuthorResponse(id=uuid.uuid4(), name="Unknown"),
                category=CategoryResponse(
                    id=category.id, name=category.name, slug=category.slug,
                    color=category.color,
                ) if category else None,
                vote_count=idea.vote_count,
                comment_count=idea.comment_count,
                voted_by_me=False,
                created_at=idea.created_at,
                updated_at=idea.updated_at,
            )
        )

    return IdeaListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        has_next=page * page_size < total,
    )


@router.patch(
    "/admin/ideas/{idea_id}/status",
    response_model=IdeaResponse,
    tags=["Admin"],
    dependencies=[Depends(require_moderator_or_admin)],
)
async def update_idea_status(
    idea_id: uuid.UUID,
    data: IdeaStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        idea = await admin_service.update_idea_status(db, idea_id, data.status, data.note)
        author = await db.get(User, idea.author_id) if idea.author_id else None
        category = await db.get(Category, idea.category_id) if idea.category_id else None
        return IdeaResponse(
            id=idea.id,
            title=idea.title,
            description=idea.description,
            status=idea.status,
            author=AuthorResponse(
                id=author.id, name=author.name, avatar_url=author.avatar_url
            ) if author else AuthorResponse(id=uuid.uuid4(), name="Unknown"),
            category=CategoryResponse(
                id=category.id, name=category.name, slug=category.slug,
                color=category.color,
            ) if category else None,
            vote_count=idea.vote_count,
            comment_count=idea.comment_count,
            voted_by_me=False,
            created_at=idea.created_at,
            updated_at=idea.updated_at,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post(
    "/admin/ideas/{idea_id}/approve",
    response_model=IdeaResponse,
    tags=["Admin"],
    dependencies=[Depends(require_moderator_or_admin)],
)
async def approve_idea(
    idea_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    try:
        idea = await admin_service.approve_idea(db, idea_id)
        author = await db.get(User, idea.author_id) if idea.author_id else None
        category = await db.get(Category, idea.category_id) if idea.category_id else None
        return IdeaResponse(
            id=idea.id,
            title=idea.title,
            description=idea.description,
            status=idea.status,
            author=AuthorResponse(
                id=author.id, name=author.name, avatar_url=author.avatar_url
            ) if author else AuthorResponse(id=uuid.uuid4(), name="Unknown"),
            category=CategoryResponse(
                id=category.id, name=category.name, slug=category.slug,
                color=category.color,
            ) if category else None,
            vote_count=idea.vote_count,
            comment_count=idea.comment_count,
            voted_by_me=False,
            created_at=idea.created_at,
            updated_at=idea.updated_at,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post(
    "/admin/ideas/{idea_id}/reject",
    status_code=status.HTTP_200_OK,
    tags=["Admin"],
    dependencies=[Depends(require_moderator_or_admin)],
)
async def reject_idea(
    idea_id: uuid.UUID,
    data: IdeaRejectRequest,
    db: AsyncSession = Depends(get_db),
):
    try:
        await admin_service.reject_idea(db, idea_id, data.reason)
        return {"rejected": True}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post(
    "/admin/ideas/{idea_id}/merge",
    response_model=IdeaResponse,
    tags=["Admin"],
    dependencies=[Depends(require_moderator_or_admin)],
)
async def merge_ideas(
    idea_id: uuid.UUID,
    data: IdeaMergeRequest,
    db: AsyncSession = Depends(get_db),
):
    try:
        # Validate that primary_idea_id is not in secondary_idea_ids
        if idea_id in data.secondary_idea_ids:
            raise HTTPException(status_code=400, detail="primary_idea_id cannot be in secondary_idea_ids")

        primary = await admin_service.merge_ideas(db, idea_id, data.secondary_idea_ids)
        author = await db.get(User, primary.author_id) if primary.author_id else None
        category = await db.get(Category, primary.category_id) if primary.category_id else None
        return IdeaResponse(
            id=primary.id,
            title=primary.title,
            description=primary.description,
            status=primary.status,
            author=AuthorResponse(
                id=author.id, name=author.name, avatar_url=author.avatar_url
            ) if author else AuthorResponse(id=uuid.uuid4(), name="Unknown"),
            category=CategoryResponse(
                id=category.id, name=category.name, slug=category.slug,
                color=category.color,
            ) if category else None,
            vote_count=primary.vote_count,
            comment_count=primary.comment_count,
            voted_by_me=False,
            created_at=primary.created_at,
            updated_at=primary.updated_at,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get(
    "/admin/dashboard",
    response_model=AdminDashboardResponse,
    tags=["Admin"],
    dependencies=[Depends(require_admin)],
)
async def get_admin_dashboard(db: AsyncSession = Depends(get_db)):
    return await admin_service.get_admin_dashboard(db)