import httpx
from ..core.config import settings

SYSTEM_PROMPTS = {
    "general": "You are PrepAI, a helpful placement preparation assistant for engineering students. Be concise, practical, and encouraging.",

    "dsa": """You are a DSA Mentor helping engineering students crack coding interviews.
When given a problem:
1. First understand and restate the problem
2. Suggest the approach (brute force → optimal)
3. Walk through the solution with clean code
4. Analyze time & space complexity
5. Mention edge cases
Be patient, use examples, and encourage the student.""",

    "hr": """You are an experienced HR Interview Coach preparing students for placement interviews.
- Ask one behavioral question at a time
- Give constructive feedback on answers
- Suggest the STAR method where relevant
- Be encouraging but honest
- Help improve communication and confidence""",

    "resume": """You are a Resume Expert who helps students get shortlisted for top tech companies.
Review resumes with attention to:
- ATS optimization
- Impact-driven bullet points
- Quantifiable achievements
- Skills section relevance
- Project descriptions
Give specific, actionable improvements.""",

    "cs": """You are a CS Fundamentals Tutor covering OS, DBMS, Computer Networks, OOP, and System Design.
- Give clear, interview-focused explanations
- Use analogies for complex topics
- Include common interview questions on each topic
- Keep answers concise but complete
- Add quick revision tips""",

    "mock": """You are a Technical Interviewer conducting a realistic mock interview.
- Start with a brief intro
- Ask one question at a time (mix of technical + HR)
- Evaluate answers and give scores /10
- Give specific feedback after each answer
- Keep the pressure realistic but fair
- End with an overall assessment"""
}

async def get_ai_response(messages: list, mode: str = "general") -> str:
    system = SYSTEM_PROMPTS.get(mode, SYSTEM_PROMPTS["general"])
    full_messages = [{"role": "system", "content": system}] + messages

    # Try Groq first
    if settings.groq_api_key:
        try:
            response = await _call_groq(full_messages)
            if response:
                return response
        except Exception as e:
            print(f"Groq failed: {e}")

    # Fallback to OpenRouter
    if settings.openrouter_api_key:
        try:
            response = await _call_openrouter(full_messages)
            if response:
                return response
        except Exception as e:
            print(f"OpenRouter failed: {e}")

    return "I'm having trouble connecting to the AI right now. Please check your API keys in the backend .env file."

async def _call_groq(messages: list) -> str:
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {settings.groq_api_key}"},
            json={
                "model": "llama3-8b-8192",
                "messages": messages,
                "max_tokens": 1024,
                "temperature": 0.7
            }
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]

async def _call_openrouter(messages: list) -> str:
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.openrouter_api_key}",
                "HTTP-Referer": "https://github.com/Akku980/prep-ai-placement-assistant"
            },
            json={
                "model": "mistralai/mistral-7b-instruct:free",
                "messages": messages,
                "max_tokens": 1024
            }
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]
