from fastapi import FastAPI
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Uzytkownik
from schemas import UserCreate
import bcrypt
from routers import users, rooms
from fastapi.middleware.cors import CORSMiddleware
from routers import rezerwacje


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8081"],  # lub ["*"] na testy
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(rooms.router)
app.include_router(rezerwacje.router)



from database import engine
from models import Base

Base.metadata.create_all(bind=engine)