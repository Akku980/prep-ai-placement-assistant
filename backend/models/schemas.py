from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# Auth
class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    token: str
    user: dict

# Chat
class CreateChatRequest(BaseModel):
    title: Optional[str] = "New Chat"
    mode: Optional[str] = "general"

class RenameChatRequest(BaseModel):
    title: str

class SendMessageRequest(BaseModel):
    chat_id: str
    content: str
    mode: Optional[str] = "general"
    doc_id: Optional[str] = None

# Doc
class DocResponse(BaseModel):
    id: str
    filename: str
    uploaded_at: datetime
    chunk_count: int

