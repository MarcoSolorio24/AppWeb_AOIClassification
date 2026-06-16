# database/init_database.py
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT_DIR))

from app.config import Base, engine

from database.migrations.catalogos.migration_cargo import up as migrate_cargo
from database.seeders.catalogos.cargo_seeder import run as seed_cargo
from database.migrations.catalogos.migration_turno import up as migrate_turno
from database.seeders.catalogos.turno_seeder import run as seed_turno


def main():
    Base.metadata.drop_all(bind=engine)
    print("Todas las tablas fueron eliminadas")

   
    migrate_cargo()
    print("Migración de cargos ejecutada")
    migrate_turno()
    print("Migracion de turnos ejecutada")

    seed_cargo()
    print("Seeder de cargos ejecutado")
    
    seed_turno()
    print("Seeder de turnos ejecutado")
if __name__ == "__main__":
    main()