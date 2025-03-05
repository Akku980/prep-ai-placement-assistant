from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from bson import ObjectId
from ..models.schemas import SendMessageRequest
from ..core.auth import get_current_user
from ..core.database import get_db
from ..services.ai_service import get_ai_response
from ..services.pdf_service import get_relevant_chunks

router = APIRouter(prefix="/messages", tags=["messages"])

@router.post("/")
async def send_message(body: SendMessageRequest, current_user=Depends(get_current_user)):
    db = get_db()

    # Verify chat belongs to user
    chat = await db.chats.find_one({"_id": ObjectId(body.chat_id), "user_id": current_user["id"]})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    # Save user message
    user_msg = {
        "chat_id": body.chat_id,
        "role": "user",
        "content": body.content,
        "created_at": datetime.utcnow()
    }
    await db.messages.insert_one(user_msg)

    # Build conversation history (last 10 messages for context)
    history = await db.messages.find(
        {"chat_id": body.chat_id},
        sort=[("created_at", -1)]
    ).to_list(10)
    history.reverse()
    messages = [{"role": m["role"], "content": m["content"]} for m in history]

    # If doc_id provided, inject relevant PDF context
    mode = body.mode or chat.get("mode", "general")
    if body.doc_id:
        doc = await db.docs.find_one({"_id": ObjectId(body.doc_id), "user_id": current_user["id"]})
        if doc and doc.get("chunks"):
            relevant = get_relevant_chunks(body.content, doc["chunks"])
            if relevant:
                context_msg = {
                    "role": "system",
                    "content": f"Use this document context to answer:\n\n{relevant}\n\nIf the answer isn't in the context, say so."
                }
                messages.insert(0, context_msg)

    # Get AI response
    ai_reply = await get_ai_response(messages, mode)

    # Save AI message
    ai_msg = {
        "chat_id": body.chat_id,
        "role": "assistant",
        "content": ai_reply,
        "created_at": datetime.utcnow()
    }
    result = await db.messages.insert_one(ai_msg)

    # Auto-title chat from first message
    if chat.get("title") == "New Chat":
        short_title = body.content[:40] + ("..." if len(body.content) > 40 else "")
        await db.chats.update_one(
            {"_id": ObjectId(body.chat_id)},
            {"$set": {"title": short_title, "updated_at": datetime.utcnow()}}
        )
    else:
        await db.chats.update_one(
            {"_id": ObjectId(body.chat_id)},
            {"$set": {"updated_at": datetime.utcnow()}}
        )

    return {
        "id": str(result.inserted_id),
        "role": "assistant",
        "content": ai_reply,
        "created_at": ai_msg["created_at"]
    }
