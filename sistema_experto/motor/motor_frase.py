# motor/motor_frase.py

import random

from hechos.hechos_frase import EstadoEmocional, TipoFrase, FRASES
from reglas.reglas_frase import MotorFrase


def obtener_frase(clasificacion: str, nivel: str) -> dict:
    """
    Dado el estado emocional del día, devuelve una frase
    seleccionada aleatoriamente del pool correspondiente.

    Args:
        clasificacion : 'positiva' | 'neutra' | 'negativa'
        nivel         : 'bajo' | 'medio' | 'alto'

    Returns:
        {
            "frase": str,
            "tipo":  str,   # clave del pool usado, e.g. 'positiva_medio'
        }
    """
    # 1. Crear e inicializar el motor
    motor = MotorFrase()
    motor.reset()

    # 2. Declarar el hecho de entrada
    motor.declare(EstadoEmocional(
        clasificacion=clasificacion.lower(),
        nivel=nivel.lower(),
    ))

    # 3. Ejecutar inferencias
    motor.run()

    # 4. Buscar el TipoFrase declarado por la regla
    tipo_hecho = None
    for fact in motor.facts.values():
        if isinstance(fact, TipoFrase):
            tipo_hecho = fact
            break

    # 5. Fallback defensivo
    tipo = tipo_hecho["tipo"] if tipo_hecho else f"{clasificacion.lower()}_{nivel.lower()}"

    # 6. Seleccionar frase aleatoria del pool
    pool = FRASES.get(tipo, ["Hoy es un buen día para seguir adelante."])
    frase = random.choice(pool)

    return {
        "frase": frase,
        "tipo":  tipo,
    }