# reglas.py
# Reglas del sistema experto, equivalente a las reglas en Prolog

from hechos.hechos_ea import PERFILES, RECOMENDACIONES

def determinar_perfil(puntajes: dict) -> str:
    """
    Determina el perfil dominante según los puntajes V, A, R, K.
    Reglas aplicadas en orden de prioridad (como en Prolog).
    """
    v = puntajes["V"]
    a = puntajes["A"]
    r = puntajes["R"]
    k = puntajes["K"]
    #total = v + a + r + k

    # Validar puntajes para devoler sting de perfil
    max_puntaje = max(v, a, r, k)

    dominantes = []

    if v == max_puntaje:
        dominantes.append("V")
    if a == max_puntaje:
        dominantes.append("A")
    if r == max_puntaje:
        dominantes.append("R")
    if k == max_puntaje:
        dominantes.append("K")

    if len(dominantes) == 4:
        return "VARK"

    if len(dominantes) == 3:
        return "".join(dominantes)

    if len(dominantes) == 2:
        return "".join(dominantes)

    if len(dominantes) == 1:
        return dominantes[0]
    
# de acuerdo al perfil obtener recomendaciones    
def obtener_recomendaciones(perfil: str) -> dict:
    recomendaciones_por_perfil = {}

    for letra in perfil:
        if letra in RECOMENDACIONES:
            recomendaciones_por_perfil[letra] = RECOMENDACIONES[letra]

    return recomendaciones_por_perfil