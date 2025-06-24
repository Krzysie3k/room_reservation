from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas import RoomCreate, RoomResponse
from database import get_db
from dependencies import get_current_user
from models import Room, User, Equipment

router = APIRouter()

# CREATE NEW ROOM
@router.post("/rooms")
async def create_room(room: RoomCreate, db: Session = Depends(get_db)):
    equipment_objs = db.query(Equipment).filter(Equipment.id.in_(room.wyposazenie or [])).all()
    db_room = Room(
        name=room.nazwa,
        building=room.budynek,
        floor=room.pietro,
        seat_count=room.liczba_miejsc,
        description=room.opis,
        type_id=room.id_typu,
    )
    db_room.equipment = equipment_objs

    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    return db_room

# GET ALL ROOMS
@router.get("/rooms", response_model=list[RoomResponse])
def get_rooms(db: Session = Depends(get_db)):
    return db.query(Room).all()

# GET SINGLE ROOM BY ID
@router.get("/rooms/{room_id}", response_model=RoomResponse)
def get_room(room_id: int, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room

# UPDATE ROOM BY ID
@router.put("/rooms/{room_id}", response_model=RoomResponse)
def update_room(
    room_id: int,
    room: RoomCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["opiekun", "admin"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    db_room = db.query(Room).filter(Room.id == room_id).first()
    if not db_room:
        raise HTTPException(status_code=404, detail="Room not found")

    db_room.name = room.nazwa
    db_room.building = room.budynek
    db_room.floor = room.pietro
    db_room.seat_count = room.liczba_miejsc
    db_room.description = room.opis
    db_room.type_id = room.id_typu

    if room.wyposazenie is not None:
        equipment_objs = db.query(Equipment).filter(Equipment.id.in_(room.wyposazenie)).all()
        db_room.equipment = equipment_objs

    db.commit()
    db.refresh(db_room)
    return db_room