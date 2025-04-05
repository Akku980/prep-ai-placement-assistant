from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .core.database import connect_db, close_db
from .core.config import settings
from .routers import auth, chats, messages, docs, dashboard


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()


app = FastAPI(
    title="PrepAI API",
    version="1.0.0",
    description="AI-powered placement preparation platform",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(chats.router)
app.include_router(messages.router)
app.include_router(docs.router)
app.include_router(dashboard.router)


@app.get("/")
async def root():
    return {"service": "PrepAI API", "status": "running", "docs": "/docs"}


@app.get("/health")
async def health():
    return {"status": "ok"}
