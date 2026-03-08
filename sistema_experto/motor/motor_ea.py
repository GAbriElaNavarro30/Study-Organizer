# motor_ea.py
# El motor es la capa que:
#   1. Convierte las respuestas brutas en Hechos (WM inicial)
#   2. Lanza el ciclo de inferencia de experta
#   3. Extrae las conclusiones de la Working Memory final

from hechos.hechos_ea import PuntajesVARK, PerfilDominante, Recomendacion
from reglas.reglas_ea import MotorVARK


def procesar_respuestas(categorias: list[str]) -> dict:
    """
    Punto de entrada principal.
    Recibe la lista de categorías respondidas ("V", "A", "R", "K")
    y devuelve el resultado completo inferido por el sistema experto.
    """

    # ------------------------------------------------------------------
    # PASO 1: Calcular hechos base (conteo de respuestas)
    # ------------------------------------------------------------------
    puntajes = {"V": 0, "A": 0, "R": 0, "K": 0}
    for cat in categorias:
        if cat in puntajes:
            puntajes[cat] += 1

    total = len(categorias)
    porcentajes = {
        k: round((v / total) * 100) if total > 0 else 0
        for k, v in puntajes.items()
    }

    # ------------------------------------------------------------------
    # PASO 2: Crear el motor e insertar hechos en la Working Memory
    # ------------------------------------------------------------------
    motor = MotorVARK()
    motor.reset()  # inicializa la WM

    # Insertar el hecho de puntajes: las reglas lo usarán para inferir
    motor.declare(
        PuntajesVARK(
            v=puntajes["V"],
            a=puntajes["A"],
            r=puntajes["R"],
            k=puntajes["K"],
            total=total,
        )
    )

    # ------------------------------------------------------------------
    # PASO 3: Ejecutar el ciclo de inferencia (forward chaining)
    # experta disparará automáticamente todas las reglas que apliquen
    # ------------------------------------------------------------------
    motor.run()

    # ------------------------------------------------------------------
    # PASO 4: Leer conclusiones de la Working Memory
    # ------------------------------------------------------------------
    perfil_hecho = None
    for fact in motor.facts.values():
        if isinstance(fact, PerfilDominante):
            perfil_hecho = fact
            break

    if perfil_hecho is None:
        raise RuntimeError("El motor no pudo determinar un perfil. Revisa las reglas.")

    perfil     = perfil_hecho["perfil"]
    nombre     = perfil_hecho["nombre"]

    # Recopilar recomendaciones agrupadas por estilo
    recomendaciones: dict[str, list[str]] = {}
    for fact in motor.facts.values():
        if isinstance(fact, Recomendacion):
            estilo = fact["estilo"]
            recomendaciones.setdefault(estilo, []).append(fact["texto"])

    # ------------------------------------------------------------------
    # PASO 5: Construir y devolver el resultado
    # ------------------------------------------------------------------
    return {
        "puntaje_v": puntajes["V"],
        "puntaje_a": puntajes["A"],
        "puntaje_r": puntajes["R"],
        "puntaje_k": puntajes["K"],
        "porcentaje_v": porcentajes["V"],
        "porcentaje_a": porcentajes["A"],
        "porcentaje_r": porcentajes["R"],
        "porcentaje_k": porcentajes["K"],
        "perfil_dominante": perfil,
        "nombre_perfil":    nombre,
        "recomendaciones":  recomendaciones,
    }