import random

from hechos.hechos_frase import EstadoEmocional, TipoFrase, FRASES
from reglas.reglas_frase import MotorFrase

 
def obtener_frase(clasificacion: str, nivel: str) -> dict:
    """
    Dado el estado emocional del día, devuelve una frase
    seleccionada aleatoriamente.
    """
    # Crear e inicializar el motor
    motor = MotorFrase()
    motor.reset()

    # Declarar el hecho de entrada
    motor.declare(EstadoEmocional(
        clasificacion=clasificacion.lower(),
        nivel=nivel.lower(),
    ))

    # Ejecutar inferencias
    motor.run()

    # Buscar el TipoFrase declarado por la regla
    tipo_hecho = None
    for fact in motor.facts.values():
        if isinstance(fact, TipoFrase):
            tipo_hecho = fact
            break

    # Fallback defensivo
    tipo = tipo_hecho["tipo"] if tipo_hecho else f"{clasificacion.lower()}_{nivel.lower()}"

    # Seleccionar frase aleatoria del grupo de frases
    pool = FRASES.get(tipo, ["Hoy es un buen día para seguir adelante."])
    frase = random.choice(pool)

    return {
        "frase": frase,
        "tipo":  tipo,
    } 