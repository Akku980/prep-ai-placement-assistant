import io
import re
import math
from collections import Counter
import PyPDF2

def extract_pdf_text(file_bytes: bytes) -> str:
    reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
    text = ""
    for page in reader.pages:
        t = page.extract_text()
        if t:
            text += t + "\n"
    return text.strip()

def chunk_text(text: str, chunk_size: int = 400, overlap: int = 50) -> list:
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
        i += chunk_size - overlap
        if i >= len(words):
            break
    return chunks

def _tokenize(text: str) -> list:
    return re.findall(r'\b[a-z]{2,}\b', text.lower())

def get_relevant_chunks(query: str, chunks: list, top_k: int = 4) -> str:
    if not chunks:
        return ""
    query_tokens = set(_tokenize(query))
    scored = []
    for i, chunk in enumerate(chunks):
        chunk_tokens = _tokenize(chunk)
        chunk_set = set(chunk_tokens)
        if not chunk_tokens:
            scored.append((i, 0.0))
            continue
        overlap = len(query_tokens & chunk_set)
        score = overlap / (math.sqrt(len(query_tokens)) * math.sqrt(len(chunk_set)) + 1e-9)
        scored.append((i, score))
    scored.sort(key=lambda x: x[1], reverse=True)
    top = [chunks[i] for i, _ in scored[:top_k] if scored[0][1] > 0]
    return "\n\n---\n\n".join(top) if top else ""
