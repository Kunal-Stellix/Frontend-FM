import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.database import get_db
from app.schemas.idea import IdeaCreate, IdeaResponse, IdeaListResponse, IdeaStatus
from app.services.ideas import get_all_ideas, create_idea, get_idea_by_id, search_ideas
from app.core.dependencies import get_current_user, get_current_user_optional

router = APIRouter(prefix="/ideas", tags=["Ideas"])
limiter = Limiter(key_func=get_remote_address)


@router.get("", response_model=IdeaListResponse)
@limiter.limit("60/minute")
async def list_ideas(
    request: Request,
    sort: str = Query("newest", pattern="^(votes|newest|updated|comments)$"),
    status: IdeaStatus | None = None,
    category_id: uuid.UUID | None = None,
    q: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user_optional),
):
    user_id = current_user.id if current_user else None
    return await get_all_ideas(db, sort=sort, status=status, category_id=category_id, q=q, page=page, page_size=page_size, user_id=user_id)


@router.post("", response_model=IdeaResponse, status_code=201)
async def create_new_idea(
    payload: IdeaCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        return await create_idea(
            db=db,
            user_id=current_user.id,
            title=payload.title,
            description=payload.description,
            category_id=payload.category_id,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/search", response_model=list[IdeaResponse])
async def search_ideas_route(
    q: str = Query(..., min_length=2),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user_optional),
):
    user_id = current_user.id if current_user else None
    return await search_ideas(db, q=q, user_id=user_id)


@router.get("/{idea_id}", response_model=IdeaResponse)
async def get_idea(
    idea_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user_optional),
):
    try:
        user_id = current_user.id if current_user else None
        return await get_idea_by_id(db, idea_id, user_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Idea not found")