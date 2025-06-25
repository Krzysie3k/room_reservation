from datetime import datetime
from typing import Dict, Any
from models import User, Reservation

REQUIRED_FIELDS = ["cel", "prowadzacy", "sala", "budynek", "data", "godzina_od", "godzina_do", "liczba_studentow"]

def validate_schedule_entry(entry: Dict[str, Any], db) -> None:
    # Sprawdzenie, czy są wszystkie klucze
    for field in REQUIRED_FIELDS:
        if field not in entry:
            raise ValueError(f"Brak wymaganego pola: {field}")

    # Sprawdzenie formatu daty
    try:
        date_obj = datetime.strptime(entry["data"], "%Y-%m-%d").date()
    except ValueError:
        raise ValueError("Niepoprawny format daty, oczekiwany YYYY-MM-DD")

    # Sprawdzenie formatu godzin
    try:
        time_from = datetime.strptime(entry["godzina_od"], "%H:%M").time()
        time_to = datetime.strptime(entry["godzina_do"], "%H:%M").time()
    except ValueError:
        raise ValueError("Niepoprawny format czasu, oczekiwany HH:MM")

    if time_from >= time_to:
        raise ValueError("godzina_od musi być wcześniej niż godzina_do")

    # Sprawdzenie liczby studentów
    if not isinstance(entry["liczba_studentow"], int) or entry["liczba_studentow"] <= 0:
        raise ValueError("liczba_studentow musi być dodatnią liczbą całkowitą")

    # Sprawdzenie sali - "0" lub niepusta nazwa
    if str(entry["sala"]) != "0":
        if not isinstance(entry["sala"], str) or len(entry["sala"].strip()) == 0:
            raise ValueError("Pole sala musi być '0' lub niepustym ciągiem znaków (nazwą sali)")

    # Sprawdzenie czy prowadzący istnieje w bazie
    user = db.query(User).filter(User.email == entry["prowadzacy"]).first()
    if not user:
        raise ValueError(f"Nie znaleziono prowadzącego: {entry['prowadzacy']}")

    # Sprawdzenie dostępności użytkownika w tym czasie (czy nie ma konfliktu)
    conflict = db.query(Reservation).filter(
        Reservation.user_id == user.id,
        Reservation.date == date_obj,
        Reservation.time_from < time_to,
        Reservation.time_to > time_from
    ).first()
    if conflict:
        raise ValueError(f"Prowadzący {entry['prowadzacy']} ma już rezerwację w tym czasie")