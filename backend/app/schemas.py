from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


Role = Literal['super_admin', 'admin', 'manager', 'agent', 'viewer']
ClientStatus = Literal['lead', 'active', 'inactive', 'archived']
TaskStatus = Literal['todo', 'in_progress', 'done', 'blocked']


class MessageResponse(BaseModel):
    message: str


class IdResponse(BaseModel):
    id: str


class BootstrapAdminRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = 'bearer'


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    email: EmailStr
    role: Role
    is_active: bool
    created_at: datetime
    updated_at: datetime


class ClientCreate(BaseModel):
    name: str = Field(min_length=2, max_length=180)
    company: str | None = Field(default=None, max_length=180)
    email: EmailStr | None = None
    phone: str | None = Field(default=None, max_length=30)
    status: ClientStatus = 'lead'
    tags: list[str] = Field(default_factory=list)


class ClientUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=180)
    company: str | None = Field(default=None, max_length=180)
    email: EmailStr | None = None
    phone: str | None = Field(default=None, max_length=30)
    status: ClientStatus | None = None
    tags: list[str] | None = None
    assigned_to: str | None = None


class ClientAssignRequest(BaseModel):
    assignee_id: str


class ClientOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    company: str | None
    email: EmailStr | None
    phone: str | None
    status: ClientStatus
    tags: list[str]
    assigned_to: str | None
    created_by: str
    created_at: datetime
    updated_at: datetime


class TaskCreate(BaseModel):
    client_id: str
    title: str = Field(min_length=2, max_length=180)
    description: str | None = Field(default=None, max_length=500)
    due_date: datetime | None = None
    assigned_to: str | None = None


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=180)
    description: str | None = Field(default=None, max_length=500)
    due_date: datetime | None = None
    status: TaskStatus | None = None
    assigned_to: str | None = None


class TaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    client_id: str
    title: str
    description: str | None
    status: TaskStatus
    due_date: datetime | None
    assigned_to: str | None
    created_by: str
    created_at: datetime
    updated_at: datetime


class AdminUserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    role: Literal['admin', 'manager', 'agent', 'viewer'] = 'agent'


class AdminUserUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    role: Literal['admin', 'manager', 'agent', 'viewer'] | None = None
    is_active: bool | None = None


class AuditLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    actor_id: str
    action: str
    entity_type: str
    entity_id: str
    meta: dict
    created_at: datetime
