from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
import csv
import io
import datetime

from database import get_db
from models import Reservation


router = APIRouter(
    prefix="/api/report",
    tags=["report"]
)

@router.get("/csv")
def export_reservations_csv(db: Session = Depends(get_db)):
    try:
        reservations = db.query(Reservation).all()
        output = io.StringIO()
        writer = csv.writer(output)

        writer.writerow(["ID", "Room", "User", "Start", "End"])
        for r in reservations:
            # Składanie daty + godziny
            start_dt = datetime.datetime.combine(r.date, r.time_from)
            end_dt = datetime.datetime.combine(r.date, r.time_to)

            writer.writerow([
                r.id,
                r.room_id,
                r.user_id,
                start_dt,
                end_dt
            ])

        response = Response(content=output.getvalue(), media_type="text/csv")
        response.headers["Content-Disposition"] = "attachment; filename=reservations.csv"
        return response
    except Exception as e:
        print("Błąd eksportu:", e)
        return Response(content="Błąd eksportu", status_code=500)

@router.get("/count-by-room")
def count_by_room(db: Session = Depends(get_db)):
    result = db.query(Reservation.room_id, func.count(Reservation.id)).group_by(Reservation.room_id).all()
    return [{"room_id": r[0], "reservation_count": r[1]} for r in result]

@router.get("/count-by-user")
def count_by_user(db: Session = Depends(get_db)):
    result = db.query(Reservation.user_id, func.count(Reservation.id)).group_by(Reservation.user_id).all()
    return [{"user_id": r[0], "reservation_count": r[1]} for r in result]