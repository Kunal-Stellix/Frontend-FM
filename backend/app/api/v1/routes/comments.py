from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.comment import CommentCreate, CommentListResponse, CommentResponse
from app.services.comment_service import CommentService


router = APIRouter(prefix="/ideas", tags=["Comments"])


@router.get("/{idea_id}/comments", response_model=CommentListResponse)
async def list_comments(
    idea_id: UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    return await CommentService(db).list_comments(
        idea_id=idea_id,
        page=page,
        page_size=page_size,
    )


@router.post(
    "/{idea_id}/comments",
    response_model=CommentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_comment(
    idea_id: UUID,
    data: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await CommentService(db).create_comment(
        idea_id=idea_id,
        data=data,
        current_user=current_user,
    )


@router.delete(
    "/{idea_id}/comments/{comment_id}",
    status_code=status.HTTP_200_OK,
)
async def delete_comment(
    idea_id: UUID,
    comment_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await CommentService(db).delete_comment(
        idea_id=idea_id,
        comment_id=comment_id,
        current_user=current_user,
    )