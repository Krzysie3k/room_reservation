from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import Reservation, Room, ClassAssignment, User
from schemas import ReservationCreate, ReservationResponse
from dependencies import get_current_user
from datetime import timedelta, datetime, time
from utils.notification import (
    send_reservation_created,
    send_reservation_updated,
    send_reservation_cancelled,
)

router = APIRouter()

from typing import List

# GET /reservations – pobieranie wszystkich rezerwacji
@router.get("/reservations", response_model=List[ReservationResponse])
def get_all_reservations(db: Session = Depends(get_db)):
    return db.query(Reservation).all()


# CREATE RESERVATION
@router.post("/reservations", response_model=ReservationResponse)
def create_reservation(reservation: ReservationCreate, db: Session = Depends(get_db)):
    room = validate_room_exists(reservation.room_id, db)
    validate_reservation_duration(reservation.time_from, reservation.time_to)
    check_reservation_conflicts(reservation, db)
    check_class_conflicts(reservation, db)

    db_reservation = Reservation(
        room_id=reservation.room_id,
        user_id=reservation.user_id,
        date=reservation.date,
        time_from=reservation.time_from,
        time_to=reservation.time_to,
        purpose=reservation.purpose
    )
    db.add(db_reservation)
    db.commit()
    db.refresh(db_reservation)

    user = db.query(User).filter(User.id == reservation.user_id).first()
    if user:
        try:
            send_reservation_created(
                to_email=user.email,
                room_name=room.name,
                date=reservation.date.strftime("%Y-%m-%d"),
                time_from=reservation.time_from.strftime("%H:%M"),
                time_to=reservation.time_to.strftime("%H:%M"),
            )
        except Exception as e:
            print("❌ Błąd podczas wysyłania maila:", e)

    return db_reservation

# DELETE RESERVATION
@router.delete("/reservations/{reservation_id}")
def cancel_reservation(
    reservation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation does not exist.")

    if reservation.user_id != current_user.id and current_user.role not in ("admin", "opiekun"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to cancel this reservation."
        )

    now = datetime.now()
    reservation_datetime = datetime.combine(reservation.date, reservation.time_from)
    if now >= reservation_datetime:
        raise HTTPException(
            status_code=400,
            detail="Cannot cancel a reservation that has already started or ended."
        )

    room = db.query(Room).filter(Room.id == reservation.room_id).first()

    db.delete(reservation)
    db.commit()

    user = db.query(User).filter(User.id == reservation.user_id).first()
    if user and room:
        try:
            send_reservation_cancelled(
                to_email=user.email,
                room_name=room.name,
                date=reservation.date.strftime("%Y-%m-%d"),
                time_from=reservation.time_from.strftime("%H:%M"),
                time_to=reservation.time_to.strftime("%H:%M"),
            )
        except Exception as e:
            print("❌ Błąd podczas wysyłania maila:", e)

    return {"message": "Reservation has been cancelled."}

# RESERVATION UPDATE
@router.put("/reservations/{reservation_id}", response_model=ReservationResponse)
def update_reservation(
    reservation_id: int,
    reservation_data: ReservationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    if reservation.user_id != current_user.id and current_user.role not in ("admin", "opiekun"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to edit this reservation"
        )

    room = validate_room_exists(reservation_data.room_id, db)
    validate_reservation_duration(reservation_data.time_from, reservation_data.time_to)
    check_reservation_conflicts(reservation_data, db, exclude_id=reservation_id)
    check_class_conflicts(reservation_data, db)

    reservation.room_id = reservation_data.room_id
    reservation.date = reservation_data.date
    reservation.time_from = reservation_data.time_from
    reservation.time_to = reservation_data.time_to
    reservation.purpose = reservation_data.purpose

    db.commit()
    db.refresh(reservation)

    user = db.query(User).filter(User.id == reservation.user_id).first()
    if user:
        try:
            send_reservation_updated(
                to_email=user.email,
                room_name=room.name,
                date=reservation_data.date.strftime("%Y-%m-%d"),
                time_from=reservation_data.time_from.strftime("%H:%M"),
                time_to=reservation_data.time_to.strftime("%H:%M"),
            )
        except Exception as e:
            print("❌ Błąd podczas wysyłania maila:", e)

    return reservation


def validate_room_exists(room_id: int, db: Session) -> Room:
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room

def validate_reservation_duration(time_from: time, time_to: time):
    duration = datetime.combine(datetime.min, time_to) - datetime.combine(datetime.min, time_from)
    max_duration = timedelta(hours=3)
    if duration > max_duration:
        raise HTTPException(status_code=400, detail="Reservation exceeds maximum allowed duration")

def check_reservation_conflicts(reservation: ReservationCreate, db: Session, exclude_id: int = None):
    filters = [
        Reservation.room_id == reservation.room_id,
        Reservation.date == reservation.date,
        Reservation.time_from < reservation.time_to,
        Reservation.time_to > reservation.time_from,
    ]
    if exclude_id:
        filters.append(Reservation.id != exclude_id)

    conflict = db.query(Reservation).filter(*filters).first()
    if conflict:
        raise HTTPException(status_code=409, detail="Room already reserved for this time")

def check_class_conflicts(reservation: ReservationCreate, db: Session):
    day_of_week = reservation.date.strftime('%A').lower()
    conflict = db.query(ClassAssignment).filter(
        ClassAssignment.room_id == reservation.room_id,
        ClassAssignment.weekday.ilike(day_of_week),
        ClassAssignment.time_from < reservation.time_to,
        ClassAssignment.time_to > reservation.time_from
    ).first()
    if conflict:
        raise HTTPException(status_code=409, detail="Room is scheduled for a class during this time")