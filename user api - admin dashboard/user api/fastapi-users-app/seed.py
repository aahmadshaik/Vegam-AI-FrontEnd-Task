import asyncio, random
from faker import Faker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from fastapi_users_app.database import Base, engine as app_engine, async_session
from fastapi_users_app.models import User, Group, GroupRole, UserStatus

fake = Faker()

async def seed():
    # recreate tables
    async with app_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as session:
        # create pool of groups
        roles = [GroupRole.admin, GroupRole.manager, GroupRole.member]
        groups = []
        for i in range(10):
            g = Group(name=f"{fake.word().capitalize()} Group", role=random.choice(roles))
            session.add(g)
            groups.append(g)
        await session.flush()

        # create 100 users
        for _ in range(100):
            user = User(
                name=fake.name(),
                email=fake.unique.email(),
                status=random.choice([UserStatus.active, UserStatus.inactive])
            )
            # attach random groups (1-3)
            import random as _r
            for g in _r.sample(groups, k=_r.randint(1,3)):
                user.groups.append(g)
            session.add(user)
        await session.commit()
        print("Seed complete: 100 users created.")


if __name__ == '__main__':
    asyncio.run(seed())