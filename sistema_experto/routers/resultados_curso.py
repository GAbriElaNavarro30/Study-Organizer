# routers/resultados_curso.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from motor.motor_curso import evaluar_resultado_curso

router = APIRouter(prefix="/cursos", tags=["Resultados de Cursos"])


# ─────────────────────────────────────────────────────────────
# Esquemas
# ─────────────────────────────────────────────────────────────

class ResultadoInput(BaseModel):
    porcentaje: float = Field(
        ...,
        ge=0,
        le=100,
        description="Porcentaje obtenido por el estudiante (0-100)",
    )


class ResultadoOutput(BaseModel):
    nivel:             str
    nombre_nivel:      str
    retroalimentacion: list[str]


# ─────────────────────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────────────────────

@router.post("/evaluar", response_model=ResultadoOutput)
def evaluar_curso(data: ResultadoInput):
    """
    Recibe el porcentaje obtenido y devuelve el nivel de
    desempeño determinado por el sistema experto.
    """
    try: 
        resultado = evaluar_resultado_curso(data.porcentaje)
        return resultado
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))