import asyncio
import asyncpg
import os
import sys
from urllib.parse import quote_plus


async def wait_for_db():
    user = os.getenv("DB_USER", "postgres")
    password = quote_plus(os.getenv("DB_PASSWORD", "postgres"))
    host = os.getenv("DB_HOST", "db")
    port = os.getenv("DB_PORT", "5432")
    name = os.getenv("DB_NAME", "feedback_db")
    dsn = f"postgresql://{user}:{password}@{host}:{port}/{name}"

    retries = 10
    for i in range(retries):
        try:
            conn = await asyncpg.connect(dsn)
            await conn.close()
            print("✅ Database is ready.")
            return
        except Exception as e:
            print(f"⏳ Waiting for DB... attempt {i+1}/{retries}: {e}")
            await asyncio.sleep(2)

    print("❌ Could not connect to DB. Exiting.")
    sys.exit(1)


if __name__ == "__main__":
    asyncio.run(wait_for_db())
