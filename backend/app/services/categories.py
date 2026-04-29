from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.category import Category
from app.schemas.category import CategoryResponse
from uuid import uuid4


async def get_all_categories(db: AsyncSession) -> list[CategoryResponse]:
    result = await db.execute(select(Category))
    return result.scalars().all()


async def seed_default_categories(db: AsyncSession):
    defaults = [
        {"name": "Feature Request", "slug": "feature-request", "color": "#2980B9"},
        {"name": "Bug Report",      "slug": "bug-report",      "color": "#E74C3C"},
        {"name": "UI/UX",           "slug": "ui-ux",           "color": "#9B59B6"},
        {"name": "Performance",     "slug": "performance",     "color": "#F1C40F"},
        {"name": "Documentation",   "slug": "documentation",   "color": "#34495E"},
    ]

    stmt = select(Category.slug).where(
        Category.slug.in_([d["slug"] for d in defaults])
    )
    result = await db.execute(stmt)
    existing_slugs = set(result.scalars())

    to_add = []
    for d in defaults:
        if d["slug"] not in existing_slugs:
            to_add.append(
                Category(
                    id=uuid4(),
                    name=d["name"],
                    slug=d["slug"],
                    color=d["color"],
                )
            )
    if to_add:
        db.add_all(to_add)
    await db.flush()