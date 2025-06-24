from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas import UserCreate
from models import User
from database import get_db
from fastapi.security import OAuth2PasswordRequestForm
from auth import verify_password, create_access_token, get_password_hash
from dependencies import get_current_user

router = APIRouter()

# USER REGISTRATION
@router.post("/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    hashed_pw = get_password_hash(user.password)
    new_user = User(
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        password=hashed_pw,
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "id": new_user.id,
        "first_name": new_user.first_name,
        "last_name": new_user.last_name,
        "email": new_user.email,
        "role": new_user.role
    }

# GET USER BY ID
@router.get("/users/{user_id}")
def get_user_by_id(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "role": user.role
    }

# USER LOGIN
@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid login credentials")
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

# GET CURRENT USER DATA
@router.get("/me")
def read_current_user(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "email": current_user.email,
        "role": current_user.role
    }