from pydantic import BaseModel


class AOIClassScore(BaseModel):
    clase: str
    probabilidad: float


class AOIPredictionResponse(BaseModel):
    archivo: str
    prediccion: str
    confianza: float
    scores: list[AOIClassScore]


class AOIHealthResponse(BaseModel):
    servicio: str
    modelo_cargado: bool
    clases: list[str]


class FolderSetResponse(BaseModel):
    total_images: int
    current_index: int
    first_image: str
    folder_path: str


class FolderStatusResponse(BaseModel):
    folder_path: str
    total_images: int
    current_index: int
    current_image: str


class FolderImageResponse(BaseModel):
    filename: str
    image_data: str  # base64
    current_index: int
    total_images: int