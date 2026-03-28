import os
from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from motor.motor_ea import procesar_respuestas, obtener_recomendaciones_perfil

# abre el .env
load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173/Study-Organizer")
PYTHON_ENV   = os.getenv("PYTHON_ENV", "development")
PYTHON_PORT  = int(os.getenv("PYTHON_PORT", 8000))

# origenes permitidos
ALLOWED_ORIGINS = ["*"] if PYTHON_ENV == "development" else [FRONTEND_URL]

# crea el servidor
app = FastAPI(
    title="Sistema Experto VARK",
    docs_url="/docs" if PYTHON_ENV == "development" else None, # en desarrollo ver y probar rutas
    redoc_url="/redoc" if PYTHON_ENV == "development" else None, # si no, por seguridad no
)

# origen / CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"], # encabezado
)

# modelo de los datos antes de procesar
class RespuestasInput(BaseModel):
    categorias: list[str]

# ruta prueba
@app.get("/")
def health_check():
    return {"status": "Sistema Experto activo"}


# recibe repuetas del test = categorias
@app.post("/analizar")
def analizar_vark(data: RespuestasInput):
    if len(data.categorias) < 16:
        raise HTTPException(
            status_code=400, detail="Se requieren al menos 16 respuestas"
        )

    categorias_validas = {"V", "A", "R", "K"}
    for c in data.categorias: # recorrer n hasta n = 16 o más respuestas (categorias)
        if c not in categorias_validas:
            raise HTTPException(
                status_code=400,
                detail=f"Categoría inválida: {c}. Solo se aceptan V, A, R, K",
            )

    return procesar_respuestas(data.categorias)

# obtener recomendaciones
@app.get("/recomendaciones/{perfil}")
def obtener_recomendaciones_perfil_endpoint(perfil: str):
    recomendaciones = obtener_recomendaciones_perfil(perfil)  # ← pasa por el motor
    if not recomendaciones:
        raise HTTPException(
            status_code=404, detail=f"Perfil '{perfil.upper()}' no reconocido"
        )
    return {"recomendaciones": recomendaciones}