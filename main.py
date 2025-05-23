from fastapi import FastAPI
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import User
from schemas import UserCreate
import bcrypt
from routers import users

app = FastAPI()

app.include_router(users.router)




