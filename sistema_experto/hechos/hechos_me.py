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
    1:  "Estudias sin una meta definida, lo que disminuye tu motivación y dificulta encontrarle sentido a tus actividades.",
    2:  "Te distraes con facilidad; las interrupciones digitales o del entorno afectan tu concentración habitualmente.",
    3:  "Existe una desconexión entre lo que estudias y tus metas personales o profesionales, lo que puede reducir tu interés y compromiso.",
    4:  "Tiendes a evitar iniciar el estudio, generando acumulación de pendientes.",

    # ── Dimensión 2: Lugar de estudio ──
    5:  "No cuentas con un espacio fijo, ordenado y libre de ruido para estudiar, lo que afecta tu concentración.",
    6:  "Estudias frecuentemente en ambientes ruidosos o con interrupciones que dificultan la concentración.",
    7:  "Tu espacio de estudio presenta deficiencias en iluminación y ventilación, lo cual afecta tu concentración..",
    8:  "Cambias constantemente de lugar para estudiar sin establecer un espacio habitual, lo que afecta tu concentración.",

    # ── Dimensión 3: Estado físico y bienestar ──
    9:  "No duermes lo suficiente para rendir bien en tus estudios, lo que afecta tu concentración y desempeño académico.",
    10: "Estudias frecuentemente en estado de agotamiento, disminuyendo tu capacidad de aprendizaje.",
    11: "No incorporas actividad física regularmente, lo que afecta tu concentración y energía.",
    12: "Te alimentas de manera irregular o saltas comidas con frecuencia, lo que afecta tu energía y rendimiento académico.",
    

    # ── Dimensión 4: Plan de trabajo ──
    13: "No elaboras un plan o cronograma de estudio, lo que afecta tu organización y cumplimiento de actividades.",
    14: "Estudias sin un orden definido, abordando temas al azar, generando estrés, lo que afecta tu organización y aprendizaje.",
    15: "No divides el material de estudio en partes manejables ni estableces metas por sesión, lo que afecta tu organización y aprendizaje.",
    16: "Sueles dejar el estudio para el día anterior, lo que puede generar estrés y afectar tu desempeño académico.",

    # ── Dimensión 5: Técnicas de estudio ──
    17: "Pocas veces usas técnicas activas como mapas mentales o resúmenes, lo que puede dificultar tu comprensión y retención de la información.",
    18: "Tiendes a leer sin procesar activamente la información, lo que puede dificultar tu comprensión y retención del contenido.",
    19: "No te autoevalúas ni realizas preguntas después de estudiar, lo que afecta tu comprensión y refuerzo del aprendizaje.",
    20: "Memorizas sin comprender los conceptos, lo que afecta tu aprendizaje, genera estrés y dificulta la retención de la información.",

    # ── Dimensión 6: Preparación para exámenes ──
    21: "Pocas veces comienzas a repasar con suficiente anticipación, lo que afecta tu preparación y genera estrés antes del examen.",
    22: "Experimentas ansiedad ante los exámenes con frecuencia, lo que bloquea tu conocimiento y retención de información.",
    23: "Rara vez revisas tus errores en evaluaciones anteriores, lo que puede impedir que identifiques áreas de mejora.",
    24: "Te enfocas únicamente en los temas que crees que vendrán en el examen, lo que limita tu aprendizaje y preparación, dejando vacíos importantes.",

    # ── Dimensión 7: Trabajos académicos ──
    25: "No planificas tus trabajos con anticipación, lo que afecta tu organización y cumplimiento de entregas.",
    26: "Entregas trabajos con errores o incompletos con frecuencia por falta de planificación y prioridad.",
    27: "Rara vez revisas y corriges tu trabajo antes de entregarlo.No consultas fuentes confiables al elaborar tus trabajos, lo que afecta la calidad y validez de tu información.",
    28: "Copias o parafraseas información sin comprenderla, limitando tu aprendizaje y afectando la calidad de tus trabajos.",

    # ── Dimensión 8: Gestión del tiempo ──
    29: "No distribuyes tu tiempo de forma equilibrada entre estudio, descanso y actividades personales, lo que afecta tu rendimiento y bienestar.",
    30: "Pierdes tiempo en actividades no académicas cuando deberías estar estudiando, lo que afecta tu rendimiento en clase, exámenes o cumplimiento de tareas.",
    31: "No estableces prioridades claras ni te enfocas en las tareas más importantes, lo que afecta tu organización y rendimiento.",
    32: "Sientes que el tiempo no te alcanza para cubrir el material de estudio, lo que indica una posible falta de planificación, genera estrés y afecta tu rendimiento académico.",

    # ── Dimensión 9: Uso de recursos de aprendizaje ──
    33: "No utilizas recursos adicionales para reforzar lo aprendido, lo que puede indicar un aprendizaje limitado y afectar tu comprensión y rendimiento académico.",
    34: "Te limitas únicamente a los apuntes de clase sin buscar material complementario, lo que limita tu comprensión y aprendizaje.",
    35: "No participas activamente en clases, foros o grupos de estudio, lo que puede indicar un aprendizaje pasivo y afectar tu comprensión y rendimiento académico.",
    36: "Dependes con frecuencia de un único recurso para estudiar, limitando tu aprendizaje y preparación para exámenes o foros de discusión.",
}


RECOMENDACIONES_GENERALES = {

    # ── Dimensión 1: Actitud ante el estudio ──
    1: [
        "Define un objetivo claro antes de cada sesión de estudio (ej: 'entender el tema X').",
        "Relaciona cada tema con una meta personal o profesional para aumentar tu motivación.",
        "Aplica la técnica Pomodoro: 25 minutos de estudio enfocado y 5 de descanso.",
    ],

    # ── Dimensión 2: Lugar de estudio ──
    2: [
        "Establece un lugar fijo para estudiar y úsalo siempre que sea posible.",
        "Reduce distracciones: apaga la TV, silencia el celular y usa audífonos si es necesario.",
        "Mejora la iluminación y ventilación de tu espacio para favorecer la concentración.",
    ],

    # ── Dimensión 3: Estado físico y bienestar ──
    3: [
        "Duerme entre 7 y 8 horas diarias para mejorar tu concentración y memoria.",
        "Evita estudiar cuando estés muy cansado; toma descansos antes de continuar.",
        "Mantén horarios de comida regulares e incluye actividad física en tu rutina.",
    ],

    # ── Dimensión 4: Plan de trabajo ──
    4: [
        "Elabora un cronograma semanal distribuyendo los temas por día.",
        "Divide el contenido en partes pequeñas y manejables por sesión.",
        "Evita dejar todo al final comenzando con tareas pequeñas desde días antes.",
    ],

    # ── Dimensión 5: Técnicas de estudio ──
    5: [
        "Utiliza técnicas activas como resúmenes, mapas mentales o esquemas.",
        "Toma notas mientras estudias para procesar mejor la información.",
        "Realiza autoevaluaciones o preguntas después de cada sesión de estudio.",
    ],

    # ── Dimensión 6: Preparación para exámenes ──
    6: [
        "Comienza a repasar con varios días de anticipación al examen.",
        "Estudia todos los temas, no solo los que crees que vendrán.",
        "Practica técnicas de respiración para controlar la ansiedad durante el examen.",
    ],

    # ── Dimensión 7: Trabajos académicos ──
    7: [
        "Planifica tus trabajos con anticipación dividiéndolos en etapas.",
        "Revisa y corrige tus trabajos antes de entregarlos.",
        "Consulta fuentes confiables y asegúrate de comprender la información antes de usarla.",
    ],

    # ── Dimensión 8: Gestión del tiempo ──
    8: [
        "Establece prioridades claras y comienza por las tareas más importantes.",
        "Reduce el tiempo en actividades no académicas durante tus horas de estudio.",
        "Organiza tu tiempo equilibrando estudio, descanso y actividades personales.",
    ],

    # ── Dimensión 9: Uso de recursos de aprendizaje ──
    9: [
        "Complementa tus apuntes con videos, artículos o plataformas educativas.",
        "Evita depender de una sola fuente; usa al menos dos recursos por tema.",
        "Participa en clases o grupos de estudio para reforzar tu aprendizaje.",
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

TODOS_LOS_PERFILES = [
    "V", "A", "R", "K",
    "VA", "VR", "VK", "AR", "AK", "RK",
    "VAR", "VAK", "VRK", "ARK", "VARK"
]

class CriteriosCurso(Fact):
    """Criterios que el motor determinó para recomendar cursos."""
    perfil_exacto   = Field(str,  mandatory=True)
    perfiles_afines = Field(list, mandatory=True)
    dimensiones = Field(list, mandatory=False)