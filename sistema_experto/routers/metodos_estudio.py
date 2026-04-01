# routers/metodos_estudio.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from motor.motor_me import procesar_test_me

router = APIRouter(prefix="/me", tags=["Métodos de Estudio"])


class RespuestaItem(BaseModel):
    id_pregunta:  int
    id_dimension: int
    valor:        int   # 1-4
    es_negativa:  bool


class TestMEInput(BaseModel):
    respuestas:  list[RespuestaItem]
    perfil_vark: str = "VARK"


@router.post("/analizar-me")
def analizar_me(data: TestMEInput):
    if len(data.respuestas) != 36:
        raise HTTPException(
            status_code=400,
            detail=f"Se requieren exactamente 36 respuestas (recibidas: {len(data.respuestas)})",
        )
    for r in data.respuestas:
        if r.valor not in (1, 2, 3, 4):
            raise HTTPException(
                status_code=400,
                detail=f"Valor inválido {r.valor} en pregunta {r.id_pregunta}. Use 1-4.",
            )
    # model_dump() es compatible con Pydantic v1 y v2
    return procesar_test_me(
        [r.model_dump() for r in data.respuestas],
        data.perfil_vark,
    )