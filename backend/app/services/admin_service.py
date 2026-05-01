import uuid
from datetime import datetime
from sqlalchemy import select, func, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.idea import Idea, IdeaStatus
from app.models.follower import Follower
from app.models.vote import Vote
from app.models.user import User
from app.schemas.idea import IdeaStatusUpdate, IdeaMergeRequest, IdeaResponse, AuthorResponse
from app.schemas.category import CategoryResponse
from app.schemas.admin import AdminDashboardResponse, ActivityItem, IdeaSlimForAdmin
from app.models.category import Category
from app.models.notification import NotificationType
from app.services.notification_service import fan_out_to_followers, create_notification
from app.services.webhook_service import dispatch_event


async def update_idea_status(
    db: AsyncSession,
    idea_id: uuid.UUID,
    status: IdeaStatus,
    note: str | None = None,
) -> Idea:
    idea = await db.get(Idea, idea_id)
    if not idea:
        raise ValueError("Idea not found")
    idea.status = status
    await db.flush()

    # Notify followers of status change
    await fan_out_to_followers(
        db,
        idea_id=idea_id,
        type=NotificationType.status_change,
        title=f"Idea status updated: {idea.title[:50]}",
        body=f"Status changed to {status.value}",
        link=f"/ideas/{idea_id}",
    )

    # Dispatch webhook
    await dispatch_event(
        db,
        event="idea.status_changed",
        payload={
            "idea_id": str(idea_id),
            "title": idea.title,
            "status": status.value,
            "note": note,
        },
    )

    await db.refresh(idea)
    return idea


async def approve_idea(db: AsyncSession, idea_id: uuid.UUID) -> Idea:
    idea = await db.get(Idea, idea_id)
    if not idea:
        raise ValueError("Idea not found")
    idea.is_public = True
    await db.flush()

    # Dispatch webhook
    await dispatch_event(
        db,
        event="idea.status_changed",
        payload={
            "idea_id": str(idea_id),
            "title": idea.title,
            "status": "approved",
        },
    )

    await db.refresh(idea)
    return idea


async def reject_idea(db: AsyncSession, idea_id: uuid.UUID, reason: str | None = None) -> bool:
    idea = await db.get(Idea, idea_id)
    if not idea:
        raise ValueError("Idea not found")
    idea.is_public = False
    await db.flush()
    return True


async def merge_ideas(
    db: AsyncSession,
    primary_id: uuid.UUID,
    secondary_ids: list[uuid.UUID],
) -> Idea:
    primary = await db.get(Idea, primary_id)
    if not primary:
        raise ValueError("Primary idea not found")

    for sid in secondary_ids:
        secondary = await db.get(Idea, sid)
        if not secondary:
            raise ValueError(f"Secondary idea {sid} not found")

        # Transfer votes
        vote_result = await db.execute(
            select(Vote).where(Vote.idea_id == sid)
        )
        for vote in vote_result.scalars().all():
            # Check if primary already has this user's vote
            existing = await db.execute(
                select(Vote).where(Vote.idea_id == primary_id, Vote.user_id == vote.user_id)
            )
            if not existing.scalar_one_or_none():
                new_vote = Vote(user_id=vote.user_id, idea_id=primary_id)
                db.add(new_vote)

        # Transfer followers
        follower_result = await db.execute(
            select(Follower).where(Follower.idea_id == sid)
        )
        for follower in follower_result.scalars().all():
            existing = await db.execute(
                select(Follower).where(Follower.idea_id == primary_id, Follower.user_id == follower.user_id)
            )
            if not existing.scalar_one_or_none():
                new_follower = Follower(user_id=follower.user_id, idea_id=primary_id)
                db.add(new_follower)

        # Delete secondary idea
        await db.delete(secondary)

    # Recalculate vote_count for primary
    vote_count_result = await db.execute(
        select(func.count()).select_from(Vote).where(Vote.idea_id == primary_id)
    )
    primary.vote_count = vote_count_result.scalar() or 0

    await db.flush()

    # Notify followers of merged ideas (followers of secondary ideas are now following primary)
    for sid in secondary_ids:
        await fan_out_to_followers(
            db,
            idea_id=primary_id,
            type=NotificationType.idea_merged,
            title=f"Idea merged: {primary.title[:50]}",
            body=f"Your idea was merged into another idea",
            link=f"/ideas/{primary_id}",
        )

    # Dispatch webhook for merge
    await dispatch_event(
        db,
        event="idea.merged",
        payload={
            "primary_idea_id": str(primary_id),
            "merged_idea_ids": [str(s) for s in secondary_ids],
            "title": primary.title,
        },
    )

    await db.refresh(primary)
    return primary


async def get_admin_dashboard(db: AsyncSession) -> AdminDashboardResponse:
    # Pending ideas (not public, under_review status)
    pending_result = await db.execute(
        select(func.count()).select_from(Idea).where(
            Idea.is_public == False, Idea.status == IdeaStatus.under_review
        )
    )
    pending_ideas_count = pending_result.scalar() or 0

    # Top 5 ideas by votes
    top_result = await db.execute(
        select(Idea).order_by(Idea.vote_count.desc()).limit(5)
    )
    top_ideas = [
        IdeaSlimForAdmin(
            id=i.id,
            title=i.title,
            vote_count=i.vote_count,
            status=i.status.value if hasattr(i.status, 'value') else str(i.status),
        )
        for i in top_result.scalars().all()
    ]

    # Recent activity (last 20 ideas)
    activity_result = await db.execute(
        select(Idea).order_by(Idea.created_at.desc()).limit(20)
    )
    recent_activity = [
        ActivityItem(
            type="idea_created",
            message=f"New idea: {i.title[:50]}",
            created_at=i.created_at,
        )
        for i in activity_result.scalars().all()
    ]

    # Totals
    total_ideas_result = await db.execute(select(func.count()).select_from(Idea))
    total_ideas = total_ideas_result.scalar() or 0

    total_votes_result = await db.execute(select(func.sum(Idea.vote_count)))
    total_votes = total_votes_result.scalar() or 0

    total_users_result = await db.execute(select(func.count()).select_from(User))
    total_users = total_users_result.scalar() or 0

    return AdminDashboardResponse(
        pending_ideas_count=pending_ideas_count,
        top_ideas=top_ideas,
        recent_activity=recent_activity,
        total_ideas=total_ideas,
        total_votes=total_votes,
        total_users=total_users,
    )