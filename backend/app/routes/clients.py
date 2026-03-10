import re
from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_user, require_roles, serialize
from app.db import get_db
from app.schemas import ClientAssignRequest, ClientCreate, ClientOut, ClientUpdate, IdResponse, MessageResponse
from app.services.audit import write_audit_log

router = APIRouter(prefix='/clients', tags=['clients'])


@router.get('', response_model=list[ClientOut])
async def list_clients(
    q: str | None = Query(default=None),
    status_filter: str | None = Query(default=None, alias='status'),
    assigned_to: str | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    skip: int = Query(default=0, ge=0),
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    query: dict = {}
    if q:
        escaped = re.escape(q)
        query['$or'] = [
            {'name': {'$regex': escaped, '$options': 'i'}},
            {'company': {'$regex': escaped, '$options': 'i'}},
            {'email': {'$regex': escaped, '$options': 'i'}},
        ]
    if status_filter:
        query['status'] = status_filter
    if assigned_to:
        query['assigned_to'] = assigned_to

    cursor = db.clients.find(query).sort('created_at', -1).skip(skip).limit(limit)
    docs = await cursor.to_list(length=limit)
    return [serialize(doc) for doc in docs]


@router.post('', response_model=IdResponse, status_code=status.HTTP_201_CREATED)
async def create_client(
    payload: ClientCreate,
    db=Depends(get_db),
    current_user=Depends(require_roles('super_admin', 'admin', 'manager', 'agent')),
):
    now = datetime.now(timezone.utc)
    doc = {
        'name': payload.name,
        'company': payload.company,
        'email': payload.email,
        'phone': payload.phone,
        'status': payload.status,
        'tags': payload.tags,
        'assigned_to': None,
        'created_by': current_user['id'],
        'created_at': now,
        'updated_at': now,
    }
    result = await db.clients.insert_one(doc)
    client_id = str(result.inserted_id)
    await write_audit_log(db, current_user['id'], 'create', 'client', client_id, {'name': payload.name})
    return IdResponse(id=client_id)


@router.get('/{client_id}', response_model=ClientOut)
async def get_client(client_id: str, db=Depends(get_db), current_user=Depends(get_current_user)):
    if not ObjectId.is_valid(client_id):
        raise HTTPException(status_code=400, detail='Invalid client id')

    client = await db.clients.find_one({'_id': ObjectId(client_id)})
    if not client:
        raise HTTPException(status_code=404, detail='Client not found')

    return serialize(client)


@router.patch('/{client_id}', response_model=MessageResponse)
async def update_client(
    client_id: str,
    payload: ClientUpdate,
    db=Depends(get_db),
    current_user=Depends(require_roles('super_admin', 'admin', 'manager', 'agent')),
):
    if not ObjectId.is_valid(client_id):
        raise HTTPException(status_code=400, detail='Invalid client id')

    changes = payload.model_dump(exclude_unset=True)
    if not changes:
        raise HTTPException(status_code=400, detail='No update fields provided')

    if changes.get('assigned_to') is not None:
        assignee_id = changes['assigned_to']
        if not ObjectId.is_valid(assignee_id):
            raise HTTPException(status_code=400, detail='Invalid assignee id')
        assignee = await db.users.find_one({'_id': ObjectId(assignee_id), 'is_active': True})
        if not assignee:
            raise HTTPException(status_code=404, detail='Assignee not found')

    changes['updated_at'] = datetime.now(timezone.utc)
    result = await db.clients.update_one({'_id': ObjectId(client_id)}, {'$set': changes})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail='Client not found')

    await write_audit_log(db, current_user['id'], 'update', 'client', client_id, {'fields': list(changes.keys())})
    return MessageResponse(message='Client updated')


@router.post('/{client_id}/assign', response_model=MessageResponse)
async def assign_client(
    client_id: str,
    payload: ClientAssignRequest,
    db=Depends(get_db),
    current_user=Depends(require_roles('super_admin', 'admin', 'manager')),
):
    if not ObjectId.is_valid(client_id):
        raise HTTPException(status_code=400, detail='Invalid client id')
    if not ObjectId.is_valid(payload.assignee_id):
        raise HTTPException(status_code=400, detail='Invalid assignee id')

    assignee = await db.users.find_one({'_id': ObjectId(payload.assignee_id), 'is_active': True})
    if not assignee:
        raise HTTPException(status_code=404, detail='Assignee not found')

    result = await db.clients.update_one(
        {'_id': ObjectId(client_id)},
        {'$set': {'assigned_to': payload.assignee_id, 'updated_at': datetime.now(timezone.utc)}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail='Client not found')

    await write_audit_log(
        db,
        current_user['id'],
        'assign',
        'client',
        client_id,
        {'assignee_id': payload.assignee_id},
    )
    return MessageResponse(message='Client assigned')


@router.delete('/{client_id}', response_model=MessageResponse)
async def delete_client(
    client_id: str,
    db=Depends(get_db),
    current_user=Depends(require_roles('super_admin', 'admin', 'manager')),
):
    if not ObjectId.is_valid(client_id):
        raise HTTPException(status_code=400, detail='Invalid client id')

    result = await db.clients.delete_one({'_id': ObjectId(client_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail='Client not found')

    await db.tasks.delete_many({'client_id': client_id})
    await write_audit_log(db, current_user['id'], 'delete', 'client', client_id)
    return MessageResponse(message='Client deleted')
