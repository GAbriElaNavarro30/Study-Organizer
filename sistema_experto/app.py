# main.py  —  API FastAPI (sin cambios de lógica, solo el motor es diferente)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from motor.motor_ea import procesar_respuestas          # ← motor experta
from hechos.hechos_ea import RECOMENDACIONES, PERFILES  # ← base de conocimiento

app = FastAPI(title="Sistema Experto VARK")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class RespuestasInput(BaseModel):
    categorias: list[str]


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/")
def health_check():
    return {"status": "Sistema Experto VARK activo (powered by experta)"}


# ── Analizar respuestas ───────────────────────────────────────────────────────
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


# ── Recomendaciones por perfil ─────────────────────────────────────────────── 
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