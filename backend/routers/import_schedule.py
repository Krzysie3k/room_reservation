from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from models import Room, Reservation, User, Class, ClassAssignment
from schemas import ReservationResponse
from typing import List
import json
from datetime import datetime, time, timedelta
from utils.import_validation import validate_reservation_entry, validate_class_entry

router = APIRouter(
    prefix="/data",
    tags=["import"]
)

# Mapowanie polskich dni tygodnia na numer (0 = poniedziałek)
POLISH_WEEKDAYS = {
    "Poniedziałek": 0,
    "Wtorek": 1,
    "Środa": 2,
    "Czwartek": 3,
    "Piątek": 4,
    "Sobota": 5,
    "Niedziela": 6
}

# Import nietypowych zajęć/rezerwacji/konsultacji
@router.post("/import-reservations", response_model=List[ReservationResponse])
def import_reservations(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        content = json.load(file.file)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Niepoprawny plik JSON: {str(e)}")

    reservations_to_create = []

    for entry in content:
        try:
            validate_reservation_entry(entry, db)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

        user = db.query(User).filter(User.email == entry["prowadzacy"]).first()
        if not user:
            raise HTTPException(status_code=404, detail=f"Prowadzący {entry['prowadzacy']} nie istnieje")

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
            room = find_available_room(
                db=db,
                building=building,
                min_seats=seat_count,
                time_from=time_from,
                time_to=time_to,
                conflict_model=Reservation,
                room_field="room_id",
                time_from_field="time_from",
                time_to_field="time_to"
            )
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


# Import powtarzalnego planu zajęć
@router.post("/import-classes")
def import_classes(
    data_od: str = Query(..., description="Data początku semestru w formacie YYYY-MM-DD"),
    data_do: str = Query(..., description="Data końca semestru w formacie YYYY-MM-DD"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Parsowanie dat
    try:
        start_date = datetime.strptime(data_od, "%Y-%m-%d").date()
        end_date = datetime.strptime(data_do, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Błędny format daty. Użyj YYYY-MM-DD")

    # Wczytanie pliku JSON
    try:
        content = json.load(file.file)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Niepoprawny plik JSON: {str(e)}")

    for entry in content:
        # Walidacja danych
        try:
            validate_class_entry(entry, db)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

        # Znalezienie prowadzącego
        user = db.query(User).filter(User.email == entry["prowadzacy"]).first()
        if not user:
            raise HTTPException(status_code=404, detail=f"Prowadzący {entry['prowadzacy']} nie istnieje")

        # Przetwarzanie pól
        weekday = entry["dzien_tygodnia"].capitalize()
        if weekday not in POLISH_WEEKDAYS:
            raise HTTPException(status_code=400, detail=f"Nieznany dzień tygodnia: {weekday}")

        time_from = datetime.strptime(entry["godzina_od"], "%H:%M").time()
        time_to = datetime.strptime(entry["godzina_do"], "%H:%M").time()
        seat_count = entry["liczba_studentow"]
        building = entry["budynek"]

        # Znajdź salę
        if entry["sala"] != "0":
            room = db.query(Room).filter(Room.name == entry["sala"], Room.building == building).first()
            if not room:
                raise HTTPException(status_code=404, detail=f"Sala {entry['sala']} w budynku {building} nie istnieje")
        else:
            room = find_available_room(
                db=db,
                building=building,
                min_seats=seat_count,
                time_from=time_from,
                time_to=time_to,
                conflict_model=ClassAssignment,
                room_field="room_id",
                time_from_field="time_from",
                time_to_field="time_to",
                extra_filters={"weekday": weekday}
            )
            if not room:
                raise HTTPException(status_code=404, detail=f"Brak dostępnej sali w budynku {building} dla {seat_count} osób")

        # Dodanie do tabeli zajęcia
        new_class = Class(
            name=entry["nazwa"],
            instructor_id=user.id,
            student_count=seat_count
        )
        db.add(new_class)
        db.flush()  # pobierze new_class.id

        # Dodanie do przypisanie_zajec
        assignment = ClassAssignment(
            class_id=new_class.id,
            room_id=room.id,
            weekday=weekday,
            time_from=time_from,
            time_to=time_to
        )
        db.add(assignment)

        # Generowanie rezerwacji z zajęć co tydzień
        target_weekday_num = POLISH_WEEKDAYS[weekday]

        current = start_date
        while current <= end_date:
            if current.weekday() == target_weekday_num:
                reservation = Reservation(
                    room_id=room.id,
                    user_id=user.id,
                    date=current,
                    time_from=time_from,
                    time_to=time_to,
                    purpose=f"Zajęcia: {entry['nazwa']}",
                    notification=False
                )
                db.add(reservation)
            current += timedelta(days=1)

    db.commit()
    return {"message": "Zajęcia i rezerwacje zostały zaimportowane pomyślnie"}


# Szukanie sal
def find_available_room(
    db: Session,
    building: str,
    min_seats: int,
    time_from: time,
    time_to: time,
    conflict_model,
    room_field: str,
    time_from_field: str,
    time_to_field: str,
    extra_filters: dict = None
):
    rooms = db.query(Room).filter(Room.building == building, Room.seat_count >= min_seats).all()

    for room in rooms:
        filters = [
            getattr(conflict_model, room_field) == room.id,
            getattr(conflict_model, time_from_field) < time_to,
            getattr(conflict_model, time_to_field) > time_from
        ]
        if extra_filters:
            for key, value in extra_filters.items():
                filters.append(getattr(conflict_model, key) == value)

        overlapping = db.query(conflict_model).filter(*filters).first()
        if not overlapping:
            return room

    return None