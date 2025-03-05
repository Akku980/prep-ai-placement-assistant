from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
from ..models.schemas import SignupRequest, LoginRequest
from ..core.auth import hash_password, verify_password, create_token, get_current_user
from ..core.database import get_db

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup")
async def signup(body: SignupRequest):
    db = get_db()
    existing = await db.users.find_one({"email": body.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = {
        "name": body.name,
        "email": body.email,
        "password": hash_password(body.password),
        "created_at": datetime.utcnow()
    }
    result = await db.users.insert_one(user)
    token = create_token(str(result.inserted_id))
    return {
        "token": token,
        "user": {"id": str(result.inserted_id), "name": body.name, "email": body.email}
    }

@router.post("/login")
async def login(body: LoginRequest):
    db = get_db()
    user = await db.users.find_one({"email": body.email})
    if not user or not verify_password(body.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_token(str(user["_id"]))
    return {
        "token": token,
        "user": {"id": str(user["_id"]), "name": user["name"], "email": user["email"]}
    }

@router.get("/me")
async def get_me(current_user=Depends(get_current_user)):
    return {"id": current_user["id"], "name": current_user["name"], "email": current_user["email"]}
