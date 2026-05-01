from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.idea import Idea, IdeaStatus
from app.models.vote import Vote
from app.models.category import Category
from app.models.follower import Follower
from app.models.user import User
from app.schemas.idea import IdeaResponse, IdeaListResponse, AuthorResponse
from app.schemas.category import CategoryResponse
from app.services.webhook_service import dispatch_event
import uuid
from typing import Optional


async def get_all_ideas(
    db: AsyncSession,
    sort: str = "newest",
    status: Optional[IdeaStatus] = None,
    category_id: Optional[uuid.UUID] = None,
    q: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    user_id: Optional[uuid.UUID] = None,
) -> IdeaListResponse:
    stmt = (
        select(Idea)
        .outerjoin(Vote, Vote.idea_id == Idea.id)
        .group_by(Idea.id)
    )

    if status:
        stmt = stmt.where(Idea.status == status)
    if category_id:
        stmt = stmt.where(Idea.category_id == category_id)
    if q:
        stmt = stmt.where(Idea.title.ilike(f"%{q}%"))

    if sort == "votes":
        stmt = stmt.order_by(desc(Idea.vote_count))
    elif sort == "updated":
        stmt = stmt.order_by(desc(Idea.updated_at))
    elif sort == "comments":
        stmt = stmt.order_by(desc(Idea.comment_count))
    else:
        stmt = stmt.order_by(desc(Idea.created_at))

    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = (await db.execute(count_stmt)).scalar()

    items_res = await db.execute(stmt.offset((page - 1) * page_size).limit(page_size))
    items = items_res.scalars().all()

    item_responses = []
    for idea in items:
        voted = False
        if user_id:
            vote_res = await db.execute(
                select(Vote).where(Vote.user_id == user_id, Vote.idea_id == idea.id)
            )
            voted = vote_res.scalar_one_or_none() is not None
        category = await db.get(Category, idea.category_id) if idea.category_id else None
        author = await db.get(User, idea.author_id) if idea.author_id else None
        item_responses.append(
            IdeaResponse(
                id=idea.id,
                title=idea.title,
                description=idea.description,
                status=idea.status,
                author=AuthorResponse(
                    id=author.id, name=author.name, avatar_url=author.avatar_url
                ) if author else None,
                category=CategoryResponse(
                    id=category.id, name=category.name, slug=category.slug,
                    color=category.color, created_at=category.created_at,
                ) if category else None,
                vote_count=idea.vote_count,
                comment_count=idea.comment_count,
                voted_by_me=voted,
                created_at=idea.created_at,
                updated_at=idea.updated_at,
            )
        )

    return IdeaListResponse(
        items=item_responses,
        total=total,
        page=page,
        page_size=page_size,
        has_next=page * page_size < total,
    )


async def create_idea(
    db: AsyncSession,
    user_id: uuid.UUID,
    title: str,
    description: str | None = None,
    category_id: uuid.UUID | None = None,
) -> IdeaResponse:
    if category_id:
        category = await db.get(Category, category_id)
        if not category:
            raise ValueError("Invalid category_id")

    idea = Idea(
        id=uuid.uuid4(),
        title=title,
        description=description,
        status=IdeaStatus.under_review,
        author_id=user_id,
        category_id=category_id,
        vote_count=0,
        comment_count=0,
        is_public=True,
    )
    db.add(idea)
    db.add(Follower(user_id=user_id, idea_id=idea.id))
    await db.flush()

    # Dispatch webhook
    await dispatch_event(
        db,
        event="idea.created",
        payload={
            "idea_id": str(idea.id),
            "title": idea.title,
            "author_id": str(user_id),
            "status": idea.status.value,
        },
    )

    await db.refresh(idea)

    category = await db.get(Category, idea.category_id) if idea.category_id else None
    author = await db.get(User, idea.author_id)
    return IdeaResponse(
        id=idea.id,
        title=idea.title,
        description=idea.description,
        status=idea.status,
        author=AuthorResponse(
            id=author.id, name=author.name, avatar_url=author.avatar_url
        ) if author else None,
        category=CategoryResponse(
            id=category.id, name=category.name, slug=category.slug,
            color=category.color, created_at=category.created_at,
        ) if category else None,
        vote_count=idea.vote_count,
        comment_count=idea.comment_count,
        voted_by_me=True,
        created_at=idea.created_at,
        updated_at=idea.updated_at,
    )


async def get_idea_by_id(
    db: AsyncSession, idea_id: uuid.UUID, user_id: uuid.UUID | None = None
) -> IdeaResponse:
    idea = await db.get(Idea, idea_id)
    if not idea:
        raise ValueError("Idea not found")

    category = await db.get(Category, idea.category_id) if idea.category_id else None
    author = await db.get(User, idea.author_id)

    voted = False
    if user_id:
        vote_res = await db.execute(
            select(Vote).where(Vote.user_id == user_id, Vote.idea_id == idea.id)
        )
        voted = vote_res.scalar_one_or_none() is not None

    return IdeaResponse(
        id=idea.id,
        title=idea.title,
        description=idea.description,
        status=idea.status,
        author=AuthorResponse(
            id=author.id, name=author.name, avatar_url=author.avatar_url
        ) if author else None,
        category=CategoryResponse(
            id=category.id, name=category.name, slug=category.slug,
            color=category.color, created_at=category.created_at,
        ) if category else None,
        vote_count=idea.vote_count,
        comment_count=idea.comment_count,
        voted_by_me=voted,
        created_at=idea.created_at,
        updated_at=idea.updated_at,
    )


async def search_ideas(db: AsyncSession, q: str, user_id: Optional[uuid.UUID] = None) -> list[IdeaResponse]:
    """
    Search ideas by title with duplicate detection.
    Returns top 5 most relevant matches with deduplication by normalized title.
    """
    result = await db.execute(
        select(Idea).where(Idea.title.ilike(f"%{q}%")).order_by(Idea.vote_count.desc()).limit(10)
    )
    ideas = result.scalars().all()
    
    # Deduplicate by normalized title (case-insensitive, trim whitespace)
    seen_titles = set()
    results = []
    
    for idea in ideas:
        normalized_title = idea.title.lower().strip()
        
        # Skip if we've already included a similar idea
        if normalized_title in seen_titles:
            continue
        
        seen_titles.add(normalized_title)
        
        # Check if current user voted
        voted = False
        if user_id:
            vote_res = await db.execute(
                select(Vote).where(Vote.user_id == user_id, Vote.idea_id == idea.id)
            )
            voted = vote_res.scalar_one_or_none() is not None
        
        category = await db.get(Category, idea.category_id) if idea.category_id else None
        author = await db.get(User, idea.author_id)
        results.append(
            IdeaResponse(
                id=idea.id,
                title=idea.title,
                description=idea.description,
                status=idea.status,
                author=AuthorResponse(
                    id=author.id, name=author.name, avatar_url=author.avatar_url
                ) if author else None,
                category=CategoryResponse(
                    id=category.id, name=category.name, slug=category.slug,
                    color=category.color, created_at=category.created_at,
                ) if category else None,
                vote_count=idea.vote_count,
                comment_count=idea.comment_count,
                voted_by_me=voted,
                created_at=idea.created_at,
                updated_at=idea.updated_at,
            )
        )
        
        # Return top 5 unique results
        if len(results) >= 5:
            break
    
    return results