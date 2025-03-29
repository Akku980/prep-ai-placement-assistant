# Deploying PrepAI — Backend on Render

One-time 5-minute setup. After this, it runs permanently for free.

---

## Step 1 — Create Render account

Go to **[render.com](https://render.com)** → sign up with GitHub account.

---

## Step 2 — Deploy backend

1. Click **New +** → **Web Service**
2. Connect GitHub → Select **`prep-ai-placement-assistant`**
3. Fill in:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan:** Free

4. Add **Environment Variables** (values from your .env file):

| Key | Source |
|-----|--------|
| `MONGODB_URL` | Your MongoDB Atlas connection string |
| `DB_NAME` | `prepai` |
| `JWT_SECRET` | Any random 40+ char string |
| `JWT_ALGORITHM` | `HS256` |
| `JWT_EXPIRE_HOURS` | `168` |
| `GROQ_API_KEY` | Your Groq API key |
| `ALLOWED_ORIGINS` | `https://akku980.github.io` |

5. Click **Create Web Service** → wait ~3 min

Test: open `https://prepai-backend.onrender.com/health` → should return `{"status":"ok"}`

---

## Step 3 — Frontend is already live

**https://akku980.github.io/prep-ai-placement-assistant/app/**

Points to Render backend automatically. Sign up and start using it.

---

## Local development

```bash
# Backend
cd backend && cp .env.example .env  # fill in your keys
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend  
cd frontend && npm install && npm run dev
```

Open http://localhost:5173
