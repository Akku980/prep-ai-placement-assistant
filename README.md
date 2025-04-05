# PrepAI — AI Placement Assistant

An AI-powered placement preparation platform for engineering students. Practice DSA, HR interviews, resume reviews, CS fundamentals, and mock interviews — all in one place.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React + Vite + React Router |
| Backend | FastAPI (Python) |
| Database | MongoDB |
| AI | Groq API (Llama 3.3 70B) — free tier |
| Auth | JWT + refresh tokens, bcrypt |
| Dev | Docker + Docker Compose |

## Quick Start (Local)

**Prerequisites:** Docker, Docker Compose

```bash
# 1. Clone
git clone https://github.com/Akku980/prep-ai-placement-assistant
cd prep-ai-placement-assistant

# 2. Configure backend
cp backend/.env.example backend/.env
# Edit backend/.env — add GROQ_API_KEY (free at console.groq.com)

# 3. Run everything
docker compose up --build

# Frontend: http://localhost:5173
# Backend:  http://localhost:8000
# API docs: http://localhost:8000/docs
```

## Environment Variables

`backend/.env`:
```
MONGODB_URL=mongodb://mongo:27017   # auto-set by Docker
DB_NAME=prepai
JWT_SECRET=your-random-secret-64-chars
JWT_ALGORITHM=HS256
JWT_EXPIRE_HOURS=168
GROQ_API_KEY=gsk_...               # get free at console.groq.com
ALLOWED_ORIGINS=http://localhost:5173
```

## Features

- **Real authentication** — signup, login, logout, forgot password, JWT + refresh tokens
- **6 AI modes** — DSA, HR Interview, Resume Review, CS Tutor, Mock Interview, General
- **PDF Q&A** — upload notes or resume, ask questions from them (TF-IDF RAG)
- **Chat persistence** — all chats stored in MongoDB, survive restarts
- **Docker-first** — one command runs everything with hot reload

## Project Structure

```
prepai/
├── backend/          FastAPI app
│   ├── core/         config, auth, database
│   ├── routers/      auth, chats, messages, docs, dashboard
│   ├── services/     AI (Groq), PDF processing
│   └── models/       Pydantic schemas
├── frontend/         React + Vite app
│   └── src/
│       ├── api/      Axios client with auth interceptors
│       ├── context/  Auth + Theme providers
│       ├── pages/    Login, Signup, Dashboard, Chat
│       └── components/
├── docker-compose.yml
└── docs/             GitHub Pages landing + demo app
```

## API Endpoints

Full docs at `http://localhost:8000/docs`

| Method | Path | Description |
|--------|------|-------------|
| POST | /auth/signup | Create account |
| POST | /auth/login | Login |
| POST | /auth/refresh | Refresh JWT |
| POST | /auth/forgot-password | Password reset |
| GET  | /auth/me | Current user |
| GET  | /chats/ | All user chats |
| POST | /chats/ | New chat |
| DELETE | /chats/{id} | Delete chat |
| GET  | /chats/{id}/messages | Chat messages |
| POST | /messages/ | Send message + AI reply |
| POST | /docs/upload | Upload PDF |
| GET  | /docs/ | List documents |

## Demo

Live demo (GitHub Pages — localStorage auth):
**https://akku980.github.io/prep-ai-placement-assistant/app/**

Full stack (Docker):
```bash
docker compose up
```
