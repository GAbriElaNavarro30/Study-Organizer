# motor_ea.py
# El motor es la capa que:
#   1. Convierte las respuestas brutas en Hechos (WM inicial)
#   2. Lanza el ciclo de inferencia de experta
#   3. Extrae las conclusiones de la Working Memory final

from hechos.hechos_ea import PuntajesVARK, PerfilDominante, Recomendacion, PuntajeDimension,  PerfilVARK,ErrorDetectado, RecomendacionME, DIMENSIONES_INFO
from reglas.reglas_ea import MotorVARK, MotorMetodosEstudio


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
    
# =================================================================
# métodos de estudio
# =================================================================
def calcular_nivel(puntaje: float) -> str:
    if puntaje < 40:
        return "bajo"
    elif puntaje < 70:
        return "medio"
    return "alto"
 
 
def calcular_puntaje_dimension(respuestas_dim: list[dict]) -> tuple[float, bool]:
    """
    respuestas_dim: lista de {valor: int, es_negativa: bool}
    Retorna (puntaje_normalizado_0_100, tiene_errores)
    Para preguntas negativas se invierte el puntaje: 4->1, 3->2, 2->3, 1->4
    tiene_errores=True si alguna pregunta negativa tiene valor >= 3 (Frecuentemente/Siempre)
    """
    total = 0
    max_posible = len(respuestas_dim) * 4
    tiene_errores = False
 
    for r in respuestas_dim:
        valor = r["valor"]
        if r["es_negativa"]:
            if valor >= 3:
                tiene_errores = True
            valor_ajustado = 5 - valor  # invertir: 1->4, 2->3, 3->2, 4->1
        else:
            valor_ajustado = valor
        total += valor_ajustado
 
    puntaje = (total / max_posible) * 100 if max_posible > 0 else 0
    return round(puntaje, 1), tiene_errores
 
 
def procesar_test_me(respuestas: list[dict], perfil_vark: str = "VARK") -> dict:
    """
    respuestas: lista de {id_pregunta, id_dimension, valor, es_negativa}
    perfil_vark: perfil VARK dominante del usuario (ej. "V", "AK")
    Retorna resultado completo con errores y recomendaciones.
    """
 
    # Agrupar respuestas por dimensión
    por_dimension: dict[int, list] = {}
    for r in respuestas:
        did = r["id_dimension"]
        por_dimension.setdefault(did, []).append(r)
 
    # Calcular puntajes por dimensión
    puntajes_dim = {}
    for did, resp_list in por_dimension.items():
        puntaje, tiene_errores = calcular_puntaje_dimension(resp_list)
        puntajes_dim[did] = {
            "nombre": DIMENSIONES_INFO.get(did, f"Dimensión {did}"),
            "puntaje": puntaje,
            "nivel": calcular_nivel(puntaje),
            "tiene_errores": tiene_errores,
        }
 
    # Inicializar motor
    motor = MotorMetodosEstudio()
    motor.reset()
 
    # Insertar PerfilVARK
    motor.declare(PerfilVARK(perfil=perfil_vark.upper()))
 
    # Insertar PuntajeDimension por cada dimensión
    for did, info in puntajes_dim.items():
        motor.declare(PuntajeDimension(
            id_dimension=did,
            nombre=info["nombre"],
            puntaje=info["puntaje"],
            nivel=info["nivel"],
            tiene_errores=info["tiene_errores"],
        ))
 
    # Ejecutar inferencia
    motor.run()
 
    # Extraer errores
    errores = []
    for fact in motor.facts.values():
        if isinstance(fact, ErrorDetectado):
            errores.append({
                "dimension": fact["dimension"],
                "mensaje": fact["mensaje"],
            })
 
    # Extraer recomendaciones agrupadas por dimensión
    recomendaciones: dict[str, list] = {}
    for fact in motor.facts.values():
        if isinstance(fact, RecomendacionME):
            dim = fact["dimension"]
            recomendaciones.setdefault(dim, []).append({
                "estilo_vark": fact["estilo_vark"],
                "texto": fact["texto"],
            })
 
    # Puntaje global
    if puntajes_dim:
        puntaje_global = round(
            sum(v["puntaje"] for v in puntajes_dim.values()) / len(puntajes_dim), 1
        )
    else:
        puntaje_global = 0
 
    return {
        "puntaje_global": puntaje_global,
        "nivel_global": calcular_nivel(puntaje_global),
        "resultados_por_dimension": puntajes_dim,
        "errores_detectados": errores,
        "recomendaciones": recomendaciones,
    }