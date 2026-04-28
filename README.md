# Product Feedback Platform

This branch keeps the two applications separated:

- `backend/` contains the FastAPI backend
- `frontend/` contains the Next.js frontend

## Quick Start

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend:

```bash
cd backend
cp .env.example .env
docker compose up --build
```
