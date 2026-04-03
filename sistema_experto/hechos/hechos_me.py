from experta import Fact, Field

class PuntajeDimension(Fact):
    id_dimension  = Field(int,   mandatory=True)
    nombre        = Field(str,   mandatory=True)
    puntaje       = Field(float, mandatory=True)
    nivel         = Field(str,   mandatory=True)
    tiene_errores = Field(bool,  mandatory=True)

class PreguntaConError(Fact):
    """Pregunta específica donde se detectó un hábito negativo."""
    id_pregunta  = Field(int, mandatory=True)
    id_dimension = Field(int, mandatory=True)
    nombre_dim   = Field(str, mandatory=True)

class PerfilVARK(Fact):
    perfil = Field(str, mandatory=True)

class ErrorDetectado(Fact):
    dimension = Field(str, mandatory=True)
    mensaje   = Field(str, mandatory=True)

class RecomendacionME(Fact):
    dimension   = Field(str, mandatory=True)
    estilo_vark = Field(str, mandatory=True)
    texto       = Field(str, mandatory=True)


DIMENSIONES_INFO = {
    1: "Actitud ante el estudio",
    2: "Lugar de estudio",
    3: "Estado físico y bienestar",
    4: "Plan de trabajo",
    5: "Técnicas de estudio",
    6: "Preparación para exámenes",
    7: "Trabajos académicos",
    8: "Gestión del tiempo",
    9: "Uso de recursos de aprendizaje",
}

# Mensaje por pregunta específica
# Las preguntas positivas generan error cuando se contesta Nunca(1) o Rara vez(2)
# Las preguntas negativas generan error cuando se contesta Frecuentemente(3) o Siempre(4)
ERRORES_POR_PREGUNTA = {
    # ── Dimensión 1: Actitud ante el estudio ──
    1:  "Estudias con frecuencia sin un objetivo claro para esa sesión, lo que reduce tu enfoque.",
    2:  "Te distraes con facilidad; las interrupciones digitales afectan tu concentración habitualmente.",
    3:  "Pocas veces conectas lo que estudias con tus metas personales, lo que disminuye tu motivación.",
    4:  "Postergas el inicio del estudio con frecuencia, generando acumulación de pendientes.",

    # ── Dimensión 2: Lugar de estudio ──
    5:  "Tu espacio de estudio tiene distracciones que reducen tu rendimiento.",
    6:  "Estudias frecuentemente en ambientes ruidosos o con interrupciones que dificultan la concentración.",
    7:  "No tienes un lugar fijo de estudio, lo que dificulta crear el hábito y mantener el enfoque.",
    8:  "Tu espacio de estudio suele estar desorganizado, lo que afecta tu concentración.",

    # ── Dimensión 3: Estado físico y bienestar ──
    9:  "Pocas veces duermes las horas suficientes antes de estudiar, lo que reduce tu retención.",
    10: "Estudias frecuentemente en estado de agotamiento, disminuyendo tu capacidad de aprendizaje.",
    11: "Rara vez mantienes una alimentación adecuada durante épocas de exámenes.",
    12: "No incorporas actividad física regularmente, lo que afecta tu concentración y energía.",

    # ── Dimensión 4: Plan de trabajo ──
    13: "Pocas veces planificas tu estudio con anticipación, lo que genera ineficiencia.",
    14: "Dejas todo el estudio para el último momento con frecuencia, generando estrés.",
    15: "Rara vez estableces metas específicas por sesión de estudio.",
    16: "No revisas ni ajustas tu plan de estudio de forma regular.",

    # ── Dimensión 5: Técnicas de estudio ──
    17: "Pocas veces usas técnicas activas como mapas mentales o resúmenes propios.",
    18: "Lees el material de forma pasiva con frecuencia, sin procesar activamente la información.",
    19: "Rara vez te autoevalúas después de estudiar para verificar tu comprensión.",
    20: "Memorizas mecánicamente con frecuencia sin comprender los conceptos, dificultando su aplicación.",

    # ── Dimensión 6: Preparación para exámenes ──
    21: "Pocas veces comienzas a repasar con suficiente anticipación antes de los exámenes.",
    22: "Experimentas ansiedad ante los exámenes con frecuencia, lo que bloquea tu desempeño.",
    23: "Rara vez practicas con exámenes anteriores o preguntas de práctica.",
    24: "Estudias solo los temas que crees que vendrán con frecuencia, dejando vacíos importantes.",

    # ── Dimensión 7: Trabajos académicos ──
    25: "Pocas veces planificas tus trabajos con etapas y fechas internas.",
    26: "Entregas trabajos con errores o incompletos con frecuencia por falta de planificación.",
    27: "Rara vez revisas y corriges tu trabajo antes de entregarlo.",
    28: "Copias o parafraseas sin comprender las fuentes con frecuencia, limitando tu aprendizaje.",

    # ── Dimensión 8: Gestión del tiempo ──
    29: "Pocas veces priorizas tus tareas académicas de forma efectiva.",
    30: "Pierdes tiempo en actividades no académicas con frecuencia cuando deberías estudiar.",
    31: "Rara vez bloqueas tiempo en tu agenda exclusivamente para estudiar.",
    32: "Sientes con frecuencia que el tiempo no te alcanza, lo que indica falta de planificación.",

    # ── Dimensión 9: Uso de recursos de aprendizaje ──
    33: "Pocas veces combinas más de una fuente de estudio por tema.",
    34: "Te limitas frecuentemente a los apuntes de clase sin buscar fuentes adicionales.",
    35: "Rara vez exploras plataformas educativas complementarias para reforzar temas.",
    36: "Dependes con frecuencia de un único recurso para estudiar, limitando tu aprendizaje.",
}

RECOMENDACIONES_GENERALES = {
    1: [
        "Establece un ritual de inicio de estudio: silencia notificaciones y usa apps como Forest o Focus To-Do.",
        "Conecta el material de estudio con tus metas a largo plazo para mantener la motivación.",
        "Aplica la técnica Pomodoro: 25 minutos de estudio enfocado y 5 de descanso.",
    ],
    2: [
        "Designa un espacio exclusivo para estudiar: mismo lugar, misma silla, mismo horario.",
        "Asegúrate de que tu espacio tenga buena luz natural o iluminación blanca fría.",
        "Ordena tu escritorio antes de comenzar; el orden externo favorece el orden mental.",
    ],
    3: [
        "Prioriza dormir 7-8 horas; la consolidación de la memoria ocurre durante el sueño.",
        "Incorpora al menos 20 minutos de actividad física diaria para mejorar la concentración.",
        "Mantén una alimentación regular con desayuno incluido en épocas de exámenes.",
    ],
    4: [
        "Usa un planificador semanal dividiendo el material en bloques pequeños por día.",
        "Establece metas específicas por sesión: 'hoy leo y resumo el capítulo 3'.",
        "Revisa tu plan cada domingo y ajusta según el avance real de la semana.",
    ],
    5: [
        "Practica el método SQ3R: Survey, Question, Read, Recite, Review.",
        "Elabora mapas conceptuales o mentales para conectar ideas clave.",
        "Autoevalúate al finalizar cada sesión con preguntas sobre lo que acabas de estudiar.",
    ],
    6: [
        "Comienza a repasar con 5-7 días de anticipación; distribuye el material por día.",
        "Practica con exámenes anteriores o crea tus propias preguntas de práctica.",
        "Aplica técnicas de respiración o mindfulness breve antes del examen para reducir la ansiedad.",
    ],
    7: [
        "Divide los trabajos en etapas con fechas internas (investigar, redactar, revisar).",
        "Usa el método PICO o similares para buscar fuentes académicas confiables.",
        "Revisa y corrige tu trabajo al menos una vez antes de entregarlo.",
    ],
    8: [
        "Registra cómo usas tu tiempo durante una semana para identificar dónde lo pierdes.",
        "Prioriza las tareas usando la Matriz de Eisenhower (urgente/importante).",
        "Bloquea en tu calendario las sesiones de estudio como compromisos inamovibles.",
    ],
    9: [
        "Combina al menos dos fuentes distintas por tema: libro de texto + video + artículo.",
        "Explora plataformas como Khan Academy, Coursera o YouTube Edu para reforzar temas.",
        "Únete o crea un grupo de estudio para contrastar comprensiones del material.",
    ],
}

RECOMENDACIONES_VARK = {
    "V": {
        1: "Crea un tablero visual con tus metas académicas y colócalo donde lo veas al estudiar.",
        2: "Organiza tu escritorio con colores y elementos visuales que te inspiren.",
        3: "Lleva un registro visual de tus horas de sueño, comidas y ejercicio (tracker en papel o app como Habitica).",
        4: "Usa calendarios visuales o Kanban boards (Trello, Notion) para planificar.",
        5: "Prioriza mapas mentales, diagramas y esquemas de colores para tus resúmenes.",
        6: "Elabora fichas visuales o infografías de repaso para los exámenes.",
        7: "Usa esquemas visuales y diagramas para organizar la estructura de tus trabajos.",
        8: "Utiliza calendarios visuales con código de colores por materia o tarea.",
        9: "Busca videos educativos, infografías y presentaciones como recursos complementarios.",
    },
    "A": {
        1: "Explícate en voz alta por qué es importante lo que estudias hoy.",
        2: "Usa música instrumental o ruido blanco para enmascarar distracciones auditivas.",
        3: "Escucha podcasts sobre bienestar, sueño y nutrición mientras te preparas o descansas.",
        4: "Graba en audio tu plan de estudio semanal y escúchalo para comprometerte con él.",
        5: "Lee en voz alta, explica los conceptos como si enseñaras y usa grabaciones de clase.",
        6: "Graba resúmenes en voz alta y repásalos como podcasts antes del examen.",
        7: "Debate las ideas de tu trabajo con alguien antes de escribirlas.",
        8: "Usa alarmas y recordatorios de voz para respetar tus bloques de estudio.",
        9: "Complementa con podcasts académicos, audiolibros y foros de discusión.",
    },
    "R": {
        1: "Lleva un diario de metas académicas donde escribas tus compromisos diarios.",
        2: "Mantén listas escritas del material pendiente visibles en tu espacio de estudio.",
        3: "Lleva un diario escrito de tus rutinas de sueño, alimentación y actividad física para identificar patrones.",
        4: "Escribe tu plan de estudio en un cuaderno dedicado y úsalo como checklist.",
        5: "Elabora resúmenes escritos detallados y reescribe los conceptos con tus propias palabras.",
        6: "Escribe respuestas completas a posibles preguntas de examen como práctica.",
        7: "Toma notas mientras investigas y estructura tu trabajo con un esquema escrito previo.",
        8: "Lleva un registro escrito de tus tareas completadas y el tiempo invertido.",
        9: "Lee artículos académicos y libros; anota referencias y citas útiles en fichas.",
    },
    "K": {
        1: "Relaciona cada tema con un ejemplo o situación real de tu vida o carrera.",
        2: "Estudia en entornos que te permitan cierta movilidad: mesas amplias, espacios abiertos.",
        3: "Incorpora pausas activas entre sesiones de estudio: estiramientos, caminatas cortas o ejercicio ligero.",
        4: "Usa listas físicas de tareas que puedas tachar con marcador al completarlas.",
        5: "Aprende haciendo: resuelve problemas, casos prácticos y ejercicios aplicados.",
        6: "Simula el examen en condiciones reales: tiempo, silencio y solo con lo permitido.",
        7: "Trabaja en borradores físicos o prototipos antes de la versión final.",
        8: "Trabaja en bloques cortos con movimiento entre sesiones para mantener el ritmo.",
        9: "Busca talleres, laboratorios, simulaciones o proyectos prácticos como recursos.",
    },
}

class CriteriosCurso(Fact):
    """Criterios que el motor determinó para recomendar cursos."""
    perfil      = Field(str, mandatory=True)
    dimensiones = Field(list, mandatory=False)