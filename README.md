# Feedback Management Backend

> Production-grade FastAPI backend — Frill.io style feedback platform.

## Stack
- Python 3.12, FastAPI, SQLAlchemy 2.0, Alembic
- PostgreSQL 16, Redis 7
- Poetry, Docker Compose, passlib[bcrypt], python-jose

## Quickstart

```bash
cp .env.example .env
docker compose up --build
# API → http://localhost:8000
# Docs → http://localhost:8000/docs
```

## Auth Endpoints
| Method | URL | Description |
|--------|-----|-------------|
| POST | /api/v1/auth/register | Register |
| POST | /api/v1/auth/login | Login |
| POST | /api/v1/auth/refresh | Refresh token(15 min) |
| GET  | /api/v1/auth/me | Current user |
