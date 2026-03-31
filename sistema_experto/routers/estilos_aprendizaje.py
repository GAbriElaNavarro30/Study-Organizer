from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from motor.motor_ea import procesar_respuestas, obtener_recomendaciones_perfil

router = APIRouter(prefix="/ea", tags=["Estilos de Aprendizaje"])

class RespuestasInput(BaseModel):
    categorias: list[str]

@router.post("/analizar")
def analizar_vark(data: RespuestasInput):
    if len(data.categorias) < 16:
        raise HTTPException(status_code=400, detail="Se requieren al menos 16 respuestas")
    categorias_validas = {"V", "A", "R", "K"}
    for c in data.categorias:
        if c not in categorias_validas:
            raise HTTPException(status_code=400, detail=f"Categoría inválida: {c}")
    return procesar_respuestas(data.categorias)

@router.get("/recomendaciones/{perfil}")
def obtener_recomendaciones(perfil: str):
    resultado = obtener_recomendaciones_perfil(perfil)
    if not resultado:
        raise HTTPException(status_code=404, detail=f"Perfil '{perfil.upper()}' no reconocido")
    return {"recomendaciones": resultado}