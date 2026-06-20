from hechos.hechos_ea import (
    PuntajesVARK, PerfilDominante, Recomendacion, RECOMENDACIONES,
    CriteriosCurso, PERFILES,
)

from reglas.reglas_ea import MotorVARK


def procesar_respuestas(categorias: list[str]) -> dict:

    puntajes = {"V": 0, "A": 0, "R": 0, "K": 0}
    for cat in categorias:
        if cat in puntajes:
            puntajes[cat] += 1
    
    
    total = len(categorias)
    porcentajes = {}

    for k, v in puntajes.items():
        if total > 0:
            porcentajes[k] = ((v / total) * 100)
        else:
            porcentajes[k] = 0

    # Crear el motor de inferencia
    motor = MotorVARK() 
    motor.reset()

    motor.declare(
        PuntajesVARK(
            v=puntajes["V"],
            a=puntajes["A"],
            r=puntajes["R"],
            k=puntajes["K"],
            total=total,
        )
    )

    motor.run()

    perfil_hecho = None
    for fact in motor.facts.values():
        if isinstance(fact, PerfilDominante):
            perfil_hecho = fact
            break

    if perfil_hecho is None:
        raise RuntimeError("El motor no pudo determinar un perfil. Revisa las reglas.")

    perfil = perfil_hecho["perfil"] 
    nombre = perfil_hecho["nombre"]

    recomendaciones: dict[str, list[str]] = {}
    for fact in motor.facts.values():
        if isinstance(fact, Recomendacion):
            estilo = fact["estilo"]
            recomendaciones.setdefault(estilo, []).append(fact["texto"])
    
    criterios_cursos = None
    for fact in motor.facts.values():
        if isinstance(fact, CriteriosCurso):
            criterios_cursos = {
                "perfil_exacto":   fact["perfil_exacto"],
                "perfiles_afines": fact["perfiles_afines"],
                "dimensiones": fact["dimensiones"],
            }
            break
    
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

    motor.declare(PerfilDominante(
        perfil=perfil,
        nombre=PERFILES.get(perfil, perfil)
    ))

    motor.run()

    for fact in motor.facts.values():
        if isinstance(fact, CriteriosCurso):
            return {
                "perfil_exacto":   fact["perfil_exacto"],
                "perfiles_afines": fact["perfiles_afines"],
                "dimensiones":     fact["dimensiones"],
            }

    return {"perfil_exacto": perfil, "perfiles_afines": [], "dimensiones": []}  