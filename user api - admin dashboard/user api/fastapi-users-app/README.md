FastAPI Users App (ready)
-------------------------

How to run:
1. Create virtualenv and activate
2. pip install -r requirements.txt
3. Run seeder:
   python seed.py
4. Start server:
   uvicorn fastapi_users_app.main:app --reload
5. Open Swagger: http://127.0.0.1:8000/docs

APIs:
- GET /api/users?query=&status=&page=&pageSize=&sortBy=&sortDir=
- PATCH /api/users/{user_id}
- POST  /api/users/{user_id}

SQLite DB file will be created in project root: users.db