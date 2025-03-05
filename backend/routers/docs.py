from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from datetime import datetime
from bson import ObjectId
from ..core.auth import get_current_user
from ..core.database import get_db
from ..services.pdf_service import extract_pdf_text, chunk_text

router = APIRouter(prefix="/docs", tags=["docs"])

@router.post("/upload")
async def upload_doc(file: UploadFile = File(...), current_user=Depends(get_current_user)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files supported")

    content = await file.read()
    if len(content) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    text = extract_pdf_text(content)
    if not text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from PDF")

    chunks = chunk_text(text)
    db = get_db()
    doc = {
        "user_id": current_user["id"],
        "filename": file.filename,
        "chunks": chunks,
        "chunk_count": len(chunks),
        "uploaded_at": datetime.utcnow()
    }
    result = await db.docs.insert_one(doc)
    return {
        "id": str(result.inserted_id),
        "filename": file.filename,
        "chunk_count": len(chunks),
        "uploaded_at": doc["uploaded_at"]
    }

@router.get("/")
async def get_docs(current_user=Depends(get_current_user)):
    db = get_db()
    docs = await db.docs.find(
        {"user_id": current_user["id"]},
        {"chunks": 0}  # don't return chunks in list
    ).to_list(20)
    result = []
    for d in docs:
        result.append({
            "id": str(d["_id"]),
            "filename": d["filename"],
            "chunk_count": d.get("chunk_count", 0),
            "uploaded_at": d["uploaded_at"]
        })
    return result

@router.delete("/{doc_id}")
async def delete_doc(doc_id: str, current_user=Depends(get_current_user)):
    db = get_db()
    await db.docs.delete_one({"_id": ObjectId(doc_id), "user_id": current_user["id"]})
    return {"message": "Deleted"}
