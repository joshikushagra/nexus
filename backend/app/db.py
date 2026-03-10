from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import get_settings

mongo_client: AsyncIOMotorClient | None = None
mongo_db: AsyncIOMotorDatabase | None = None


async def ensure_indexes(db: AsyncIOMotorDatabase) -> None:
    await db.users.create_index('email', unique=True)
    await db.users.create_index('role')
    await db.users.create_index('is_active')

    await db.clients.create_index('name')
    await db.clients.create_index('status')
    await db.clients.create_index('assigned_to')
    await db.clients.create_index('created_at')

    await db.tasks.create_index('client_id')
    await db.tasks.create_index('status')
    await db.tasks.create_index('assigned_to')
    await db.tasks.create_index('created_at')

    await db.audit_logs.create_index('created_at')
    await db.audit_logs.create_index('entity_type')
    await db.audit_logs.create_index('entity_id')


async def connect_to_mongo() -> None:
    global mongo_client, mongo_db
    settings = get_settings()
    mongo_client = AsyncIOMotorClient(settings.mongodb_uri, serverSelectionTimeoutMS=5000)
    await mongo_client.admin.command('ping')
    mongo_db = mongo_client[settings.mongodb_db]
    await ensure_indexes(mongo_db)


async def close_mongo() -> None:
    global mongo_client, mongo_db
    if mongo_client:
        mongo_client.close()
    mongo_client = None
    mongo_db = None


def get_db() -> AsyncIOMotorDatabase:
    if mongo_db is None:
        raise RuntimeError('Mongo not initialized')
    return mongo_db
