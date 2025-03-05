import io
import re
import math
from collections import Counter
import PyPDF2

def extract_pdf_text(file_bytes: bytes) -> str:
    reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    return text.strip()

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
        i += chunk_size - overlap
    return chunks

def simple_tfidf_similarity(query: str, chunks: list[str]) -> list[tuple[int, float]]:
    """Lightweight TF-IDF similarity — no heavy ML dependencies needed"""
    def tokenize(text):
        return re.findall(r'\b\w+\b', text.lower())

    query_tokens = tokenize(query)
    query_freq = Counter(query_tokens)

    scores = []
    for i, chunk in enumerate(chunks):
        chunk_tokens = tokenize(chunk)
        chunk_freq = Counter(chunk_tokens)

        # TF for query terms in chunk
        score = 0
        for term in query_tokens:
            tf = chunk_freq.get(term, 0) / max(len(chunk_tokens), 1)
            # simple IDF approximation
            idf = math.log(len(chunks) / (1 + sum(1 for c in chunks if term in c.lower())))
            score += tf * idf

        scores.append((i, score))

    return sorted(scores, key=lambda x: x[1], reverse=True)

def get_relevant_chunks(query: str, chunks: list[str], top_k: int = 4) -> str:
    if not chunks:
        return ""
    ranked = simple_tfidf_similarity(query, chunks)
    top_chunks = [chunks[i] for i, _ in ranked[:top_k]]
    return "\n\n---\n\n".join(top_chunks)
