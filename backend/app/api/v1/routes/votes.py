import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.vote import VoteResponse, VoteStatusResponse
from app.services.votes import toggle_vote, remove_vote, get_vote_status

router = APIRouter(prefix="/ideas", tags=["Votes"])


@router.post("/{idea_id}/vote", response_model=VoteResponse)
async def vote_idea(
    idea_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return await toggle_vote(db=db, user_id=current_user.id, idea_id=idea_id)


@router.delete("/{idea_id}/vote", response_model=VoteResponse)
async def unvote_idea(
    idea_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return await remove_vote(db=db, user_id=current_user.id, idea_id=idea_id)


@router.get("/{idea_id}/vote", response_model=VoteStatusResponse)
async def vote_status(
    idea_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return await get_vote_status(db=db, user_id=current_user.id, idea_id=idea_id)