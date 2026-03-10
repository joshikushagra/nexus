from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.db import get_db
from app.schemas import BootstrapAdminRequest, IdResponse, LoginRequest, TokenResponse, UserOut

router = APIRouter(prefix='/auth', tags=['auth'])


@router.post('/bootstrap-admin', response_model=IdResponse, status_code=status.HTTP_201_CREATED)
async def bootstrap_admin(payload: BootstrapAdminRequest, db=Depends(get_db)):
    count = await db.users.count_documents({})
    if count > 0:
        raise HTTPException(status_code=400, detail='Bootstrap already completed')

    exists = await db.users.find_one({'email': payload.email.lower()})
    if exists:
        raise HTTPException(status_code=400, detail='Email already exists')

    now = datetime.now(timezone.utc)
    doc = {
        'name': payload.name,
        'email': payload.email.lower(),
        'password_hash': hash_password(payload.password),
        'role': 'super_admin',
        'is_active': True,
        'created_at': now,
        'updated_at': now,
    }
    result = await db.users.insert_one(doc)
    return IdResponse(id=str(result.inserted_id))


@router.post('/login', response_model=TokenResponse)
async def login(payload: LoginRequest, db=Depends(get_db)):
    user = await db.users.find_one({'email': payload.email.lower(), 'is_active': True})
    if not user or not verify_password(payload.password, user['password_hash']):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid credentials')

    access_token = create_access_token(subject=str(user['_id']), role=user['role'])
    return TokenResponse(access_token=access_token)


@router.get('/me', response_model=UserOut)
async def me(current_user=Depends(get_current_user)):
    return current_user
