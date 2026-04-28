from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.redis import init_redis, close_redis
from app.api.v1.routes.auth import router as auth_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_redis()
    print(f"🚀 Feedback API starting in [{settings.APP_ENV}] mode")
    yield
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


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok", "env": settings.APP_ENV}
