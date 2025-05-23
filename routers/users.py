from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas import UserCreate
from models import User
from database import get_db
import bcrypt

router = APIRouter()

@router.post("/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Sprawdź, czy email lub username już istnieje
    existing_user = db.query(User).filter(
        (User.email == user.email) | (User.username == user.username)
    ).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Użytkownik już istnieje")

    # Haszuj hasło
    hashed_pw = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt())

    # Utwórz użytkownika
    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_pw.decode('utf-8')
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user
@router.get("/")
def root():
    return {"message": "API działa!"}
