from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Reservation
from schemas import ReservationCreate, ReservationResponse

router = APIRouter()

# !!! DO SPRAWDZENIA BO NIE DZIAŁA PRZEZ TRIGGERY W BAZIE
@router.post("/reservations", response_model=ReservationResponse)
def create_reservation(reservation: ReservationCreate, db: Session = Depends(get_db)):
    db_reservation = Reservation(**reservation.dict())
    db.add(db_reservation)
    db.commit()
    db.refresh(db_reservation)
    return db_reservation