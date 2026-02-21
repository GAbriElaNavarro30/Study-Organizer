from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from typing import List
import uvicorn

from motor.motor_ea import procesar_respuestas


app = FastAPI(title="Sistema Experto VARK")


class RespuestasInput(BaseModel):
    categorias: list[str]  # ["V", "K", "A", "V", ...]


@app.post("/analizar")
def analizar_vark(data: RespuestasInput):
    if len(data.categorias) != 16:
        raise HTTPException(
            status_code=400,
            detail="Se requieren exactamente 16 respuestas"
        )

    categorias_validas = {"V", "A", "R", "K"}
    for c in data.categorias:
        if c not in categorias_validas:
            raise HTTPException(
                status_code=400,
                detail=f"Categoría inválida: {c}. Solo se aceptan V, A, R, K"
            )

    resultado = procesar_respuestas(data.categorias)
    return resultado


@app.get("/")
def health_check():
    return {"status": "Sistema Experto VARK activo"}