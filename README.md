# Product Feedback Platform

Integrated development branch for the product feedback platform.

## Structure
- Frontend: Next.js app in the repository root and `src/`
- Backend: FastAPI app under `app/`

## Frontend
```bash
npm install
npm run dev
```

Runs on `http://localhost:3000` by default.

## Backend
```bash
cp .env.example .env
docker compose up --build
```

Runs on `http://localhost:8000` with docs at `http://localhost:8000/docs`.
