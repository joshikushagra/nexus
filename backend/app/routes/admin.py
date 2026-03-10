from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_user, require_roles, serialize
from app.core.security import hash_password
from app.db import get_db
from app.schemas import AdminUserCreate, AdminUserUpdate, AuditLogOut, IdResponse, MessageResponse, UserOut
from app.services.audit import write_audit_log

router = APIRouter(prefix='/admin', tags=['admin'])


@router.get('/users', response_model=list[UserOut])
async def list_users(
    include_inactive: bool = Query(default=True),
    db=Depends(get_db),
    current_user=Depends(require_roles('super_admin', 'admin')),
):
    query = {} if include_inactive else {'is_active': True}
    cursor = db.users.find(query, {'password_hash': 0}).sort('created_at', -1)
    docs = await cursor.to_list(length=500)
    return [serialize(doc) for doc in docs]


@router.post('/users', response_model=IdResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    payload: AdminUserCreate,
    db=Depends(get_db),
    current_user=Depends(require_roles('super_admin', 'admin')),
):
    exists = await db.users.find_one({'email': payload.email.lower()})
    if exists:
        raise HTTPException(status_code=400, detail='Email already exists')

    now = datetime.now(timezone.utc)
    doc = {
        'name': payload.name,
        'email': payload.email.lower(),
        'password_hash': hash_password(payload.password),
        'role': payload.role,
        'is_active': True,
        'created_at': now,
        'updated_at': now,
    }
    result = await db.users.insert_one(doc)
    created_id = str(result.inserted_id)

    await write_audit_log(db, current_user['id'], 'create', 'user', created_id, {'role': payload.role})
    return IdResponse(id=created_id)


@router.patch('/users/{user_id}', response_model=MessageResponse)
async def update_user(
    user_id: str,
    payload: AdminUserUpdate,
    db=Depends(get_db),
    current_user=Depends(require_roles('super_admin', 'admin')),
):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail='Invalid user id')

    changes = payload.model_dump(exclude_unset=True)
    if not changes:
        raise HTTPException(status_code=400, detail='No update fields provided')

    if current_user['id'] == user_id and changes.get('is_active') is False:
        raise HTTPException(status_code=400, detail='You cannot deactivate your own account')

    changes['updated_at'] = datetime.now(timezone.utc)

    result = await db.users.update_one({'_id': ObjectId(user_id)}, {'$set': changes})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail='User not found')

    await write_audit_log(db, current_user['id'], 'update', 'user', user_id, {'fields': list(changes.keys())})
    return MessageResponse(message='User updated')


@router.get('/audit-logs', response_model=list[AuditLogOut])
async def list_audit_logs(
    limit: int = Query(default=100, ge=1, le=500),
    skip: int = Query(default=0, ge=0),
    db=Depends(get_db),
    current_user=Depends(require_roles('super_admin', 'admin')),
):
    cursor = db.audit_logs.find({}).sort('created_at', -1).skip(skip).limit(limit)
    docs = await cursor.to_list(length=limit)
    return [serialize(doc) for doc in docs]


@router.get('/users/me', response_model=UserOut)
async def admin_me(current_user=Depends(get_current_user)):
    if current_user['role'] not in {'super_admin', 'admin'}:
        raise HTTPException(status_code=403, detail='Insufficient permissions')
    return current_user
