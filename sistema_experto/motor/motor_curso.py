# motor/motor_curso.py

from hechos.hechos_curso import (
    ResultadoExamen,
    NivelDesempeno,
    Retroalimentacion,
)
from reglas.reglas_curso import MotorResultadoCurso


# =============================================================
# Función principal — recibe el porcentaje y devuelve
# el nivel y la retroalimentación determinados por el motor.
# =============================================================

def evaluar_resultado_curso(porcentaje: float) -> dict:
    """
    Procesa el porcentaje obtenido en un curso y devuelve
    el nivel de desempeño junto con la retroalimentación.

    Args:
        porcentaje: float entre 0 y 100 (puede ser decimal, ej. 83.33)

    Returns:
        dict con:
            nivel         — clave interna ('excelente', 'muy_bueno', …)
            nombre_nivel  — etiqueta legible ('Excelente', 'Muy bueno', …)
            retroalimentacion — list[str] con los mensajes del motor
    """
    # 1. Crear e inicializar el motor
    motor = MotorResultadoCurso()
    motor.reset()

    # 2. Declarar el hecho de entrada en la Working Memory
    motor.declare(ResultadoExamen(porcentaje=float(porcentaje)))

    # 3. Ejecutar el encadenamiento hacia adelante
    motor.run()

    # 4. Recoger el NivelDesempeno de la WM
    nivel_hecho = None
    for fact in motor.facts.values():
        if isinstance(fact, NivelDesempeno):
            nivel_hecho = fact
            break

    if nivel_hecho is None:
        raise RuntimeError(
            f"El motor no pudo determinar un nivel para el porcentaje {porcentaje}. "
            "Revisa las reglas."
        )

    nivel  = nivel_hecho["nivel"]
    nombre = nivel_hecho["nombre"]

    # 5. Recoger los mensajes de retroalimentación
    retroalimentacion: list[str] = []
    for fact in motor.facts.values():
        if isinstance(fact, Retroalimentacion):
            retroalimentacion.append(fact["texto"])

    # 6. Devolver resultado estructurado
    return {
        "nivel":             nivel,
        "nombre_nivel":      nombre,
        "retroalimentacion": retroalimentacion,
    }