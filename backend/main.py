import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routers import users, rooms, reservation, statistics, import_schedule
from utils.scheduler import start_scheduler
from database import engine
from models import Base

# Load environment variables
load_dotenv()

# Create tables in DB (if they don't exist)
Base.metadata.create_all(bind=engine)

# Init app
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router)
app.include_router(rooms.router)
app.include_router(reservation.router)
app.include_router(statistics.router)
app.include_router(import_schedule.router)

# Start APScheduler
start_scheduler()