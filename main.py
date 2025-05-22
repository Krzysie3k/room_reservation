from database import engine
from models import Base

print("Tworzę tabele w bazie danych...")
Base.metadata.create_all(bind=engine)
print("Gotowe!")
