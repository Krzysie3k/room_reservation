from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Room, Reservation, User
from schemas import ReservationResponse
from typing import List
import json
from datetime import datetime
from utils.import_validation import validate_schedule_entry

router = APIRouter()

@router.post("/import-schedule", response_model=List[ReservationResponse])
def import_schedule(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        content = json.load(file.file)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Niepoprawny plik JSON: {str(e)}")

    reservations_to_create = []

    for entry in content:
        try:
            validate_schedule_entry(entry, db)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

        user = db.query(User).filter(User.email == entry["prowadzacy"]).first()
        date_obj = datetime.strptime(entry["data"], "%Y-%m-%d").date()
        time_from = datetime.strptime(entry["godzina_od"], "%H:%M").time()
        time_to = datetime.strptime(entry["godzina_do"], "%H:%M").time()
        seat_count = entry["liczba_studentow"]
        building = entry["budynek"]

        if entry["sala"] != "0":
            room = db.query(Room).filter(Room.name == entry["sala"], Room.building == building).first()
            if not room:
                raise HTTPException(status_code=404, detail=f"Sala {entry['sala']} w budynku {building} nie istnieje")
        else:
            room = find_available_room(db, date_obj, time_from, time_to, building, seat_count)
            if not room:
                raise HTTPException(status_code=404, detail=f"Brak wolnej sali w budynku {building} dla {seat_count} osób")

        reservation = Reservation(
            room_id=room.id,
            user_id=user.id,
            date=date_obj,
            time_from=time_from,
            time_to=time_to,
            purpose=entry["cel"],
            notification=False
        )

        reservations_to_create.append(reservation)

    for res in reservations_to_create:
        db.add(res)
    db.commit()

    return reservations_to_create

def find_available_room(db: Session, date, time_from, time_to, building: str, min_seats: int):
    rooms = db.query(Room).filter(Room.building == building, Room.seat_count >= min_seats).all()

    for room in rooms:
        overlapping = db.query(Reservation).filter(
            Reservation.room_id == room.id,
            Reservation.date == date,
            Reservation.time_from < time_to,
            Reservation.time_to > time_from
        ).first()

        if not overlapping:
            return room

    return None