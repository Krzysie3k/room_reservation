from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Rezerwacja
from schemas import RezerwacjaCreate, RezerwacjaResponse

router = APIRouter()

@router.post("/rezerwacje", response_model=RezerwacjaResponse)
def create_rezerwacja(rezerwacja: RezerwacjaCreate, db: Session = Depends(get_db)):
    db_rez = Rezerwacja(**rezerwacja.dict())
    db.add(db_rez)
    db.commit()
    db.refresh(db_rez)
    return db_rez