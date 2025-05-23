from sqlalchemy import Column,Integer,String
from database import Base






class User(Base):
    __tablename__ = "users"


    id = Column(Integer,primary_key=True, index=True)
    username = Column(String(255), unique=True, index=True)
    email = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255))
    role = Column(String(50), default="user") 




class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    room_number = Column(String(50), index=True)  
    building = Column(String(255), index=True)
    floor = Column(Integer, index=True)
    room_capacity = Column(Integer)
    equipment = Column(String(255))  
    status = Column(String(50), default="wolna")


