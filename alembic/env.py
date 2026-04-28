import asyncio
import os
from logging.config import fileConfig
from urllib.parse import quote_plus

from alembic import context
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import pool

from app.core.database import Base
from app.models import user  # noqa: F401 — registers all models

config = context.config
fileConfig(config.config_file_name)
target_metadata = Base.metadata


def get_url():
    user_ = os.getenv("DB_USER", "postgres")
    password = quote_plus(os.getenv("DB_PASSWORD", "postgres"))
    host = os.getenv("DB_HOST", "db")
    port = os.getenv("DB_PORT", "5432")
    name = os.getenv("DB_NAME", "feedback_db")
    return f"postgresql+asyncpg://{user_}:{password}@{host}:{port}/{name}"


def run_migrations_offline():
    context.configure(
        url=get_url(),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection):
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online():
    connectable = create_async_engine(get_url(), poolclass=pool.NullPool)
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
