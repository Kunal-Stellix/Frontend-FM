import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.roadmap import RoadmapItem, RoadmapIdeaLink, RoadmapStatus
from app.models.idea import Idea
from app.schemas.roadmap import (
    RoadmapItemCreate,
    RoadmapItemUpdate,
    RoadmapItemResponse,
    RoadmapBoardResponse,
    IdeaSlim,
)


async def get_roadmap_item(db: AsyncSession, item_id: uuid.UUID) -> RoadmapItem | None:
    result = await db.execute(
        select(RoadmapItem)
        .options(selectinload(RoadmapItem.ideas))
        .where(RoadmapItem.id == item_id)
    )
    return result.scalar_one_or_none()


async def get_roadmap_board(db: AsyncSession) -> RoadmapBoardResponse:
    result = await db.execute(
        select(RoadmapItem)
        .options(selectinload(RoadmapItem.ideas))
        .order_by(RoadmapItem.sort_order)
    )
    items = result.scalars().all()

    planned = []
    in_progress = []
    shipped = []

    for item in items:
        total_votes = sum(i.vote_count for i in item.ideas)
        linked_ideas = [
            IdeaSlim(id=i.id, title=i.title, vote_count=i.vote_count, status=i.status.value)
            for i in item.ideas
        ]
        response = RoadmapItemResponse(
            id=item.id,
            title=item.title,
            description=item.description,
            status=item.status,
            linked_ideas=linked_ideas,
            total_votes=total_votes,
            sort_order=item.sort_order,
            created_at=item.created_at,
        )
        if item.status == RoadmapStatus.planned:
            planned.append(response)
        elif item.status == RoadmapStatus.in_progress:
            in_progress.append(response)
        else:
            shipped.append(response)

    return RoadmapBoardResponse(planned=planned, in_progress=in_progress, shipped=shipped)


async def create_roadmap_item(
    db: AsyncSession, data: RoadmapItemCreate
) -> RoadmapItem:
    # Validate idea_ids exist
    if data.idea_ids:
        idea_result = await db.execute(
            select(Idea).where(Idea.id.in_(data.idea_ids))
        )
        found_ids = {i.id for i in idea_result.scalars().all()}
        missing = set(data.idea_ids) - found_ids
        if missing:
            raise ValueError(f"Idea(s) not found: {missing}")

    item = RoadmapItem(
        title=data.title,
        description=data.description,
        status=data.status,
    )
    db.add(item)
    await db.flush()

    # Create links
    if data.idea_ids:
        for idea_id in data.idea_ids:
            db.add(RoadmapIdeaLink(roadmap_item_id=item.id, idea_id=idea_id))

    await db.flush()
    # Load ideas relationship
    result = await db.execute(
        select(RoadmapItem)
        .options(selectinload(RoadmapItem.ideas))
        .where(RoadmapItem.id == item.id)
    )
    return result.scalar_one()


async def update_roadmap_item(
    db: AsyncSession, item_id: uuid.UUID, data: RoadmapItemUpdate
) -> RoadmapItem | None:
    item = await get_roadmap_item(db, item_id)
    if not item:
        return None

    if data.title is not None:
        item.title = data.title
    if data.description is not None:
        item.description = data.description
    if data.status is not None:
        item.status = data.status

    # Replace links atomically
    if data.idea_ids is not None:
        # Validate idea_ids
        if data.idea_ids:
            idea_result = await db.execute(
                select(Idea).where(Idea.id.in_(data.idea_ids))
            )
            found_ids = {i.id for i in idea_result.scalars().all()}
            missing = set(data.idea_ids) - found_ids
            if missing:
                raise ValueError(f"Idea(s) not found: {missing}")

        # Delete existing links
        await db.execute(
            RoadmapIdeaLink.__table__.delete().where(
                RoadmapIdeaLink.roadmap_item_id == item_id
            )
        )

        # Create new links
        for idea_id in data.idea_ids:
            db.add(RoadmapIdeaLink(roadmap_item_id=item_id, idea_id=idea_id))

    await db.flush()
    await db.refresh(item)

    # Reload with ideas
    result = await db.execute(
        select(RoadmapItem)
        .options(selectinload(RoadmapItem.ideas))
        .where(RoadmapItem.id == item_id)
    )
    return result.scalar_one()


async def delete_roadmap_item(db: AsyncSession, item_id: uuid.UUID) -> bool:
    item = await db.get(RoadmapItem, item_id)
    if not item:
        return False
    await db.delete(item)
    return True