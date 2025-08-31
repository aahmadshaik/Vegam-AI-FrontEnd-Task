from typing import List, Literal
from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict

UserStatus = Literal["active", "inactive"]
GroupRole = Literal["admin", "manager", "member"]


class GroupOut(BaseModel):
    id: str
    name: str
    role: GroupRole
    role_id: int
    model_config = ConfigDict(from_attributes=True)


class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    status: UserStatus
    createdAt: datetime
    groups: List[GroupOut] = []
    model_config = ConfigDict(from_attributes=True)


class UsersList(BaseModel):
    totalCount: int
    users: List[UserOut]


class DataEnvelope(BaseModel):
    data: UsersList
