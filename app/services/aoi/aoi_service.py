from __future__ import annotations

import base64
import json
import os
import threading
import time
import uuid
from collections import deque
from datetime import datetime
from io import BytesIO
from pathlib import Path

import numpy as np
import tensorflow as tf
from fastapi import HTTPException
from PIL import Image, UnidentifiedImageError
from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer
from watchdog.observers.polling import PollingObserver

import app.config as app_config


# ============================================================
# CONFIGURACIÓN
# ============================================================

BASE_DIR = Path(getattr(app_config, "BASE_DIR", Path.cwd()))

MODEL_PATH = Path(
    getattr(app_config, "MODEL_PATH", BASE_DIR / "modelo_local_AOI_V3.keras")
)

CLASSES_FILE = Path(
    getattr(app_config, "CLASSES_FILE", BASE_DIR / "class_names.json")
)

IMG_SIZE = getattr(app_config, "IMG_SIZE", (224, 224))

ALLOWED_IMAGE_EXTENSIONS = set(
    getattr(app_config, "ALLOWED_IMAGE_EXTENSIONS", {".jpg", ".jpeg", ".png"})
)

AOI_WATCH_BASE_PATH = Path(
    getattr(
        app_config,
        "IMAGES_FOLDER",
        BASE_DIR / "files",
    )
)

# true/false robusto — por defecto false para evitar rutas diarias automáticas
AOI_USE_DAILY_PATH = str(
    getattr(app_config, "AOI_USE_DAILY_PATH", "true")
).strip().lower() == "true"

# Tiempo de espera tras detectar carpeta (se lee desde config: FOLDER_WAIT_SECONDS)
AOI_BATCH_WAIT_SECONDS = int(getattr(app_config, "FOLDER_WAIT_SECONDS", 8))
AOI_MAX_PENDING_BATCHES = int(getattr(app_config, "AOI_MAX_PENDING_BATCHES", 100))
AOI_MAX_COMPLETED_BATCHES = int(getattr(app_config, "AOI_MAX_COMPLETED_BATCHES", 50))


# ============================================================
# ESTADO GLOBAL DEL MODELO
# ============================================================

_model = None
_class_names: list[str] = []
_model_lock = threading.Lock()


# ============================================================
# ESTADO GLOBAL DE LOTES / VIGILANTE
# ============================================================

_batches_lock = threading.Lock()
_pending_batches = deque()
_completed_batches = deque(maxlen=AOI_MAX_COMPLETED_BATCHES)
_current_batch = None
_known_batch_paths = set()

_observer = None
_watch_started_at = None


# ============================================================
# UTILIDADES GENERALES
# ============================================================

def _resolve_watch_path() -> Path:
    if AOI_USE_DAILY_PATH:
        hoy = datetime.now()
        return (
            AOI_WATCH_BASE_PATH
            / hoy.strftime("%Y")
            / hoy.strftime("%m")
            / hoy.strftime("%d")
        )
    return AOI_WATCH_BASE_PATH


def _is_network_path(path: Path) -> bool:
    return str(path).startswith("\\\\")


def _build_observer(path: Path):
    # En rutas UNC / red suele ser más estable PollingObserver
    if _is_network_path(path):
        return PollingObserver(timeout=1)
    return Observer()


def _get_mime_type(suffix: str) -> str:
    suffix = suffix.lower()
    if suffix == ".png":
        return "image/png"
    if suffix in {".jpg", ".jpeg"}:
        return "image/jpeg"
    return "application/octet-stream"


def _validate_extension(filename: str):
    extension = Path(filename).suffix.lower()
    if extension not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Formato no permitido. Solo se aceptan .jpg, .jpeg y .png",
        )


def _serialize_batch(batch: dict | None) -> dict | None:
    if not batch:
        return None

    total_images = len(batch["images"])
    current_index = batch["current_image_index"] + 1 if total_images > 0 else 0

    return {
        "batch_id": batch["batch_id"],
        "batch_name": batch["batch_name"],
        "folder_path": batch["folder_path"],
        "status": batch["status"],
        "total_images": total_images,
        "current_index": current_index,
        "created_at": batch.get("created_at"),
        "started_at": batch.get("started_at"),
        "finished_at": batch.get("finished_at"),
    }


def _ensure_current_batch_locked():
    global _current_batch

    if _current_batch is None and _pending_batches:
        _current_batch = _pending_batches.popleft()
        _current_batch["status"] = "EN_PROCESO"
        _current_batch["started_at"] = datetime.now().isoformat()


def _get_current_batch_locked():
    _ensure_current_batch_locked()
    return _current_batch


def _get_current_batch_or_raise():
    with _batches_lock:
        batch = _get_current_batch_locked()
        if batch is None:
            raise HTTPException(status_code=404, detail="No hay lotes disponibles.")
        return batch


def _safe_folder_key(folder_path: Path) -> str:
    try:
        return str(folder_path.resolve())
    except Exception:
        return str(folder_path)


# ============================================================
# MODELO AOI
# ============================================================

def load_aoi_resources():
    global _model, _class_names

    if _model is not None and _class_names:
        return

    with _model_lock:
        if _model is None:
            if not MODEL_PATH.exists():
                raise FileNotFoundError(f"No se encontró el modelo: {MODEL_PATH}")
            _model = tf.keras.models.load_model(MODEL_PATH)

        if not _class_names:
            if CLASSES_FILE.exists():
                with open(CLASSES_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)

                if not isinstance(data, list) or not data:
                    raise ValueError("class_names.json debe contener una lista de clases.")

                _class_names = data
            else:
                _class_names = ["BUENA", "MALA"]


def get_class_names() -> list[str]:
    load_aoi_resources()
    return _class_names


def model_is_ready() -> bool:
    return _model is not None


def _prepare_image_bytes(image_bytes: bytes):
    try:
        image = Image.open(BytesIO(image_bytes)).convert("RGB")
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="El archivo no es una imagen válida.")
    except Exception:
        raise HTTPException(status_code=400, detail="No fue posible leer la imagen.")

    image = image.resize(IMG_SIZE)
    image_array = tf.keras.utils.img_to_array(image)
    image_array = tf.expand_dims(image_array, 0)

    # No dividir entre 255 si tu modelo ya lo hace internamente
    return image_array


def _normalize_predictions(predictions):
    predictions = np.asarray(predictions, dtype=float)
    predictions = np.squeeze(predictions)

    if predictions.ndim == 0:
        value = float(predictions)
        return np.array([1.0 - value, value], dtype=float)

    if predictions.ndim == 1 and len(predictions) == 1:
        value = float(predictions[0])
        return np.array([1.0 - value, value], dtype=float)

    return predictions


def predict_image(image_bytes: bytes, filename: str) -> dict:
    load_aoi_resources()
    _validate_extension(filename)

    image_array = _prepare_image_bytes(image_bytes)

    try:
        predictions = _model.predict(image_array, verbose=0)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al ejecutar el modelo: {str(e)}")

    predictions = _normalize_predictions(predictions)

    class_names = _class_names
    if len(class_names) != len(predictions):
        class_names = [f"CLASE_{i}" for i in range(len(predictions))]

    scores = [
        {
            "clase": class_names[i],
            "probabilidad": round(float(predictions[i]) * 100, 4),
        }
        for i in range(len(predictions))
    ]
    scores = sorted(scores, key=lambda x: x["probabilidad"], reverse=True)

    return {
        "archivo": filename,
        "prediccion": scores[0]["clase"],
        "confianza": scores[0]["probabilidad"],
        "scores": scores,
    }


# ============================================================
# VALIDACIÓN DE IMAGEN DEL LOTE
# ============================================================

def is_valid_batch_image(image_path: Path) -> bool:
    """
    Descarta imágenes casi blancas o con muy poca variación.
    """
    try:
        image = Image.open(image_path).convert("L")
        arr = np.array(image, dtype=np.uint8)

        promedio = float(arr.mean())
        desviacion = float(arr.std())

        return not (promedio > 240 or desviacion < 8)
    except Exception as e:
        print(f"⚠ Error validando imagen {image_path}: {e}")
        return False


# ============================================================
# CONSTRUCCIÓN DE LOTES
# ============================================================

def _build_batch_from_folder(folder_path: Path) -> dict | None:
    image_paths: list[str] = []

    for root, _, files in os.walk(folder_path):
        for file_name in sorted(files):
            ext = Path(file_name).suffix.lower()
            if ext not in ALLOWED_IMAGE_EXTENSIONS:
                continue

            image_path = Path(root) / file_name

            if is_valid_batch_image(image_path):
                image_paths.append(str(image_path))

    if not image_paths:
        print(f"⚠ No se encontraron imágenes válidas en el lote: {folder_path}")
        return None

    print(f"✅ Lote válido detectado: {folder_path.name} | imágenes: {len(image_paths)}")

    return {
        "batch_id": str(uuid.uuid4()),
        "batch_name": folder_path.name,
        "folder_path": str(folder_path),
        "images": image_paths,
        "current_image_index": 0,
        "status": "PENDIENTE",
        "created_at": datetime.now().isoformat(),
        "started_at": None,
        "finished_at": None,
    }


def _register_batch(folder_path: Path):
    global _current_batch

    folder_key = _safe_folder_key(folder_path)

    with _batches_lock:
        if folder_key in _known_batch_paths:
            return
        _known_batch_paths.add(folder_key)

    print(f"📂 Nueva carpeta detectada: {folder_path}")
    print(f"⏳ Esperando {AOI_BATCH_WAIT_SECONDS}s antes de procesar lote...")

    time.sleep(AOI_BATCH_WAIT_SECONDS)

    if not folder_path.exists():
        print(f"⚠ La carpeta ya no existe: {folder_path}")
        return

    batch = _build_batch_from_folder(folder_path)
    if batch is None:
        return

    with _batches_lock:
        if _current_batch is None:
            batch["status"] = "EN_PROCESO"
            batch["started_at"] = datetime.now().isoformat()
            _current_batch = batch
            print(f"🚀 Lote asignado como actual: {batch['batch_name']}")
        else:
            if len(_pending_batches) >= AOI_MAX_PENDING_BATCHES:
                print("⚠ Cola de lotes llena. Lote descartado.")
                return

            _pending_batches.append(batch)
            print(f"📥 Lote agregado a cola: {batch['batch_name']}")


def scan_existing_batches():
    watch_path = _resolve_watch_path()

    if not watch_path.exists():
        print(f"⚠ La ruta monitoreada no existe aún: {watch_path}")
        return

    print(f"🔎 Escaneando carpetas existentes en: {watch_path}")

    for item in sorted(watch_path.iterdir()):
        if item.is_dir():
            _register_batch(item)


# ============================================================
# WATCHDOG
# ============================================================

class AOIBatchFolderHandler(FileSystemEventHandler):
    def _handle_new_folder(self, folder_path_str: str):
        folder_path = Path(folder_path_str)

        threading.Thread(
            target=_register_batch,
            args=(folder_path,),
            daemon=True,
        ).start()

    def on_created(self, event):
        if event.is_directory:
            self._handle_new_folder(event.src_path)

    def on_moved(self, event):
        if event.is_directory:
            self._handle_new_folder(event.dest_path)


def start_batch_watcher():
    global _observer, _watch_started_at

    watch_path = _resolve_watch_path()

    if _observer is not None and _observer.is_alive():
        return get_batch_status()

    if not watch_path.exists():
        raise FileNotFoundError(f"La ruta de monitoreo no existe: {watch_path}")

    event_handler = AOIBatchFolderHandler()
    observer = _build_observer(watch_path)
    observer.schedule(event_handler, str(watch_path), recursive=False)
    observer.start()

    _observer = observer
    _watch_started_at = datetime.now().isoformat()

    print(f"👀 Vigilante iniciado en: {watch_path}")

    return get_batch_status()


def stop_batch_watcher():
    global _observer

    if _observer is not None:
        _observer.stop()
        _observer.join(timeout=5)
        _observer = None
        print("🛑 Vigilante detenido")


def get_batch_status() -> dict:
    with _batches_lock:
        current_batch = _serialize_batch(_current_batch)

        return {
            "watching": bool(_observer and _observer.is_alive()),
            "watch_path": str(_resolve_watch_path()),
            "wait_seconds": AOI_BATCH_WAIT_SECONDS,
            "started_at": _watch_started_at,
            "pending_batches": len(_pending_batches),
            "completed_batches": len(_completed_batches),
            "current_batch": current_batch,
        }


def get_batch_queue() -> dict:
    with _batches_lock:
        return {
            "pending_count": len(_pending_batches),
            "items": [_serialize_batch(batch) for batch in list(_pending_batches)],
        }


# ============================================================
# LOTE ACTUAL
# ============================================================

def get_current_batch_info() -> dict:
    with _batches_lock:
        batch = _get_current_batch_locked()

        if batch is None:
            return {
                "has_current_batch": False,
                "batch": None,
            }

        return {
            "has_current_batch": True,
            "batch": _serialize_batch(batch),
        }


def get_current_image() -> dict:
    batch = _get_current_batch_or_raise()

    current_index = batch["current_image_index"]
    total_images = len(batch["images"])
    image_path = Path(batch["images"][current_index])

    if not image_path.exists():
        raise HTTPException(status_code=404, detail="La imagen actual no existe.")

    image_bytes = image_path.read_bytes()
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")

    return {
        "batch_id": batch["batch_id"],
        "batch_name": batch["batch_name"],
        "file_name": image_path.name,
        "file_path": str(image_path),
        "current_index": current_index + 1,
        "total_images": total_images,
        "mime_type": _get_mime_type(image_path.suffix),
        "image_data": image_b64,
    }


def get_next_image() -> dict:
    batch = _get_current_batch_or_raise()

    with _batches_lock:
        total_images = len(batch["images"])

        if batch["current_image_index"] >= total_images - 1:
            raise HTTPException(
                status_code=409,
                detail="Ya estás en la última imagen del lote actual.",
            )

        batch["current_image_index"] += 1

    return get_current_image()


def predict_current_image() -> dict:
    batch = _get_current_batch_or_raise()

    current_index = batch["current_image_index"]
    total_images = len(batch["images"])
    image_path = Path(batch["images"][current_index])

    if not image_path.exists():
        raise HTTPException(status_code=404, detail="La imagen actual no existe.")

    prediction = predict_image(image_path.read_bytes(), image_path.name)
    prediction["batch_id"] = batch["batch_id"]
    prediction["batch_name"] = batch["batch_name"]
    prediction["current_index"] = current_index + 1
    prediction["total_images"] = total_images

    return prediction


def finish_current_batch() -> dict:
    global _current_batch

    with _batches_lock:
        batch = _get_current_batch_locked()
        if batch is None:
            raise HTTPException(status_code=404, detail="No hay lote actual para finalizar.")

        batch["status"] = "COMPLETADO"
        batch["finished_at"] = datetime.now().isoformat()
        _completed_batches.append(batch)

        finished_batch = _serialize_batch(batch)

        _current_batch = None
        _ensure_current_batch_locked()

        next_batch = _serialize_batch(_current_batch)

    return {
        "message": "Lote finalizado correctamente.",
        "finished_batch": finished_batch,
        "next_batch": next_batch,
    }


# ============================================================
# BOOTSTRAP
# ============================================================

def bootstrap_aoi_service():
    """
    Carga el modelo, arranca el vigilante y escanea lotes ya existentes.
    """
    load_aoi_resources()
    start_batch_watcher()
    scan_existing_batches()