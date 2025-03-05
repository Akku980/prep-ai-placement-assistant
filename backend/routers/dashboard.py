from fastapi import APIRouter, Depends
from ..core.auth import get_current_user
from ..core.database import get_db

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats")
async def get_stats(current_user=Depends(get_current_user)):
    db = get_db()
    user_id = current_user["id"]

    total_chats = await db.chats.count_documents({"user_id": user_id})
    total_messages = await db.messages.count_documents({})  # approximate
    total_docs = await db.docs.count_documents({"user_id": user_id})

    recent_chats = await db.chats.find(
        {"user_id": user_id},
        sort=[("updated_at", -1)]
    ).to_list(5)

    for c in recent_chats:
        c["id"] = str(c.pop("_id"))

    return {
        "total_chats": total_chats,
        "total_docs": total_docs,
        "recent_chats": recent_chats
    }
