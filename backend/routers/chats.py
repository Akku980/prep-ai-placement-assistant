from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from bson import ObjectId
from ..models.schemas import CreateChatRequest, RenameChatRequest
from ..core.auth import get_current_user
from ..core.database import get_db

router = APIRouter(prefix="/chats", tags=["chats"])

def serialize(doc):
    doc["id"] = str(doc.pop("_id"))
    return doc

@router.get("/")
async def get_chats(current_user=Depends(get_current_user)):
    db = get_db()
    chats = await db.chats.find(
        {"user_id": current_user["id"]},
        sort=[("updated_at", -1)]
    ).to_list(50)
    return [serialize(c) for c in chats]

@router.post("/")
async def create_chat(body: CreateChatRequest, current_user=Depends(get_current_user)):
    db = get_db()
    chat = {
        "user_id": current_user["id"],
        "title": body.title,
        "mode": body.mode,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    result = await db.chats.insert_one(chat)
    chat["id"] = str(result.inserted_id)
    chat.pop("_id", None)
    return chat

@router.patch("/{chat_id}")
async def rename_chat(chat_id: str, body: RenameChatRequest, current_user=Depends(get_current_user)):
    db = get_db()
    result = await db.chats.update_one(
        {"_id": ObjectId(chat_id), "user_id": current_user["id"]},
        {"$set": {"title": body.title, "updated_at": datetime.utcnow()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Chat not found")
    return {"message": "Renamed"}

@router.delete("/{chat_id}")
async def delete_chat(chat_id: str, current_user=Depends(get_current_user)):
    db = get_db()
    await db.chats.delete_one({"_id": ObjectId(chat_id), "user_id": current_user["id"]})
    await db.messages.delete_many({"chat_id": chat_id})
    return {"message": "Deleted"}

@router.get("/{chat_id}/messages")
async def get_messages(chat_id: str, current_user=Depends(get_current_user)):
    db = get_db()
    chat = await db.chats.find_one({"_id": ObjectId(chat_id), "user_id": current_user["id"]})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    messages = await db.messages.find(
        {"chat_id": chat_id},
        sort=[("created_at", 1)]
    ).to_list(200)
    return [serialize(m) for m in messages]
