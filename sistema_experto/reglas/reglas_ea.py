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
def obtener_recomendaciones(perfil: str) -> list:
    """
    Devuelve las recomendaciones según el perfil.
    Si es multimodal, combina las recomendaciones de cada letra.
    """
    recomendaciones_finales = []

    for letra in perfil:
        if letra in RECOMENDACIONES:
            recomendaciones_finales.extend(RECOMENDACIONES[letra])

    return recomendaciones_finales

    # Regla 1: Si todas las categorías tienen puntaje similar → Multimodal
    #puntajes_lista = [v, a, r, k]
    #max_p = max(puntajes_lista)
    #min_p = min(puntajes_lista)

    #if max_p - min_p <= UMBRAL_MULTIMODAL:
    #    return "VARK"

    # Regla 2: Determinar cuáles categorías son dominantes
    #dominantes = []
    #for categoria, puntaje in [("V", v), ("A", a), ("R", r), ("K", k)]:
    #    if puntaje >= UMBRAL_DOMINANTE:
    #        dominantes.append((categoria, puntaje))

    # Ordenar por puntaje descendente
    #dominantes.sort(key=lambda x: x[1], reverse=True)
    #claves = [d[0] for d in dominantes]

    # Regla 3: Un solo dominante
    #if len(claves) == 1:
    #    return claves[0]

    # Regla 4: Dos dominantes
    #if len(claves) == 2:
    #    return "".join(claves)

    # Regla 5: Tres dominantes
    #if len(claves) == 3:
    #    return "".join(claves)

    # Regla 6: Si ninguno supera el umbral, tomar el más alto
    #max_categoria = max([("V", v), ("A", a), ("R", r), ("K", k)], key=lambda x: x[1])
    #return max_categoria[0]


#def obtener_recomendaciones(perfil: str) -> list:
#    """
#    Devuelve recomendaciones según el perfil dominante.
#    Si es multimodal o combinado, mezcla recomendaciones de cada categoría.
#    """
#    recomendaciones = []

#    for categoria in perfil:  # itera letra por letra: "VA" → ["V", "A"]
#        if categoria in RECOMENDACIONES:
#            # Toma las 2 mejores recomendaciones de cada categoría dominante
#            recomendaciones.extend(RECOMENDACIONES[categoria][:2])

    # Si es un perfil simple, devolver todas sus recomendaciones
#    if len(perfil) == 1:
#        recomendaciones = RECOMENDACIONES[perfil]

#    return recomendaciones