from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from .database import get_db
from . import crud, schemas

router = APIRouter(prefix="/users", tags=["users"])


# @router.get("/", response_model=schemas.DataEnvelope)
# async def list_users(
#     query: str | None = Query(default=None),
#     status: str | None = Query(default=None),
#     page: int = Query(default=1, ge=1),
#     pageSize: int = Query(default=10, ge=1, le=100),
#     sortBy: str | None = Query(default=None),
#     sortDir: str | None = Query(default="asc"),
#     db: AsyncSession = Depends(get_db),
# ):
#     total_count, users = await crud.get_users(
#         db=db,
#         query=query,
#         status=status,
#         page=page,
#         page_size=pageSize,
#         sort_by=sortBy,
#         sort_dir=sortDir,
#     )
#     users_out = []
#     for u in users:
#         users_out.append(
#             {
#                 "id": u.id,
#                 "name": u.name,
#                 "email": u.email,
#                 "status": u.status.value if hasattr(u.status, "value") else u.status,
#                 "createdAt": u.created_at,
#                 "groups": [
#                     {
#                         "id": g.id,
#                         "name": g.name,
#                         "role": g.role.value if hasattr(g.role, "value") else g.role,
#                     }
#                     for g in u.groups
#                 ],
#             }
#         )
#     return {"data": {"totalCount": total_count, "users": users_out}}
# from fastapi import APIRouter, Depends
# from sqlalchemy.ext.asyncio import AsyncSession
# from .database import get_db
# from . import crud

# router = APIRouter(prefix="/users", tags=["users"])


# @router.get("/")
# async def list_all_users(db: AsyncSession = Depends(get_db)):
#     # Fetch all users without filtering, pagination, or sorting
#     total_count, users = await crud.get_users(
#         db=db, page=1, page_size=1000
#     )  # you can adjust page_size

#     users_out = []
#     for u in users:
#         user_dict = {
#             "userId": str(u.id),
#             "Name": u.name,
#             "Email": u.email,
#             "Status": u.status.value if hasattr(u.status, "value") else u.status,
#             "CreatedAt": u.created_at.isoformat(),
#             "groups": [],
#         }
#         for g in u.groups:
#             group_dict = {
#                 "groupId": str(g.id),
#                 "groupName": g.name,
#                 "roles": [
#                     {
#                         "roleId": str(r.id),
#                         "roleName": r.name,
#                     }
#                     for r in getattr(g, "roles", [])
#                 ],
#             }
#             user_dict["groups"].append(group_dict)

#         users_out.append(user_dict)

#     return {
#         "data": {
#             "totalCount": total_count,
#             "users": users_out,
#         }
#     }


# @router.patch("/{user_id}", response_model=schemas.UserOut)
# async def patch_user_toggle_status(user_id: str, db: AsyncSession = Depends(get_db)):
#     user = await crud.toggle_user_status(db, user_id)
#     if not user:
#         raise HTTPException(status_code=404, detail="User not found")
#     return {
#         "id": user.id,
#         "name": user.name,
#         "email": user.email,
#         "status": user.status.value if hasattr(user.status, "value") else user.status,
#         "createdAt": user.created_at,
#         "groups": [
#             {
#                 "id": g.id,
#                 "name": g.name,
#                 "role": g.role.value if hasattr(g.role, "value") else g.role,
#             }
#             for g in user.groups
#         ],
#     }


# @router.post("/{user_id}", response_model=schemas.UserOut)
# async def post_user_toggle_status(user_id: str, db: AsyncSession = Depends(get_db)):
#     return await patch_user_toggle_status(user_id, db)
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from .database import get_db
from . import crud

router = APIRouter(prefix="/users", tags=["users"])


def transform_user(u):
    """Transform SQLAlchemy User object into UI-friendly dict."""
    return {
        "userId": str(u.id),
        "Name": u.name,
        "Email": u.email,
        "Status": u.status.value if hasattr(u.status, "value") else u.status,
        "CreatedAt": u.created_at.isoformat(),
        "groups": [
            {
                "groupId": str(g.id),
                "groupName": g.name,
                "roles": [
                    {
                        "role_id": str(getattr(g, "role_id", "unknown")),
                        "roleName": (
                            g.role.name if hasattr(g.role, "name") else str(g.role)
                        ),
                    }
                ],
            }
            for g in u.groups
        ],
    }


@router.get("/")
async def list_all_users(db: AsyncSession = Depends(get_db)):
    total_count, users = await crud.get_users(db=db, page=1, page_size=1000)
    users_out = [transform_user(u) for u in users]

    return {
        "data": {
            "totalCount": total_count,
            "users": users_out,
        }
    }


@router.patch("/{user_id}")
async def patch_user_toggle_status(user_id: str, db: AsyncSession = Depends(get_db)):
    user = await crud.toggle_user_status(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "data": {
            "totalCount": 1,
            "users": [transform_user(user)],
        }
    }


@router.post("/{user_id}")
async def post_user_toggle_status(user_id: str, db: AsyncSession = Depends(get_db)):
    return await patch_user_toggle_status(user_id, db)
