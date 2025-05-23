from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

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
