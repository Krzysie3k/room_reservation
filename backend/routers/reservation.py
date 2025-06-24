from fastapi import APIRouter, Depends, HTTPException, Path, status
from sqlalchemy.orm import Session
from database import get_db
from models import Reservation, Room, ClassAssignment, User
from schemas import ReservationCreate, ReservationResponse
from dependencies import get_current_user
from datetime import timedelta, datetime, time

router = APIRouter()

# CREATE RESERVATION
@router.post("/reservations", response_model=ReservationResponse)
def create_reservation(reservation: ReservationCreate, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.id == reservation.room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    duration = datetime.combine(datetime.min, reservation.time_to) - datetime.combine(datetime.min, reservation.time_from)
    max_duration = timedelta(hours=3)
    if duration > max_duration:
        raise HTTPException(status_code=400, detail="Reservation exceeds maximum allowed duration")

    conflicting_reservation = db.query(Reservation).filter(
        Reservation.room_id == reservation.room_id,
        Reservation.date == reservation.date,
        Reservation.time_from < reservation.time_to,
        Reservation.time_to > reservation.time_from
    ).first()
    if conflicting_reservation:
        raise HTTPException(status_code=409, detail="Room already reserved for this time")

    day_of_week = reservation.date.strftime('%A').lower()
    conflicting_class = db.query(ClassAssignment).filter(
        ClassAssignment.room_id == reservation.room_id,
        ClassAssignment.weekday.ilike(day_of_week),
        ClassAssignment.time_from < reservation.time_to,
        ClassAssignment.time_to > reservation.time_from
    ).first()
    if conflicting_class:
        raise HTTPException(status_code=409, detail="Room is scheduled for a class during this time")

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
    return db_reservation

# DELETE RESERVATION
@router.delete("/reservations/{reservation_id}")
def cancel_reservation(reservation_id: int, db: Session = Depends(get_db)):
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation does not exist.")

    now = datetime.now()
    reservation_datetime = datetime.combine(reservation.date, reservation.time_from)

    if now >= reservation_datetime:
        raise HTTPException(status_code=400, detail="Cannot cancel a reservation that has already started or ended.")

    db.delete(reservation)
    db.commit()
    return {"message": "Reservation has been cancelled."}

# RESERVATION UPDATE
@router.put("/reservations/{reservation_id}", response_model=ReservationResponse)
def update_reservation(
    reservation_id: int,
    reservation_data: ReservationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    if reservation.user_id != current_user.id and current_user.role not in ("admin", "opiekun"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to edit this reservation")

    duration = datetime.combine(datetime.min, reservation_data.time_to) - datetime.combine(datetime.min, reservation_data.time_from)
    max_duration = timedelta(hours=3)
    if duration > max_duration:
        raise HTTPException(status_code=400, detail="Reservation exceeds maximum allowed duration")

    conflicting_reservation = db.query(Reservation).filter(
        Reservation.room_id == reservation_data.room_id,
        Reservation.date == reservation_data.date,
        Reservation.time_from < reservation_data.time_to,
        Reservation.time_to > reservation_data.time_from,
        Reservation.id != reservation_id
    ).first()
    if conflicting_reservation:
        raise HTTPException(status_code=409, detail="Room already reserved for this time")

    day_of_week = reservation_data.date.strftime('%A').lower()
    conflicting_class = db.query(ClassAssignment).filter(
        ClassAssignment.room_id == reservation_data.room_id,
        ClassAssignment.weekday.ilike(day_of_week),
        ClassAssignment.time_from < reservation_data.time_to,
        ClassAssignment.time_to > reservation_data.time_from
    ).first()
    if conflicting_class:
        raise HTTPException(status_code=409, detail="Room is scheduled for a class during this time")

    reservation.room_id = reservation_data.room_id
    reservation.date = reservation_data.date
    reservation.time_from = reservation_data.time_from
    reservation.time_to = reservation_data.time_to
    reservation.purpose = reservation_data.purpose

    db.commit()
    db.refresh(reservation)
    return reservation