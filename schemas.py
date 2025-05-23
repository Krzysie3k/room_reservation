from pydantic import BaseModel, EmailStr
from datetime import date, time

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str = "user"  

class RoomCreate(BaseModel):
    room_number: str
    building: str
    floor: int
    room_capacity: int
    equipment: str
    status: str


#RoomResponse do zwracania wolnych sal




class RoomResponse(BaseModel):
    id: int
    room_number: str
    building: str
    floor: int
    room_capacity: int
    equipment: str
    status: str

    class Config:
        orm_mode = True

class RezerwacjaCreate(BaseModel):
    id_sali: int
    id_uzytkownika: int
    data: date
    godzina_od: time
    godzina_do: time
    cel: str

class RezerwacjaResponse(RezerwacjaCreate):
    id_rezerwacji: int

    class Config:
        from_attributes = True
