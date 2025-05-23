from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas import UserCreate
from models import Uzytkownik
from database import get_db
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from auth import verify_password, create_access_token, SECRET_KEY, ALGORITHM, get_password_hash
from jose import jwt, JWTError
from fastapi import status
from dependencies import get_current_user

router = APIRouter()

#           REJESTRACJA USERA




@router.post("/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(
        (Uzytkownik.email == user.email) | (Uzytkownik.username == user.username)
    ).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Użytkownik już istnieje")

    hashed_pw = get_password_hash(user.password)
    new_user = Uzytkownik(
        username=user.username,
        email=user.email,
        hashed_password=hashed_pw,
        role=user.role 
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user




#               POBIERANIE USERA PO ID




@router.get("/users/{user_id}")
def get_user_by_id(user_id: int, db: Session = Depends(get_db)):
    user = db.query(Uzytkownik).filter(Uzytkownik.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Nie znaleziono użytkownika")
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email
    }



#           LOGOWANIE USERA






@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(Uzytkownik).filter(Uzytkownik.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Nieprawidłowe dane logowania")
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}







#           POKAZ DANE USERA


@router.get("/me")
def read_users_me(current_user: Uzytkownik = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email
    }

