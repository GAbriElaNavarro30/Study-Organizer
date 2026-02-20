"""
app.py — API REST del Sistema Experto VARK
FastAPI + Uvicorn

Endpoints:
    GET  /            → Health check
    POST /diagnostico → Recibe respuestas, retorna diagnóstico completo
    GET  /estilos     → Lista todos los estilos y sus descripciones

Ejecutar:
    pip install fastapi uvicorn
    python app.py
    → http://localhost:8000
    → http://localhost:8000/docs  (Swagger UI automático)
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from typing import List
import uvicorn

from hechos import ESTILOS, NOMBRES, DESCRIPCIONES, RECOMENDACIONES, TOTAL_PREGUNTAS, OPCION_A_ESTILO, PREGUNTAS
from motor import inferir


# ─── APP ──────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Sistema Experto VARK",
    description="Motor de inferencia para determinar el estilo de aprendizaje según el modelo VARK.",
    version="1.0.0",
)

# CORS — permite que el frontend React/Next.js llame a esta API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # En producción pon tu dominio exacto
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── MODELOS PYDANTIC (schemas) ───────────────────────────────────────────────

class SolicitudDiagnostico(BaseModel):
    """
    Cuerpo de la petición POST /diagnostico
    respuestas: lista de índices 0-3 (uno por pregunta)
                0=Visual, 1=Auditivo, 2=Lectura/Escritura, 3=Kinestésico
    """
    respuestas: List[int]

    @field_validator("respuestas")
    @classmethod
    def validar_respuestas(cls, v):
        if len(v) != TOTAL_PREGUNTAS:
            raise ValueError(
                f"Se requieren exactamente {TOTAL_PREGUNTAS} respuestas, "
                f"se recibieron {len(v)}."
            )
        opciones_validas = set(OPCION_A_ESTILO.keys())
        for i, r in enumerate(v):
            if r not in opciones_validas:
                raise ValueError(
                    f"Respuesta inválida en posición {i}: '{r}'. "
                    f"Valores válidos: {sorted(opciones_validas)}."
                )
        return v

    model_config = {
        "json_schema_extra": {
            "example": {
                "respuestas": [0, 2, 1, 0, 3, 0, 2, 1, 0, 3, 0, 2]
            }
        }
    }


# ─── ENDPOINTS ────────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
def raiz():
    """Health check — verifica que la API esté corriendo."""
    return {
        "status": "ok",
        "mensaje": "Sistema Experto VARK activo.",
        "version": "1.0.0",
    }


@app.get("/estilos", tags=["Información"])
def obtener_estilos():
    """
    Retorna la lista de todos los estilos VARK con su nombre,
    descripción y recomendaciones.
    Útil para que el frontend construya la pantalla de información.
    """
    return {
        "estilos": [
            {
                "clave":          e,
                "nombre":         NOMBRES[e],
                "descripcion":    DESCRIPCIONES[e],
                "recomendaciones": RECOMENDACIONES[e],
            }
            for e in ESTILOS
        ]
    }


@app.get("/preguntas", tags=["Información"])
def obtener_preguntas():
    """
    Retorna las 12 preguntas del cuestionario VARK con sus opciones.
    El frontend usa este endpoint para renderizar el quiz dinámicamente
    en lugar de tener las preguntas hardcodeadas en el componente React.
    Cada opción incluye su índice (0-3) para enviarlo en POST /diagnostico.
    """
    return {
        "total": TOTAL_PREGUNTAS,
        "preguntas": PREGUNTAS,
    }


@app.post("/diagnostico", tags=["Motor de Inferencia"])
def diagnostico(solicitud: SolicitudDiagnostico):
    """
    Recibe las respuestas del cuestionario y ejecuta el motor de inferencia.

    - **respuestas**: lista de 12 enteros (0-3), uno por pregunta.
      - 0 → Visual
      - 1 → Auditivo
      - 2 → Lectura/Escritura
      - 3 → Kinestésico

    Retorna el estilo dominante, scores, porcentajes, niveles y recomendaciones.
    """
    try:
        resultado = inferir(solicitud.respuestas)
        return {
            "ok": True,
            "diagnostico": resultado,
        }
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")


# ─── ENTRY POINT ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,       # recarga automática al editar archivos
    )