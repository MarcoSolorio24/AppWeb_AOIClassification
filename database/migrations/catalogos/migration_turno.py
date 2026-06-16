from app.config import Base, engine
from app.models.catalogos.turno import Turno

def up():
    Base.metadata.create_all(bind=engine, tables=[Turno.__table__])