# database/migrations/catalogos/migration_cargo.py
from app.config import Base, engine
from app.models.catalogos.cargo import Cargo


def up():
    Base.metadata.create_all(bind=engine, tables=[Cargo.__table__])
