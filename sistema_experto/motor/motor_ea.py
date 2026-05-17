# motor_ea.py - cerebro del sistema experto

# hechos
from hechos.hechos_ea import (
    PuntajesVARK, PerfilDominante, Recomendacion, RECOMENDACIONES,
    CriteriosCurso, PERFILES,
)

from reglas.reglas_ea import MotorVARK

# recibe una lista de categorias y devuelve un diccionario de puntajes
def procesar_respuestas(categorias: list[str]) -> dict:

    # 1. Calcular conteo de categorias
    puntajes = {"V": 0, "A": 0, "R": 0, "K": 0}
    for cat in categorias:  # recorre la lista hasta n final
        if cat in puntajes:
            puntajes[cat] += 1
    
    # calcula porcentajes
    total = len(categorias)
    porcentajes = {}

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
    motor.run()

    # 4. Recorre resultados de la Working Memory de lo que tiene hasta ahora el motor: PuntajesVARK,  PerfilDominante y Recomendacion
    perfil_hecho = None
    for fact in motor.facts.values():
        if isinstance(fact, PerfilDominante):
            perfil_hecho = fact
            break

    if perfil_hecho is None:
        raise RuntimeError("El motor no pudo determinar un perfil. Revisa las reglas.")

    perfil = perfil_hecho["perfil"] 
    nombre = perfil_hecho["nombre"]

    # recorrer recomendaciones por estilo generadas por el motor
    recomendaciones: dict[str, list[str]] = {}
    for fact in motor.facts.values():
        if isinstance(fact, Recomendacion):
            estilo = fact["estilo"]
            recomendaciones.setdefault(estilo, []).append(fact["texto"])
    
    # Recoger criterios de cursos compatibles con el perfil
    criterios_cursos = None
    for fact in motor.facts.values():
        if isinstance(fact, CriteriosCurso):
            criterios_cursos = {
                "perfil_exacto":   fact["perfil_exacto"],
                "perfiles_afines": fact["perfiles_afines"],
                "dimensiones": fact["dimensiones"],
            }
            break
    
    # 5. Construir y devolver el resultado al router
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
        "criterios_cursos": criterios_cursos,
    }


def obtener_recomendaciones_perfil(perfil: str) -> dict[str, list[str]]:
    perfil = perfil.upper()
    resultado: dict[str, list[str]] = {}
    for letra in perfil:
        if letra in RECOMENDACIONES:
            resultado[letra] = RECOMENDACIONES[letra]
    return resultado   


def obtener_criterios_perfil(perfil: str) -> dict:
    perfil = perfil.upper()

    motor = MotorVARK()
    motor.reset()

    # Declaramos directamente el PerfilDominante, salta el bloque de puntajes
    motor.declare(PerfilDominante(
        perfil=perfil,
        nombre=PERFILES.get(perfil, perfil)
    ))

    motor.run()

    # Recoger el CriteriosCurso que generaron las reglas
    for fact in motor.facts.values():
        if isinstance(fact, CriteriosCurso):
            return {
                "perfil_exacto":   fact["perfil_exacto"],
                "perfiles_afines": fact["perfiles_afines"],
                "dimensiones":     fact["dimensiones"],
            }

    # Fallback por si algo falla, no genera criterios
    return {"perfil_exacto": perfil, "perfiles_afines": [], "dimensiones": []}  