from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.db import close_mongo, connect_to_mongo
from app.routes import admin, auth, clients, tasks


@asynccontextmanager
async def lifespan(_: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo()


settings = get_settings()
app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(auth.router, prefix='/api/v1')
app.include_router(clients.router, prefix='/api/v1')
app.include_router(tasks.router, prefix='/api/v1')
app.include_router(admin.router, prefix='/api/v1')


@app.get('/', include_in_schema=False)
async def root():
    return {'name': settings.app_name, 'docs': '/docs'}


@app.get('/health', tags=['system'])
async def health():
    return {'status': 'ok'}
