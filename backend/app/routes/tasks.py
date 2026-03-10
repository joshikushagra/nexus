from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_user, require_roles, serialize
from app.db import get_db
from app.schemas import IdResponse, MessageResponse, TaskCreate, TaskOut, TaskUpdate
from app.services.audit import write_audit_log

router = APIRouter(prefix='/tasks', tags=['tasks'])


@router.get('', response_model=list[TaskOut])
async def list_tasks(
    status_filter: str | None = Query(default=None, alias='status'),
    client_id: str | None = Query(default=None),
    assigned_to: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    skip: int = Query(default=0, ge=0),
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    query: dict = {}
    if status_filter:
        query['status'] = status_filter
    if client_id:
        query['client_id'] = client_id
    if assigned_to:
        query['assigned_to'] = assigned_to

    cursor = db.tasks.find(query).sort('created_at', -1).skip(skip).limit(limit)
    docs = await cursor.to_list(length=limit)
    return [serialize(doc) for doc in docs]


@router.get('/{task_id}', response_model=TaskOut)
async def get_task(task_id: str, db=Depends(get_db), current_user=Depends(get_current_user)):
    if not ObjectId.is_valid(task_id):
        raise HTTPException(status_code=400, detail='Invalid task id')

    task = await db.tasks.find_one({'_id': ObjectId(task_id)})
    if not task:
        raise HTTPException(status_code=404, detail='Task not found')

    return serialize(task)


@router.post('', response_model=IdResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    payload: TaskCreate,
    db=Depends(get_db),
    current_user=Depends(require_roles('super_admin', 'admin', 'manager', 'agent')),
):
    if not ObjectId.is_valid(payload.client_id):
        raise HTTPException(status_code=400, detail='Invalid client id')

    client = await db.clients.find_one({'_id': ObjectId(payload.client_id)})
    if not client:
        raise HTTPException(status_code=404, detail='Client not found')

    if payload.assigned_to is not None:
        if not ObjectId.is_valid(payload.assigned_to):
            raise HTTPException(status_code=400, detail='Invalid assignee id')
        assignee = await db.users.find_one({'_id': ObjectId(payload.assigned_to), 'is_active': True})
        if not assignee:
            raise HTTPException(status_code=404, detail='Assignee not found')

    now = datetime.now(timezone.utc)
    doc = {
        'client_id': payload.client_id,
        'title': payload.title,
        'description': payload.description,
        'status': 'todo',
        'due_date': payload.due_date,
        'assigned_to': payload.assigned_to,
        'created_by': current_user['id'],
        'created_at': now,
        'updated_at': now,
    }
    result = await db.tasks.insert_one(doc)
    task_id = str(result.inserted_id)
    await write_audit_log(db, current_user['id'], 'create', 'task', task_id, {'title': payload.title})
    return IdResponse(id=task_id)


@router.patch('/{task_id}', response_model=MessageResponse)
async def update_task(
    task_id: str,
    payload: TaskUpdate,
    db=Depends(get_db),
    current_user=Depends(require_roles('super_admin', 'admin', 'manager', 'agent')),
):
    if not ObjectId.is_valid(task_id):
        raise HTTPException(status_code=400, detail='Invalid task id')

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
    result = await db.tasks.update_one({'_id': ObjectId(task_id)}, {'$set': changes})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail='Task not found')

    await write_audit_log(db, current_user['id'], 'update', 'task', task_id, {'fields': list(changes.keys())})
    return MessageResponse(message='Task updated')


@router.delete('/{task_id}', response_model=MessageResponse)
async def delete_task(
    task_id: str,
    db=Depends(get_db),
    current_user=Depends(require_roles('super_admin', 'admin', 'manager', 'agent')),
):
    if not ObjectId.is_valid(task_id):
        raise HTTPException(status_code=400, detail='Invalid task id')

    result = await db.tasks.delete_one({'_id': ObjectId(task_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail='Task not found')

    await write_audit_log(db, current_user['id'], 'delete', 'task', task_id)
    return MessageResponse(message='Task deleted')
