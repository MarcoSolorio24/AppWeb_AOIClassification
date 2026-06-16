# database/seeders/catalogos/cargo_seeder.py
from app.config import SessionLocal
from app.models.catalogos.cargo import Cargo


def run():
    session = SessionLocal()
    try:
        session.add_all(
            [
                Cargo(nombre_cargo="FASSY"),
                Cargo(nombre_cargo="ANALISIS"),
                Cargo(nombre_cargo="FSW"),
            ]
        )
        session.commit()
    finally:
        session.close()
