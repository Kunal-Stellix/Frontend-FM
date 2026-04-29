from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.idea import Idea
from app.models.vote import Vote
from app.models.follower import Follower
from app.schemas.vote import VoteResponse, VoteStatusResponse
from uuid import UUID


async def toggle_vote(
    db: AsyncSession, user_id: UUID, idea_id: UUID
) -> VoteResponse:
    existing = (await db.execute(
        select(Vote).where(Vote.user_id == user_id, Vote.idea_id == idea_id)
    )).scalar_one_or_none()

    if existing:
        await db.delete(existing)
        await db.flush()
        idea = await db.get(Idea, idea_id)
        idea.vote_count -= 1
    else:
        db.add(Vote(user_id=user_id, idea_id=idea_id))
        await db.flush()
        idea = await db.get(Idea, idea_id)
        idea.vote_count += 1

        # Auto-follow on first vote
        follower = (await db.execute(
            select(Follower).where(Follower.user_id == user_id, Follower.idea_id == idea_id)
        )).scalar_one_or_none()
        if not follower:
            db.add(Follower(user_id=user_id, idea_id=idea_id))
            await db.flush()

    vote_count = (await db.execute(
        select(func.count(Vote.id)).where(Vote.idea_id == idea_id)
    )).scalar()

    return VoteResponse(voted=existing is None, vote_count=vote_count)


async def remove_vote(
    db: AsyncSession, user_id: UUID, idea_id: UUID
) -> VoteResponse:
    vote = (await db.execute(
        select(Vote).where(Vote.user_id == user_id, Vote.idea_id == idea_id)
    )).scalar_one_or_none()

    vote_count = (await db.execute(
        select(func.count(Vote.id)).where(Vote.idea_id == idea_id)
    )).scalar()

    if not vote:
        return VoteResponse(voted=False, vote_count=vote_count)

    await db.delete(vote)
    await db.flush()
    idea = await db.get(Idea, idea_id)
    idea.vote_count -= 1

    vote_count = (await db.execute(
        select(func.count(Vote.id)).where(Vote.idea_id == idea_id)
    )).scalar()

    return VoteResponse(voted=False, vote_count=vote_count)


async def get_vote_status(
    db: AsyncSession, user_id: UUID, idea_id: UUID
) -> VoteStatusResponse:
    vote = (await db.execute(
        select(Vote).where(Vote.user_id == user_id, Vote.idea_id == idea_id)
    )).scalar_one_or_none()
    return VoteStatusResponse(voted=vote is not None)