#reglas.py

"""
reglas.py — Reglas del Sistema Experto VARK
Equivalente a las cláusulas/reglas en Prolog:
    es_dominante(E, Puntos) :- puntos(E, Puntos), Puntos >= 5.
    nivel(E, dominante)     :- es_dominante(E, _).
    perfil_mixto            :- hay_empate(_, _).
"""

'''
from hechos import UMBRALES, ESTILOS


# ─── REGLA 1: Clasificar nivel de un estilo ───────────────────────────────────
# En Prolog:
#   nivel(E, dominante) :- puntos(E, P), P >= 5.
#   nivel(E, fuerte)    :- puntos(E, P), P >= 3, P < 5.
#   nivel(E, moderado)  :- puntos(E, P), P >= 2, P < 3.
#   nivel(E, debil)     :- puntos(E, P), P >= 1, P < 2.
#   nivel(E, nulo)      :- puntos(E, 0).
def clasificar_nivel(puntos: int) -> str:
    """Devuelve el nivel de un estilo según sus puntos."""
    if puntos >= UMBRALES["dominante"]:
        return "dominante"
    elif puntos >= UMBRALES["fuerte"]:
        return "fuerte"
    elif puntos >= UMBRALES["moderado"]:
        return "moderado"
    elif puntos >= UMBRALES["debil"]:
        return "débil"
    else:
        return "nulo"


# ─── REGLA 2: Determinar el estilo dominante ──────────────────────────────────
# En Prolog:
#   estilo_dominante(E) :-
#       puntos(E, P),
#       \+ (estilo(Otro), Otro \= E, puntos(Otro, Q), Q > P).
def determinar_dominante(scores: dict) -> str:
    """Devuelve la clave del estilo con mayor puntaje."""
    return max(scores, key=lambda e: scores[e])


# ─── REGLA 3: Detectar empate ─────────────────────────────────────────────────
# En Prolog:
#   hay_empate(E1, E2) :-
#       estilo(E1), estilo(E2), E1 \= E2,
#       puntos(E1, P), puntos(E2, P).
def hay_empate(scores: dict) -> bool:
    """Verdadero si dos o más estilos comparten el puntaje máximo."""
    max_val = max(scores.values())
    ganadores = [e for e in scores if scores[e] == max_val]
    return len(ganadores) > 1


# ─── REGLA 4: Obtener todos los estilos empatados ────────────────────────────
# En Prolog:
#   estilos_empatados(Lista) :- findall(E, hay_empate(E, _), Lista).
def estilos_empatados(scores: dict) -> list:
    """Retorna lista de estilos que comparten el puntaje máximo."""
    max_val = max(scores.values())
    return [e for e in ESTILOS if scores[e] == max_val]


# ─── REGLA 5: Perfil multimodal ───────────────────────────────────────────────
# En Prolog:
#   perfil_multimodal :- findall(E, (estilo(E), puntos(E, P), P >= 3), L), length(L, N), N >= 2.
def es_multimodal(scores: dict) -> bool:
    """Verdadero si el estudiante tiene 2 o más estilos con puntaje fuerte."""
    fuertes = [e for e in scores if scores[e] >= UMBRALES["fuerte"]]
    return len(fuertes) >= 2


# ─── REGLA 6: Calcular porcentaje de cada estilo ─────────────────────────────
# En Prolog:
#   porcentaje(E, Pct) :- puntos(E, P), total(T), Pct is (P / T) * 100.
def calcular_porcentajes(scores: dict, total: int) -> dict:
    """Devuelve el porcentaje que representa cada estilo sobre el total."""
    if total == 0:
        return {e: 0.0 for e in scores}
    return {e: round((scores[e] / total) * 100, 1) for e in scores}


# ─── REGLA 7: Validar que todas las preguntas fueron contestadas ──────────────
# En Prolog:
#   cuestionario_completo :- total_respuestas(N), total_preguntas(N).
def cuestionario_completo(respuestas: list, total_preguntas: int) -> bool:
    """Verdadero si el número de respuestas iguala al total de preguntas."""
    return len(respuestas) == total_preguntas


# ─── REGLA 8: Generar mensaje de perfil ──────────────────────────────────────
# En Prolog:
#   mensaje_perfil(multimodal) :- es_multimodal.
#   mensaje_perfil(empate)     :- hay_empate(_, _).
#   mensaje_perfil(unico)      :- \+ es_multimodal, \+ hay_empate(_, _).
def tipo_perfil(scores: dict) -> str:
    """Clasifica el tipo de perfil del estudiante."""
    if hay_empate(scores):
        return "empate"
    elif es_multimodal(scores):
        return "multimodal"
    else:
        return "unico"
'''