from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.redis import init_redis, close_redis
from app.core.database import AsyncSessionLocal
from app.services.categories import seed_default_categories
from app.api.v1.routes.auth import router as auth_router
from app.api.v1.routes.categories import router as categories_router
from app.api.v1.routes.ideas import router as ideas_router
from app.api.v1.routes.votes import router as votes_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_redis()
    
    # Seed default categories
    async with AsyncSessionLocal() as db:
        try:
            await seed_default_categories(db)
            await db.commit()
        except Exception as e:
            await db.rollback()
            print(f"❌ Failed to seed categories: {e}")
    
    print(f"🚀 Feedback API starting in [{settings.APP_ENV}] mode")
    yield
    
    # Shutdown
    await close_redis()
    print("🔴 Feedback API shutting down")


app = FastAPI(
    title="Feedback Management API",
    version="1.0.0",
    description="Frill.io-style feedback platform — Phase 1: Auth",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1")
app.include_router(categories_router, prefix="/api/v1")
app.include_router(ideas_router, prefix="/api/v1")
app.include_router(votes_router, prefix="/api/v1")


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok", "env": settings.APP_ENV}
