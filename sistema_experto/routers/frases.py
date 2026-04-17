# routers/frases.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator

router = APIRouter(prefix="/frases", tags=["Frases Emocionales"])


# ─────────────────────────────────────────────────────────────
# Esquemas
# ─────────────────────────────────────────────────────────────

CLASIFICACIONES_VALIDAS = {"positiva", "neutra", "negativa"}
NIVELES_VALIDOS         = {"bajo", "medio", "alto"}


class FraseInput(BaseModel):
    clasificacion:     str = Field(..., description="positiva | neutra | negativa | critica")
    nivel:             str = Field(..., description="bajo | medio | alto")
    dias_consecutivos: int = Field(
        default=0,
        ge=0,
        description="Días seguidos con emoción negativa/crítica (0 si hoy es positivo/neutro)",
    )

    @field_validator("clasificacion")
    @classmethod
    def validar_clasificacion(cls, v: str) -> str:
        v = v.lower()
        if v not in CLASIFICACIONES_VALIDAS:
            raise ValueError(f"clasificacion debe ser una de: {CLASIFICACIONES_VALIDAS}")
        return v

    @field_validator("nivel")
    @classmethod
    def validar_nivel(cls, v: str) -> str:
        v = v.lower()
        if v not in NIVELES_VALIDOS:
            raise ValueError(f"nivel debe ser uno de: {NIVELES_VALIDOS}")
        return v


class FraseOutput(BaseModel):
    frase:          str
    tipo:           str
    mostrar_alerta: bool


# ─────────────────────────────────────────────────────────────
# Endpoint
# ─────────────────────────────────────────────────────────────

@router.post("/obtener", response_model=FraseOutput)
def obtener_frase_emocional(data: FraseInput):
    """
    Recibe el estado emocional del día y devuelve una frase
    personalizada determinada por el sistema experto.

    El campo `mostrar_alerta` indica al frontend si debe
    mostrar además el banner de alerta de apoyo especializado.
    """
    try:
        from motor.motor_frase import obtener_frase
        resultado = obtener_frase(
            clasificacion=data.clasificacion,
            nivel=data.nivel,
            dias_consecutivos=data.dias_consecutivos,
        )
        return resultado
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))