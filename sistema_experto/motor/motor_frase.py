# motor/motor_frase.py

import random

from hechos.hechos_frase import (
    EstadoEmocional,
    TipoFrase,
    FRASES,
)
from reglas.reglas_frase import MotorFrase


def obtener_frase(
    clasificacion: str,
    nivel: str,
    dias_consecutivos: int = 0,
) -> dict:
    """
    Dado el estado emocional del día, devuelve una frase
    seleccionada aleatoriamente del pool correspondiente.

    Args:
        clasificacion     : 'positiva' | 'neutra' | 'negativa' | 'critica'
        nivel             : 'bajo' | 'medio' | 'alto'
        dias_consecutivos : días seguidos con clasificación negativa/crítica
                            (pasar 0 si hoy es positivo o neutro)

    Returns:
        {
            "frase"         : str,
            "tipo"          : str,   # clave interna del pool usado
            "mostrar_alerta": bool,  # si el frontend debe mostrar el banner
        }
    """
    # 1. Crear e inicializar el motor
    motor = MotorFrase()
    motor.reset()

    # 2. Declarar el hecho de entrada
    motor.declare(EstadoEmocional(
        clasificacion=clasificacion.lower(),
        nivel=nivel.lower(),
        dias_consecutivos=int(dias_consecutivos),
    ))

    # 3. Ejecutar inferencias
    motor.run()

    # 4. Recoger el TipoFrase de mayor salience que se disparó
    tipo_hecho = None
    for fact in motor.facts.values():
        if isinstance(fact, TipoFrase):
            tipo_hecho = fact
            break          # solo se declara uno (la regla de mayor salience gana)

    if tipo_hecho is None:
        # Fallback defensivo: nunca debería ocurrir si las reglas están completas
        tipo_hecho_tipo = f"{clasificacion.lower()}_{nivel.lower()}"
        mostrar_alerta  = False
    else:
        tipo_hecho_tipo = tipo_hecho["tipo"]
        mostrar_alerta  = tipo_hecho["mostrar_alerta"]

    # 5. Seleccionar frase aleatoria del pool
    pool = FRASES.get(tipo_hecho_tipo)

    if not pool:
        # Fallback: si el tipo no existe en el diccionario, usar general positiva
        pool = FRASES.get(f"{clasificacion.lower()}_{nivel.lower()}", [
            "Hoy es un buen día para seguir adelante."
        ])

    frase = random.choice(pool)

    return {
        "frase":          frase,
        "tipo":           tipo_hecho_tipo,
        "mostrar_alerta": mostrar_alerta,
    }