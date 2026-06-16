from app.config import SessionLocal
from app.models.catalogos.turno import Turno

def run():
    session = SessionLocal()
    try:
        session.add_all([
            Turno(nombre="Matutino",  hora_inicio="06:00", hora_fin="14:00"),
            Turno(nombre="Vespertino", hora_inicio="14:00", hora_fin="22:00"),
            Turno(nombre="Nocturno",  hora_inicio="22:00", hora_fin="06:00"),
        ])
        session.commit()
    finally:
        session.close()