from bson import ObjectId
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.security import decode_token
from app.db import get_db

security = HTTPBearer(auto_error=False)


def serialize(document: dict | None) -> dict | None:
    if not document:
        return None
    doc = dict(document)
    if '_id' in doc:
        doc['id'] = str(doc.pop('_id'))
    return doc


async def get_current_user(credentials: HTTPAuthorizationCredentials | None = Depends(security), db=Depends(get_db)):
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Missing authorization header')

    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid token')

    user_id = payload.get('sub')
    if not user_id or not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid token payload')

    user = await db.users.find_one({'_id': ObjectId(user_id), 'is_active': True}, {'password_hash': 0})
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='User not found')

    return serialize(user)


def require_roles(*allowed_roles: str):
    async def guard(current_user=Depends(get_current_user)):
        if current_user['role'] not in allowed_roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Insufficient permissions')
        return current_user

    return guard
