# PrepAI — AI Placement Assistant 🧠

An AI-powered platform I built to help engineering students (including myself) prepare for campus placements more effectively. Instead of switching between random YouTube videos, forums, and mock test sites, I wanted one place that actually *talks back* — adapts to what you need, helps you practice interviews conversationally, reviews your resume, explains CS concepts, and lets you ask questions from your own study notes.

🌐 **Live Demo:** https://akku980.github.io/prep-ai-placement-assistant  
🗂️ **Repository:** https://github.com/Akku980/prep-ai-placement-assistant

---

## Why I built this

I was preparing for placement season and kept running into the same problem — there's no shortage of resources but no good way to practice *interactively*. Resume reviews require posting on forums and waiting. Mock interviews need a partner. DSA help usually means searching Stack Overflow.

I figured building an AI assistant that actually specializes in placement prep would be both useful and a strong portfolio project. Spent about 3 weeks on this between college work.

---

## Features

### 🤖 AI Assistant Modes
| Mode | What it does |
|------|-------------|
| 💻 DSA Mentor | Explains algorithms, reviews code, discusses complexity |
| 🎤 HR Interviewer | Behavioral Q&A with STAR method coaching |
| 📄 Resume Reviewer | ATS feedback, bullet point improvements |
| 📚 CS Fundamentals | OS, DBMS, CN, OOP explained for interviews |
| 🎯 Mock Interview | Full end-to-end interview simulation with scoring |
| 🤖 General | Open-ended placement guidance |

### 💬 Chat System
- Multiple chat sessions with history
- Rename and delete chats
- Markdown rendering with syntax highlighted code blocks
- Auto-scroll and typing indicator
- Messages persist across sessions (MongoDB)

### 📄 PDF Q&A (RAG)
- Upload your notes, resume, or study material as PDFs
- Ask questions directly from uploaded documents
- Lightweight TF-IDF based retrieval (no heavy ML dependencies)
- Select which PDF to use per conversation

### 🔐 Auth
- JWT-based authentication
- Bcrypt password hashing
- Persistent login (7-day token)
- Protected routes

### 🎨 UI
- Dark / Light mode toggle
- Responsive layout
- Collapsible sidebar
- Toast notifications
- Loading states and skeleton screens

---

## Tech Stack

**Frontend**
- React 18 + Vite
- Tailwind CSS
- React Router v6
- Axios
- React Markdown + react-syntax-highlighter
- Lucide React icons

**Backend**
- FastAPI (Python)
- Motor (async MongoDB driver)
- PyJWT + Passlib/bcrypt
- PyPDF2 for PDF extraction
- httpx for AI API calls

**Database**
- MongoDB (Atlas or local)

**AI**
- Groq API (primary — llama3-8b, free tier)
- OpenRouter fallback (mistral-7b free tier)
- No paid OpenAI API needed

**DevOps**
- Docker + docker-compose
- Nginx (frontend serving)

---

## Architecture

```
prepai/
├── frontend/              React + Vite app
│   ├── src/
│   │   ├── api/           Axios client
│   │   ├── components/    Reusable UI pieces
│   │   │   ├── chat/      Message, Input, Typing indicator
│   │   │   └── layout/    Sidebar, AppLayout
│   │   ├── context/       Auth + Theme providers
│   │   ├── pages/         Login, Signup, Dashboard, Chat
│   │   └── App.jsx
│   └── Dockerfile
│
├── backend/               FastAPI app
│   ├── core/              Config, DB, JWT auth
│   ├── models/            Pydantic schemas
│   ├── routers/           auth, chats, messages, docs, dashboard
│   ├── services/          AI service, PDF service
│   ├── main.py
│   └── Dockerfile
│
└── docker-compose.yml
```

**Data flow for a chat message:**
```
User types → React sends POST /messages/
→ FastAPI saves user message to MongoDB
→ Fetches last 10 messages for context
→ If PDF selected: retrieves relevant chunks via TF-IDF
→ Calls Groq API with system prompt + context + history
→ Saves AI response to MongoDB
→ Returns response to frontend
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB (local or Atlas)
- Groq API key — free at [console.groq.com](https://console.groq.com)

### 1. Clone
```bash
git clone https://github.com/Akku980/prep-ai-placement-assistant
cd prep-ai-placement-assistant
```

### 2. Backend
```bash
cd backend
cp .env.example .env
# Edit .env — add GROQ_API_KEY and MONGODB_URL
pip install -r requirements.txt
uvicorn main:app --reload
# API runs at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
# App runs at http://localhost:5173
```

### With Docker (easiest)
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your keys
docker-compose up --build
# App at http://localhost, API at http://localhost:8000
```

---

## Environment Variables

**backend/.env**
```
MONGODB_URL=mongodb://localhost:27017
DB_NAME=prepai
JWT_SECRET=your-random-secret-string
JWT_ALGORITHM=HS256
JWT_EXPIRE_HOURS=168
GROQ_API_KEY=gsk_xxxxxxxxxxxx
OPENROUTER_API_KEY=sk-or-xxxx   # optional fallback
ALLOWED_ORIGINS=http://localhost:5173
```

**frontend/.env**
```
VITE_API_URL=http://localhost:8000
```

---

## Getting a Free Groq API Key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up (free, no credit card)
3. Create an API key
4. Paste it in `backend/.env` as `GROQ_API_KEY`

Groq gives 14,400 tokens/minute free on llama3-8b. More than enough for personal use.

---

## API Endpoints

Full interactive docs at `http://localhost:8000/docs`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/signup | Create account |
| POST | /auth/login | Login |
| GET | /auth/me | Current user |
| GET | /chats/ | All user chats |
| POST | /chats/ | New chat |
| PATCH | /chats/{id} | Rename chat |
| DELETE | /chats/{id} | Delete chat |
| GET | /chats/{id}/messages | Chat messages |
| POST | /messages/ | Send message + get AI reply |
| POST | /docs/upload | Upload PDF |
| GET | /docs/ | User's PDFs |
| DELETE | /docs/{id} | Delete PDF |
| GET | /dashboard/stats | Dashboard KPIs |

---

## Screenshots

*(Add screenshots after running locally)*

- `screenshots/dashboard.png` — Main dashboard
- `screenshots/chat_dsa.png` — DSA mode in action
- `screenshots/chat_hr.png` — HR interview practice
- `screenshots/dark_mode.png` — Dark theme

---

## Challenges I faced

**PDF Q&A without heavy dependencies** — Originally tried using `sentence-transformers` for embeddings but the model download was 400MB+ which felt overkill. Switched to a TF-IDF approach using just `sklearn` and `math` — works surprisingly well for retrieval on focused study material.

**Keeping AI responses in character** — Getting the DSA mentor to actually walk through problems step by step (not just give the answer) required several iterations of the system prompt. The mock interviewer mode was particularly tricky to balance — too easy and it's useless, too hard and it's discouraging.

**Token management** — Only sending the last 10 messages as context instead of the full chat history. Keeps costs/latency low while maintaining conversational coherence.

---

## Future improvements

- [ ] Streaming responses (server-sent events)
- [ ] Voice input for mock interviews
- [ ] Progress tracking dashboard (problems solved, topics covered)
- [ ] Shared interview rooms (multiplayer mock interview)
- [ ] Integration with LeetCode API to fetch problems directly
- [ ] Export chat as PDF for review

---

## Resume Description

> **PrepAI — AI Placement Assistant** | React · FastAPI · MongoDB · Groq API  
> - Built a full-stack AI chat platform for placement preparation with 6 specialized assistant modes (DSA, HR, Resume, CS, Mock Interview)  
> - Implemented JWT authentication, PDF Q&A with lightweight TF-IDF RAG, and persistent multi-session chat  
> - Integrated Groq (Llama3) and OpenRouter (Mistral) as free AI providers with automatic fallback  
> 🔗 github.com/Akku980/prep-ai-placement-assistant

---

*Built by Aakash — CSE Student, SRM Institute*  
*Questions? Open an issue or reach out on LinkedIn.*
