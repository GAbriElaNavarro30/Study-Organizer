# motor.py
from reglas.reglas_ea import determinar_perfil, obtener_recomendaciones
from hechos.hechos_ea import PERFILES

# aqui se procesa las rspuestas y contara los puntajes para pasarselos a las reglas
def procesar_respuestas(categorias: list) -> dict:
    """
    Recibe lista de categorías respondidas por el usuario.
    Ejemplo: ["V", "K", "A", "V", "R", ...]
    Aplica las reglas y devuelve el resultado completo.
    """

    # Paso 1: Contar puntajes (hechos derivados)
    puntajes = {"V": 0, "A": 0, "R": 0, "K": 0}
    
    for categoria in categorias:
        if categoria in puntajes:
            puntajes[categoria] += 1

    # Paso 2: Aplicar reglas para determinar perfil
    perfil_dominante = determinar_perfil(puntajes)

    # Paso 3: Obtener recomendaciones según perfil
    recomendaciones = obtener_recomendaciones(perfil_dominante)

    # Paso 4: Obtener nombre legible del perfil
    nombre_perfil = PERFILES.get[perfil_dominante]

    return {
        "puntaje_v": puntajes["V"],
        "puntaje_a": puntajes["A"],
        "puntaje_r": puntajes["R"],
        "puntaje_k": puntajes["K"],
        "perfil_dominante": perfil_dominante,
        "nombre_perfil": nombre_perfil,
        "recomendaciones": recomendaciones
    }