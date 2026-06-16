from fastapi import APIRouter, UploadFile, File, HTTPException

from app.schemas.aoi.aoi_schema import (
    AOIPredictionResponse,
    AOIHealthResponse,
)
from app.services.aoi.aoi_service import (
    predict_image,
    get_class_names,
    model_is_ready,
    get_batch_status,
    get_batch_queue,
    get_current_batch_info,
    get_current_image,
    get_next_image,
    predict_current_image,
    finish_current_batch,
)

router = APIRouter()


@router.get("/health", response_model=AOIHealthResponse)
def health_check():
    return {
        "servicio": "AOI",
        "modelo_cargado": model_is_ready(),
        "clases": get_class_names()
    }


@router.get("/classes", response_model=list[str])
def get_classes():
    return get_class_names()


@router.post("/predict", response_model=AOIPredictionResponse)
async def predict(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Debes enviar un archivo de imagen.")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="El archivo está vacío.")

    return predict_image(content, file.filename)


# ==================== ENDPOINTS DE LOTES ====================

@router.get("/batch/status")
def batch_status():
    return get_batch_status()


@router.get("/batch/queue")
def batch_queue():
    return get_batch_queue()


@router.get("/batch/current")
def current_batch():
    return get_current_batch_info()


@router.get("/batch/current/image")
def current_batch_image():
    return get_current_image()


@router.post("/batch/current/analyze", response_model=AOIPredictionResponse)
def analyze_current_batch_image():
    return predict_current_image()


@router.post("/batch/current/next-image")
def next_batch_image():
    return get_next_image()


@router.post("/batch/current/finish")
def finish_batch():
    return finish_current_batch()