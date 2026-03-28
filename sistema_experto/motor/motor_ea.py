# motor_ea.py - cerebro del sistema experto

# hechos
from hechos.hechos_ea import (
    PuntajesVARK, PerfilDominante, Recomendacion, RECOMENDACIONES
)

# reglas
from reglas.reglas_ea import MotorVARK

# =================================================================
# Estilos de aprendizaje
# =================================================================

# recibe una lista de categorias y devuelve un diccionario de puntajes
def procesar_respuestas(categorias: list[str]) -> dict:

    # 1. Calcular conteo de categorias
    puntajes = {"V": 0, "A": 0, "R": 0, "K": 0}
    for cat in categorias:  # recorre la lista hasta n final
        if cat in puntajes:
            puntajes[cat] += 1

    
    '''
    total = len(categorias) # 16
    porcentajes = {
        k: round((v / total) * 100) if total > 0 else 0 
        for k, v in puntajes.items()
    }
    '''
    
    # calcula porcentajes
    total = len(categorias)  # 16
    porcentajes = {} # -> {"V" : 25% , "A" : 10% , ... } 

    for k, v in puntajes.items():
        if total > 0:
            porcentajes[k] = ((v / total) * 100) # Ej V: (2 / 8 * 100 ) = 25%
        else:
            porcentajes[k] = 0

    # 2. Crear el motor de inferencia
    motor = MotorVARK() 
    motor.reset()

    # guarda puntajes en la WM del motor
    motor.declare(
        PuntajesVARK(
            v=puntajes["V"],
            a=puntajes["A"],
            r=puntajes["R"],
            k=puntajes["K"],
            total=total,
        )
    )

    # 3. Ejecutar inferencias (forward chaining) - lee hechos hasta el momento y aplica reglas
    motor.run() # va a las reglas

    # 4. Recorre resultados de la Working Memory de lo que tiene hasta ahora el motor: PuntajesVARK,  PerfilDominante y Recomendacion
    perfil_hecho = None
    for fact in motor.facts.values():
        if isinstance(fact, PerfilDominante): #1. fact = PuntajesVARK (No, lo ignora) 2. fact = PerfilDominante(perfil="AR", nombre="Auditivo-Lector") (SI)
            perfil_hecho = fact
            break

    if perfil_hecho is None:
        raise RuntimeError("El motor no pudo determinar un perfil. Revisa las reglas.")

    perfil = perfil_hecho["perfil"] 
    nombre = perfil_hecho["nombre"]

    # recorrer recomendaciones por estilo
    recomendaciones: dict[str, list[str]] = {}
    for fact in motor.facts.values():
        if isinstance(fact, Recomendacion):
            estilo = fact["estilo"]
            recomendaciones.setdefault(estilo, []).append(fact["texto"])
    
    # 5. Construir y devolver el resultado
    return {
        "puntaje_v":      puntajes["V"],
        "puntaje_a":      puntajes["A"],
        "puntaje_r":      puntajes["R"],
        "puntaje_k":      puntajes["K"],
        "porcentaje_v":   porcentajes["V"],
        "porcentaje_a":   porcentajes["A"],
        "porcentaje_r":   porcentajes["R"],
        "porcentaje_k":   porcentajes["K"],
        "perfil_dominante": perfil,
        "nombre_perfil":    nombre,
        "recomendaciones":  recomendaciones,
    }


def obtener_recomendaciones_perfil(perfil: str) -> dict[str, list[str]]:
    """
    Consulta las recomendaciones de la base de conocimiento por perfil.
    No requiere disparar el motor de inferencia.
    """
    perfil = perfil.upper()
    resultado: dict[str, list[str]] = {}
    for letra in perfil:
        if letra in RECOMENDACIONES:
            resultado[letra] = RECOMENDACIONES[letra]
    return resultado