from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import router as users_router

app = FastAPI(title="FastAPI Users App (sqlite)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users_router)


@app.get("/")
def user():
    return {"status": "ok"}
