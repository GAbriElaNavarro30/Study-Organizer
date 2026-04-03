from hechos.hechos_me import (
    PuntajeDimension, PreguntaConError, PerfilVARK,
    ErrorDetectado, RecomendacionME,
    DIMENSIONES_INFO, ERRORES_POR_PREGUNTA,
)
from reglas.reglas_me import MotorMetodosEstudio

from services.cursos_service import obtener_cursos_por_perfil 


def _calcular_nivel(puntaje: float) -> str:
    if puntaje < 50:
        return "deficiente"
    elif puntaje < 65:
        return "regular"
    elif puntaje < 80:
        return "bueno"
    elif puntaje < 95:
        return "muy_bueno"
    else:
        return "excelente"


def _calcular_puntaje_dimension(respuestas_dim: list[dict]) -> tuple[float, bool, list[int]]:
    """
    Retorna (puntaje, tiene_errores, ids_preguntas_con_error).

    - Pregunta POSITIVA con valor <= 2 (Nunca/Rara vez) → error
    - Pregunta NEGATIVA con valor >= 3 (Frecuentemente/Siempre) → error
    """
    total               = 0
    max_posible         = len(respuestas_dim) * 4
    tiene_errores       = False
    preguntas_con_error = []

    for r in respuestas_dim:
        valor = r["valor"]

        if r["es_negativa"]:
            if valor >= 3:
                tiene_errores = True
                preguntas_con_error.append(r["id_pregunta"])
            valor = 5 - valor
        else:
            if valor <= 2:
                tiene_errores = True
                preguntas_con_error.append(r["id_pregunta"])

        total += valor

    puntaje = (total / max_posible) * 100 if max_posible > 0 else 0.0
    return puntaje, tiene_errores, preguntas_con_error


def procesar_test_me(respuestas: list[dict], perfil_vark: str = "VARK") -> dict:
    # 1. Agrupar por dimensión
    dims: dict[int, list[dict]] = {}
    for r in respuestas:
        dims.setdefault(r["id_dimension"], []).append(r)

    # 2. Motor + perfil VARK
    # Si el perfil es "VARK" significa que el usuario no ha realizado el test
    # de estilos de aprendizaje, por lo que no se declara PerfilVARK y el motor
    # no generará recomendaciones personalizadas por estilo de aprendizaje.
    motor = MotorMetodosEstudio()
    motor.reset()

    perfil_real = perfil_vark.upper() if perfil_vark.upper() != "VARK" else None
    if perfil_real:
        motor.declare(PerfilVARK(perfil=perfil_real))

    # 3. Calcular puntajes y declarar hechos
    resultados_por_dimension = []
    for id_dim, resp_dim in dims.items():
        puntaje, tiene_errores, preguntas_con_error = _calcular_puntaje_dimension(resp_dim)
        nivel  = _calcular_nivel(puntaje)
        nombre = DIMENSIONES_INFO.get(id_dim, f"Dimensión {id_dim}")

        motor.declare(PuntajeDimension(
            id_dimension=id_dim,
            nombre=nombre,
            puntaje=puntaje,
            nivel=nivel,
            tiene_errores=tiene_errores,
        ))

        # Declarar un hecho por cada pregunta con error
        for id_p in preguntas_con_error:
            motor.declare(PreguntaConError(
                id_pregunta=id_p,
                id_dimension=id_dim,
                nombre_dim=nombre,
            ))

        resultados_por_dimension.append({
            "id_dimension": id_dim,
            "nombre":       nombre,
            "puntaje":      puntaje,
            "nivel":        nivel,
        })

    # 4. Ejecutar inferencias
    motor.run()

    # 5. Recoger errores y recomendaciones
    errores: list[dict] = []
    recomendaciones: dict[str, list[dict]] = {}

    for fact in motor.facts.values():
        if isinstance(fact, ErrorDetectado):
            errores.append({
                "dimension": fact["dimension"],
                "mensaje":   fact["mensaje"],
            })
        elif isinstance(fact, RecomendacionME):
            dim = fact["dimension"]
            recomendaciones.setdefault(dim, []).append({
                "estilo_vark": fact["estilo_vark"],
                "texto":       fact["texto"],
            })

    # ── NUEVO: extraer dimensiones con error para filtrar cursos ──
    ids_dimensiones_con_error: list[int] = []
    for fact in motor.facts.values():
        if isinstance(fact, PuntajeDimension):
            if fact["nivel"] in ("deficiente", "regular", "bueno"):
                ids_dimensiones_con_error.append(fact["id_dimension"])

    # Usar perfil real si existe, si no usar todas las letras VARK
    perfil_para_cursos = perfil_real if perfil_real else "VARK"

    cursos_recomendados = obtener_cursos_por_perfil(
        perfil=perfil_para_cursos,
        dimensiones_con_error=ids_dimensiones_con_error or None,
    )
    
    return {
        "perfil_vark":              perfil_vark,
        "tiene_perfil_vark":        perfil_real is not None,  # ← indica al frontend si hay perfil real
        "resultados_por_dimension": resultados_por_dimension,
        "errores_detectados":       errores,
        "recomendaciones":          recomendaciones,
        "cursos_recomendados":       cursos_recomendados,
    }