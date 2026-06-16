from fastapi import APIRouter

#from app.controllers.catalogos.cargo_controller import router as cargo_router
#from app.controllers.catalogos.turno_controller import router as turno_router
from app.controllers.aoi.aoi_controller import router as aoi_router

router = APIRouter()

#router.include_router(cargo_router, prefix="/api/cargos", tags=["Cargos"])
#router.include_router(turno_router, prefix="/api/turnos", tags=["Turnos"])
router.include_router(aoi_router, prefix="/api/aoi", tags=["Inteligencia Artificial"])