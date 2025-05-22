from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import User
from schemas import UserCreate
import bcrypt

app = FastAPI()

# Dependency – tworzy sesję do bazy dla każdego zapytania
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Sprawdź, czy email lub username już istnieje
    existing_user = db.query(User).filter((User.email == user.email) | (User.username == user.username)).first()
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

    return {"message": "Użytkownik utworzony", "user_id": new_user.id}
