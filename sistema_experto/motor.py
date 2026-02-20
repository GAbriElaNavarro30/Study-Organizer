# motor.py

"""
motor.py — Motor de Inferencia del Sistema Experto VARK
Encadenamiento hacia adelante (forward chaining), similar al motor de Prolog.

Flujo:
    1. Recibe lista de respuestas (índices 0-3)
    2. Convierte respuestas a hechos (scores por estilo)
    3. Aplica reglas en orden para inferir conclusiones
    4. Retorna diagnóstico completo

En Prolog esto equivaldría a la resolución SLD que lanza el ?- consultar(Respuestas, Diagnostico).
"""

'''
from hechos import (
    OPCION_A_ESTILO,
    ESTILOS,
    NOMBRES,
    DESCRIPCIONES,
    RECOMENDACIONES,
    TOTAL_PREGUNTAS,
)
from reglas import (
    clasificar_nivel,
    determinar_dominante,
    hay_empate,
    estilos_empatados,
    es_multimodal,
    calcular_porcentajes,
    cuestionario_completo,
    tipo_perfil,
)


# ─── PASO 1: Acumulación de hechos desde respuestas ──────────────────────────
# En Prolog: assert(puntos(v, N)) por cada respuesta visual.
def acumular_scores(respuestas: list) -> dict:
    """
    Convierte lista de índices de respuesta en scores por estilo.
    Cada índice 0-3 mapea a V, A, R, K respectivamente.

    Ejemplo: [0, 2, 1, 0, 3] → {"V": 2, "A": 1, "R": 1, "K": 1}
    """
    scores = {e: 0 for e in ESTILOS}
    for opcion in respuestas:
        estilo = OPCION_A_ESTILO.get(opcion)
        if estilo:
            scores[estilo] += 1
    return scores


# ─── PASO 2: Inferencia principal ────────────────────────────────────────────
# En Prolog: diagnosticar(Respuestas, Diagnostico) :- ... (todas las reglas juntas)
def inferir(respuestas: list) -> dict:
    """
    Motor de inferencia principal.
    Recibe lista de índices de respuesta y retorna el diagnóstico completo.
    """

    # ── Validación previa ────────────────────────────────────────────────────
    # En Prolog: precondicion :- cuestionario_completo.
    if not cuestionario_completo(respuestas, TOTAL_PREGUNTAS):
        raise ValueError(
            f"Se esperaban {TOTAL_PREGUNTAS} respuestas, "
            f"se recibieron {len(respuestas)}."
        )

    for i, r in enumerate(respuestas):
        if r not in OPCION_A_ESTILO:
            raise ValueError(
                f"Respuesta inválida en posición {i}: '{r}'. "
                f"Los valores válidos son {list(OPCION_A_ESTILO.keys())}."
            )

    # ── Hecho base: puntajes ─────────────────────────────────────────────────
    scores = acumular_scores(respuestas)

    # ── Aplicar reglas ───────────────────────────────────────────────────────
    dominante   = determinar_dominante(scores)
    perfil      = tipo_perfil(scores)
    porcentajes = calcular_porcentajes(scores, TOTAL_PREGUNTAS)

    # Niveles individuales por estilo
    niveles = {e: clasificar_nivel(scores[e]) for e in ESTILOS}

    # Lista de estilos en orden descendente de puntaje
    ranking = sorted(ESTILOS, key=lambda e: scores[e], reverse=True)

    # ── Construir diagnóstico ────────────────────────────────────────────────
    diagnostico = {
        # Resultado principal
        "estilo_dominante": dominante,
        "nombre_dominante": NOMBRES[dominante],
        "descripcion":      DESCRIPCIONES[dominante],
        "recomendaciones":  RECOMENDACIONES[dominante],

        # Detalles numéricos
        "scores":       scores,
        "porcentajes":  porcentajes,
        "niveles":      niveles,
        "ranking":      ranking,

        # Metadatos del perfil
        "tipo_perfil":      perfil,
        "es_multimodal":    es_multimodal(scores),
        "hay_empate":       hay_empate(scores),
        "estilos_empatados": estilos_empatados(scores) if hay_empate(scores) else [],

        # Otros estilos con info completa
        "otros_estilos": [
            {
                "clave":       e,
                "nombre":      NOMBRES[e],
                "puntos":      scores[e],
                "porcentaje":  porcentajes[e],
                "nivel":       niveles[e],
            }
            for e in ranking if e != dominante
        ],
    }

    return diagnostico
'''