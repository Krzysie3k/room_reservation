from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from database import SessionLocal
from models import Reservation, User, Room
from utils.notification import send_reservation_reminder

def check_upcoming_reservations():
    db: Session = SessionLocal()
    try:
        now = datetime.now()
        target_start = now + timedelta(minutes=60)
        target_end = now + timedelta(minutes=90)

        today = now.date()

        reservations = db.query(Reservation).filter(
            Reservation.date == today,
            Reservation.time_from >= target_start.time(),
            Reservation.time_from < target_end.time(),
            Reservation.notification == False
        ).all()

        for res in reservations:
            user = db.query(User).filter(User.id == res.user_id).first()
            room = db.query(Room).filter(Room.id == res.room_id).first()
            if user and room:
                try:
                    send_reservation_reminder(
                        to_email=user.email,
                        room_name=room.name,
                        date=res.date.strftime("%Y-%m-%d"),
                        time_from=res.time_from.strftime("%H:%M"),
                        time_to=res.time_to.strftime("%H:%M")
                    )
                    res.notification = True
                    db.commit()
                except Exception as e:
                    print(f"❌ Błąd podczas wysyłania maila do {user.email}: {e}")
    finally:
        db.close()


def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(check_upcoming_reservations, 'interval', minutes=10)
    scheduler.start()
