from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, Time, Text, ForeignKey, Table
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

# Tabela pośrednia dla relacji wiele-do-wielu Sala <-> Wyposażenie
SalaWyposazenie = Table(
    "sala_wyposazenie", Base.metadata,
    Column("id_sali", Integer, ForeignKey("sala.id_sali"), primary_key=True),
    Column("id_wyposazenia", Integer, ForeignKey("wyposazenie.id_wyposazenia"), primary_key=True)
)

class Uzytkownik(Base):
    __tablename__ = "uzytkownik"
    id_uzytkownika = Column(Integer, primary_key=True, index=True)
    imie = Column(String(255))
    nazwisko = Column(String(255))
    email = Column(String(255), unique=True, index=True)
    haslo = Column(String(255))
    rola = Column(String(255))
    powiadomienia = relationship("Powiadomienie", back_populates="uzytkownik")
    rezerwacje = relationship("Rezerwacja", back_populates="uzytkownik")

class Powiadomienie(Base):
    __tablename__ = "powiadomienie"
    id_powiadomienia = Column(Integer, primary_key=True, index=True)
    id_uzytkownika = Column(Integer, ForeignKey("uzytkownik.id_uzytkownika"))
    tresc = Column(Text)
    data_wyslania = Column(DateTime)
    przeczytane = Column(Boolean, default=False)
    uzytkownik = relationship("Uzytkownik", back_populates="powiadomienia")

class TypSali(Base):
    __tablename__ = "typ_sali"
    id_typu = Column(Integer, primary_key=True, index=True)
    nazwa = Column(String(255))
    sale = relationship("Sala", back_populates="typ")

class Sala(Base):
    __tablename__ = "sala"
    id_sali = Column(Integer, primary_key=True, index=True)
    nazwa = Column(String(255))
    liczba_miejsc = Column(Integer)
    id_typu = Column(Integer, ForeignKey("typ_sali.id_typu"))
    lokalizacja = Column(String(255))
    opis = Column(Text)
    typ = relationship("TypSali", back_populates="sale")
    wyposazenie = relationship("Wyposazenie", secondary=SalaWyposazenie, back_populates="sale")
    rezerwacje = relationship("Rezerwacja", back_populates="sala")
    awarie = relationship("Awaria", back_populates="sala")
    przypisania_zajec = relationship("PrzypisanieZajec", back_populates="sala")

class Wyposazenie(Base):
    __tablename__ = "wyposazenie"
    id_wyposazenia = Column(Integer, primary_key=True, index=True)
    nazwa = Column(String(255))
    opis = Column(Text)
    sale = relationship("Sala", secondary=SalaWyposazenie, back_populates="wyposazenie")

class Rezerwacja(Base):
    __tablename__ = "rezerwacja"
    id_rezerwacji = Column(Integer, primary_key=True, index=True)
    id_sali = Column(Integer, ForeignKey("sala.id_sali"))
    id_uzytkownika = Column(Integer, ForeignKey("uzytkownik.id_uzytkownika"))
    data = Column(Date)
    godzina_od = Column(Time)
    godzina_do = Column(Time)
    cel = Column(Text)
    sala = relationship("Sala", back_populates="rezerwacje")
    uzytkownik = relationship("Uzytkownik", back_populates="rezerwacje")

class Awaria(Base):
    __tablename__ = "awaria"
    id_awarii = Column(Integer, primary_key=True, index=True)
    id_sali = Column(Integer, ForeignKey("sala.id_sali"))
    opis = Column(Text)
    data_zgloszenia = Column(Date)
    status = Column(String(255))
    sala = relationship("Sala", back_populates="awarie")

class Zajecia(Base):
    __tablename__ = "zajecia"
    id_zajec = Column(Integer, primary_key=True, index=True)
    nazwa = Column(String(255))
    prowadzacy = Column(String(255))
    liczba_studentow = Column(Integer)
    przypisania = relationship("PrzypisanieZajec", back_populates="zajecia")

class PrzypisanieZajec(Base):
    __tablename__ = "przypisanie_zajec"
    id_przypisania = Column(Integer, primary_key=True, index=True)
    id_zajec = Column(Integer, ForeignKey("zajecia.id_zajec"))
    id_sali = Column(Integer, ForeignKey("sala.id_sali"))
    dzien_tygodnia = Column(String(255))
    godzina_od = Column(Time)
    godzina_do = Column(Time)
    zajecia = relationship("Zajecia", back_populates="przypisania")
    sala = relationship("Sala", back_populates="przypisania_zajec")


