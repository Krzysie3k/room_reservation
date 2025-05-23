import urllib.parse
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import urllib

server = 'sanspacesrv.database.windows.net'
database = 'SanSpaceDB'
username = 'san'
password = 'qwerty123!'

params = urllib.parse.quote_plus(
    f"DRIVER=ODBC Driver 18 for SQL Server;"
    f"SERVER={server};DATABASE={database};"
    f"UID={username};PWD={password}"
)


engine = create_engine(f"mssql+pyodbc:///?odbc_connect={params}")


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()