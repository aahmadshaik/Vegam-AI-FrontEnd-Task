from typing import Optional, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, asc, desc
from sqlalchemy.orm import selectinload
from .models import User

SORTABLE = {
    "name": User.name,
    "email": User.email,
    "createdAt": User.created_at,
    "status": User.status,
}

async def get_users(db: AsyncSession, query: Optional[str]=None, status: Optional[str]=None,
                    page: int=1, page_size: int=10, sort_by: Optional[str]=None, sort_dir: Optional[str]="asc") -> Tuple[int, List[User]]:
    stmt = select(User).options(selectinload(User.groups))
    if query:
        q = f"%{query}%"
        stmt = stmt.where(or_(User.name.ilike(q), User.email.ilike(q)))
    if status in ("active", "inactive"):
        stmt = stmt.where(User.status == status)
    count_stmt = stmt.with_only_columns(func.count(User.id)).order_by(None)
    total_count = (await db.execute(count_stmt)).scalar_one()
    if sort_by in SORTABLE:
        col = SORTABLE[sort_by]
        stmt = stmt.order_by(asc(col) if (sort_dir or "asc").lower() == "asc" else desc(col))
    else:
        stmt = stmt.order_by(desc(User.created_at))
    if page < 1:
        page = 1
    if page_size < 1:
        page_size = 10
    stmt = stmt.offset((page-1)*page_size).limit(page_size)
    result = await db.execute(stmt)
    users = result.scalars().unique().all()
    return total_count, users

async def toggle_user_status(db: AsyncSession, user_id: str):
    result = await db.execute(select(User).where(User.id == user_id).options(selectinload(User.groups)))
    user = result.scalar_one_or_none()
    if not user:
        return None
    user.status = "inactive" if user.status == "active" else "active"
    await db.commit()
    await db.refresh(user)
    return user