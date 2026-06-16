import uvicorn
from fastapi import FastAPI

from app.config import setup_cors, APP_HOST, APP_PORT, APP_NAME, APP_VERSION
from app.routes import router
from app.services.aoi.aoi_service import bootstrap_aoi_service

app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION
)

setup_cors(app)
app.include_router(router)

@app.on_event("startup")
def startup_event():
    print(f"🚀 Iniciando {APP_NAME} v{APP_VERSION}")
    bootstrap_aoi_service()

@app.get("/")
def root():
    return {"message": "Backend AOI activo"}

if __name__ == "__main__":
    uvicorn.run("main:app", host=APP_HOST, port=APP_PORT, reload=True)