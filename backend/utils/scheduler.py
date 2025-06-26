from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from database import SessionLocal
from models import Reservation, User, Room
from utils.notification import send_reservation_reminder
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

def check_upcoming_reservations():
    db: Session = SessionLocal()
    try:
        now = datetime.now()
        target_start = now + timedelta(minutes=60)
        target_end = now + timedelta(minutes=90)
        today = now.date()

        reservations = db.query(Reservation).filter(
            Reservation.date == today,
            Reservation.notification == False
        ).all()

        to_notify = [
            res for res in reservations
            if target_start <= datetime.combine(res.date, res.time_from) < target_end
        ]

        for res in to_notify:
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
                    logger.error("Błąd podczas wysyłania maila do %s: %s", user.email, e)
            else:
                logger.warning("Brak użytkownika lub sali dla rezerwacji ID %d", res.id)
    except Exception as e:
        logger.error("Błąd w funkcji check_upcoming_reservations: %s", e)
    finally:
        db.close()


def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(check_upcoming_reservations, 'interval', minutes=5)
    scheduler.start()