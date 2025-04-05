from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from datetime import datetime
from bson import ObjectId
from ..core.auth import (
    hash_password, verify_password,
    create_access_token, create_refresh_token,
    get_current_user,
)
from ..core.database import get_db
from jose import JWTError, jwt
from ..core.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])


class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class ForgotRequest(BaseModel):
    email: EmailStr


def _user_response(user: dict) -> dict:
    return {
        "id":    str(user["_id"]),
        "name":  user["name"],
        "email": user["email"],
        "avatar": user.get("avatar"),
        "provider": user.get("provider", "email"),
    }


@router.post("/signup")
async def signup(body: SignupRequest):
    if len(body.password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters")

    db = get_db()
    if await db.users.find_one({"email": body.email}):
        raise HTTPException(400, "An account with this email already exists")

    user = {
        "name":       body.name,
        "email":      body.email,
        "password":   hash_password(body.password),
        "provider":   "email",
        "created_at": datetime.utcnow(),
    }
    result = await db.users.insert_one(user)
    uid = str(result.inserted_id)

    return {
        "access_token":  create_access_token(uid),
        "refresh_token": create_refresh_token(uid),
        "user": {**_user_response(user), "id": uid},
    }


@router.post("/login")
async def login(body: LoginRequest):
    db = get_db()
    user = await db.users.find_one({"email": body.email})

    if not user or not verify_password(body.password, user["password"]):
        raise HTTPException(401, "Invalid email or password")

    uid = str(user["_id"])
    return {
        "access_token":  create_access_token(uid),
        "refresh_token": create_refresh_token(uid),
        "user": _user_response(user),
    }


@router.post("/refresh")
async def refresh(body: RefreshRequest):
    try:
        payload = jwt.decode(
            body.refresh_token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
        )
        if payload.get("type") != "refresh":
            raise HTTPException(401, "Invalid refresh token")
        uid = payload["sub"]
    except JWTError:
        raise HTTPException(401, "Invalid or expired refresh token")

    db = get_db()
    user = await db.users.find_one({"_id": ObjectId(uid)})
    if not user:
        raise HTTPException(401, "User not found")

    return {
        "access_token":  create_access_token(uid),
        "refresh_token": create_refresh_token(uid),
        "user": _user_response(user),
    }


@router.post("/forgot-password")
async def forgot_password(body: ForgotRequest):
    # In production: send real email via SendGrid/Resend
    # For now: acknowledge without revealing if email exists (security)
    db = get_db()
    user = await db.users.find_one({"email": body.email})
    if user:
        # TODO: send reset email
        pass
    return {"message": "If that email is registered, a reset link has been sent."}


@router.get("/me")
async def get_me(current_user=Depends(get_current_user)):
    return _user_response(current_user)


@router.post("/logout")
async def logout():
    # JWT is stateless — client deletes token
    # For real revocation, add token to a blocklist in Redis
    return {"message": "Logged out"}
