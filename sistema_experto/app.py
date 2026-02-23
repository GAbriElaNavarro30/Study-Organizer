from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from motor.motor_ea import procesar_respuestas
from reglas.reglas_ea import obtener_recomendaciones  # ← agregar esta importación

app = FastAPI(title="Sistema Experto VARK")

class RespuestasInput(BaseModel):
    categorias: list[str]

# ============================ endpoint de prueba para ver si funciona =================================
@app.get("/")
def health_check():
    return {"status": "Sistema Experto VARK activo"}

# ==================== analiza las respuests obtenidas del test con react y node js ====================
@app.post("/analizar")
def analizar_vark(data: RespuestasInput):
    if len(data.categorias) != 16:
        raise HTTPException(status_code=400, detail="Se requieren exactamente 16 respuestas")

    categorias_validas = {"V", "A", "R", "K"}
    for c in data.categorias:
        if c not in categorias_validas:
            raise HTTPException(status_code=400, detail=f"Categoría inválida: {c}. Solo se aceptan V, A, R, K")

    resultado = procesar_respuestas(data.categorias)
    return resultado

# =========== en base al perfil obtenido por mayor puntaje de respuestas da recomendaciones ============
@app.get("/recomendaciones/{perfil}")
def obtener_recomendaciones_perfil(perfil: str):
    recomendaciones = obtener_recomendaciones(perfil)
    return {"recomendaciones": recomendaciones}
