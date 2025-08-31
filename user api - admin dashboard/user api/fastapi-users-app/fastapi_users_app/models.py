import uuid
from datetime import datetime
from sqlalchemy import Column, Integer, String, Enum, DateTime, Table, ForeignKey, Index
from sqlalchemy.orm import relationship
import enum
from .database import Base


class UserStatus(str, enum.Enum):
    active = "active"
    inactive = "inactive"


class GroupRole(str, enum.Enum):
    admin = "admin"
    manager = "manager"
    member = "member"


user_groups = Table(
    "user_groups",
    Base.metadata,
    Column("user_id", String, ForeignKey("users.id"), primary_key=True),
    Column("group_id", String, ForeignKey("groups.id"), primary_key=True),
)


class Group(Base):
    __tablename__ = "groups"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False, index=True)
    role = Column(Enum(GroupRole), nullable=False, index=True)
    users = relationship("User", secondary=user_groups, back_populates="groups")
    role_id = Column(Integer, nullable=False, index=True)


class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    status = Column(
        Enum(UserStatus), default=UserStatus.active, nullable=False, index=True
    )
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    groups = relationship("Group", secondary=user_groups, back_populates="users")
    __table_args__ = (Index("ix_users_name_email", "name", "email"),)
