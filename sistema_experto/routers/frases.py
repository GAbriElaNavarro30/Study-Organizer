# routers/frases.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator

router = APIRouter(prefix="/frases", tags=["Frases Emocionales"])


# ─────────────────────────────────────────────────────────────
# Esquemas
# ─────────────────────────────────────────────────────────────

CLASIFICACIONES_VALIDAS = {"positiva", "neutra", "negativa"}
NIVELES_VALIDOS         = {"bajo", "medio", "alto", "critico"}


class FraseInput(BaseModel):
    clasificacion: str = Field(..., description="positiva | neutra | negativa")
    nivel:         str = Field(..., description="bajo | medio | alto")

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
    frase: str
    tipo:  str


# ─────────────────────────────────────────────────────────────
# Endpoint
# ─────────────────────────────────────────────────────────────

@router.post("/obtener", response_model=FraseOutput)
def obtener_frase_emocional(data: FraseInput):
    """
    Recibe la clasificación y nivel emocional del día
    y devuelve una frase aleatoria del pool correspondiente.
    """
    try:
        from motor.motor_frase import obtener_frase
        return obtener_frase(
            clasificacion=data.clasificacion,
            nivel=data.nivel,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))