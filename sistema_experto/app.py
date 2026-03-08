import os
from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from motor.motor_ea import procesar_respuestas
from hechos.hechos_ea import RECOMENDACIONES, PERFILES

load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173/Study-Organizer")
PYTHON_ENV   = os.getenv("PYTHON_ENV", "development")
PYTHON_PORT  = int(os.getenv("PYTHON_PORT", 8000))

# En desarrollo permite cualquier origen, en producción solo el frontend
ALLOWED_ORIGINS = ["*"] if PYTHON_ENV == "development" else [FRONTEND_URL]

app = FastAPI(
    title="Sistema Experto VARK",
    # En producción oculta la documentación automática
    docs_url="/docs" if PYTHON_ENV == "development" else None,
    redoc_url="/redoc" if PYTHON_ENV == "development" else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RespuestasInput(BaseModel):
    categorias: list[str]


@app.get("/")
def health_check():
    return {"status": "Sistema Experto VARK activo (powered by experta)"}


@app.post("/analizar")
def analizar_vark(data: RespuestasInput):
    if len(data.categorias) < 16:
        raise HTTPException(
            status_code=400, detail="Se requieren al menos 16 respuestas"
        )

    categorias_validas = {"V", "A", "R", "K"}
    for c in data.categorias:
        if c not in categorias_validas:
            raise HTTPException(
                status_code=400,
                detail=f"Categoría inválida: {c}. Solo se aceptan V, A, R, K",
            )

    resultado = procesar_respuestas(data.categorias)
    return resultado


@app.get("/recomendaciones/{perfil}")
def obtener_recomendaciones_perfil(perfil: str):
    perfil = perfil.upper()
    recomendaciones: dict[str, list[str]] = {}
    for letra in perfil:
        if letra in RECOMENDACIONES:
            recomendaciones[letra] = RECOMENDACIONES[letra]
    if not recomendaciones:
        raise HTTPException(
            status_code=404, detail=f"Perfil '{perfil}' no reconocido"
        )
    return {"recomendaciones": recomendaciones}