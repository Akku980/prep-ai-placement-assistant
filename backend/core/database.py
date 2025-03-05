from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings

client: AsyncIOMotorClient = None
db = None

async def connect_db():
    global client, db
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.db_name]
    # indexes
    await db.users.create_index("email", unique=True)
    await db.chats.create_index("user_id")
    await db.messages.create_index("chat_id")
    await db.docs.create_index("user_id")
    print("MongoDB connected")

async def close_db():
    if client:
        client.close()

def get_db():
    return db
