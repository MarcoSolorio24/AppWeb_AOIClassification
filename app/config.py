import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware


BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

# Configuración general de la app
APP_NAME = os.getenv("APP_NAME", "AOI Backend")
APP_VERSION = os.getenv("APP_VERSION", "1.0.0")
APP_HOST = os.getenv("APP_HOST", "0.0.0.0")
APP_PORT = int(os.getenv("APP_PORT", 8000))

# Configuración del modelo
MODEL_PATH = BASE_DIR / os.getenv("MODEL_PATH", "modelo_local_AOI_V3.keras")
CLASSES_FILE = BASE_DIR / os.getenv("CLASSES_FILE", "class_names.json")

# Tamaño de imagen esperado por el modelo
IMG_WIDTH = int(os.getenv("IMG_WIDTH", 224))
IMG_HEIGHT = int(os.getenv("IMG_HEIGHT", 224))
IMG_SIZE = (IMG_WIDTH, IMG_HEIGHT)

# Extensiones permitidas
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"}

# Ruta de la carpeta con imágenes a procesar
# Modifica esta ruta con la carpeta donde tienes tus imágenes
IMAGES_FOLDER = Path(
    os.getenv(
        "IMAGES_FOLDER",
        r"\\MXSRKIM001\Share\Digitalization\Test01_AOI_ImageRecolect\Data_ML"
    )
)

# Activar lógica por fecha: BASE/YYYY/MM/DD
AOI_USE_DAILY_PATH = os.getenv("AOI_USE_DAILY_PATH", "true").strip().lower() == "true"

# Tiempo (segundos) a esperar cuando se detecta una nueva carpeta
FOLDER_WAIT_SECONDS = int(os.getenv("FOLDER_WAIT_SECONDS", 7))

# CORS
def setup_cors(app):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # en producción conviene restringir esto
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )