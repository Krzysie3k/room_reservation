from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas import RoomCreate, RoomResponse
from database import get_db
from dependencies import get_current_user
from models import Room, User

router = APIRouter()

#                       DODAWANIE SALI





@router.post("/rooms", response_model=RoomResponse)
def create_room(
    room: RoomCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["opiekun", "admin"]:
        raise HTTPException(status_code=403, detail="Brak uprawnień")
    db_room = Room(**room.dict())
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    return db_room

#                       POBIERANIE WSZYSTKICH SAL





@router.get("/rooms", response_model=list[RoomResponse])
def get_rooms(db: Session = Depends(get_db)):
    return db.query(Room).all()





#                       POBIERANIE SALI PO ID




@router.get("/rooms/{room_id}", response_model=RoomResponse)
def get_room(room_id: int, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Sala nie znaleziona")
    return room









@router.put("/rooms/{room_id}", response_model=RoomResponse)
def update_room(
    room_id: int,
    room: RoomCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["opiekun", "admin"]:
        raise HTTPException(status_code=403, detail="Brak uprawnień")
    db_room = db.query(Room).filter(Room.id == room_id).first()
    if not db_room:
        raise HTTPException(status_code=404, detail="Sala nie znaleziona")
    for key, value in room.dict().items():
        setattr(db_room, key, value)
    db.commit()
    db.refresh(db_room)
    return db_room