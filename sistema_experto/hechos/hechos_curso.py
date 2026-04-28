# hechos/hechos_curso.py

from experta import Fact, Field

# ─────────────────────────────────────────────────────────────
# Hechos de entrada
# ─────────────────────────────────────────────────────────────

class ResultadoExamen(Fact):
    """
    Hecho de entrada: porcentaje obtenido por el estudiante.
    porcentaje: float 0-100
    """
    porcentaje = Field(float, mandatory=True)


# ─────────────────────────────────────────────────────────────
# Hechos derivados (declarados por el motor)
# ─────────────────────────────────────────────────────────────

class NivelDesempeno(Fact):
    """
    Nivel determinado por el motor.
    nivel  : str  — clave interna ('excelente', 'muy_bueno', etc.)
    nombre : str  — etiqueta legible para el usuario
    """
    nivel  = Field(str, mandatory=True)
    nombre = Field(str, mandatory=True)


class Retroalimentacion(Fact):
    """
    Un mensaje de retroalimentación asociado al nivel.
    texto: str
    """
    texto = Field(str, mandatory=True)


# ─────────────────────────────────────────────────────────────
# Base de conocimiento estática
# ─────────────────────────────────────────────────────────────

NIVELES = {
    "excelente":  "Excelente",
    "muy_bueno":  "Muy bueno",
    "bueno":      "Bueno",
    "regular":    "Regular",
    "deficiente": "Deficiente",
}

RETROALIMENTACION = {
    "excelente": [
        "¡Felicitaciones! Obtuviste el puntaje perfecto.",
        "Dominas completamente los temas del curso.",
        "Tu desempeño es sobresaliente. ¡Sigue así!",
    ],
    "muy_bueno": [
        "Excelente trabajo, estás muy cerca de la perfección.",
        "Tienes un dominio muy sólido del contenido.",
        "Revisa los detalles menores para alcanzar el puntaje máximo.",
    ],
    "bueno": [
        "Buen trabajo. Comprendes la mayor parte del material.",
        "Hay algunos temas que puedes reforzar para mejorar.",
        "Considera repasar las secciones donde tuviste errores.",
    ],
    "regular": [
        "Aprobaste, pero hay áreas importantes que necesitas reforzar.",
        "Te recomendamos revisar el contenido del curso nuevamente.",
        "Con un poco más de estudio podrás mejorar notablemente.",
    ],
    "deficiente": [
        "No alcanzaste el puntaje mínimo recomendado.",
        "Te sugerimos retomar el curso desde el inicio.",
        "Repasa todos los contenidos y vuelve a intentarlo.",
    ],
} 