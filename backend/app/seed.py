import asyncio
from app.core.database import AsyncSessionLocal
from app.services.categories import seed_default_categories


async def run_seed():
    async with AsyncSessionLocal() as db:
        try:
            await seed_default_categories(db)
            await db.commit()
            print("Default categories seeded")
        except Exception as e:
            await db.rollback()
            print(f"Seed failed: {e}")


if __name__ == "__main__":
    asyncio.run(run_seed())