# hechos_ea.py
# Los "hechos" en experta se representan como subclases de Fact.
# Esto equivale a los hechos base y derivados de Prolog.

from experta import Fact, Field

# ===========================================================================
# HECHOS BASE: datos que el usuario provee (hechos iniciales / WM entries)
# ===========================================================================

class RespuestaUsuario(Fact):
    """
    Hecho que representa una categoría respondida por el usuario.
    Se inserta una instancia por cada respuesta del cuestionario VARK.
    Ejemplo: RespuestaUsuario(categoria="V")
    """
    categoria = Field(str, mandatory=True)


class PuntajesVARK(Fact):
    """
    Hecho derivado: contiene los puntajes acumulados por categoría.
    Lo calcula el motor antes de iniciar la inferencia.
    """
    v = Field(int, mandatory=True)
    a = Field(int, mandatory=True)
    r = Field(int, mandatory=True)
    k = Field(int, mandatory=True)
    total = Field(int, mandatory=True)


# ===========================================================================
# HECHOS DERIVADOS: conclusiones que infiere el motor de reglas
# ===========================================================================

class PerfilDominante(Fact):
    """
    Hecho derivado: perfil o combinación de perfiles dominantes.
    Ejemplo: PerfilDominante(perfil="VK", nombre="Visual — Kinestésico")
    """
    perfil = Field(str, mandatory=True)
    nombre = Field(str, mandatory=True)


class Recomendacion(Fact):
    """
    Hecho derivado: recomendación asociada a un estilo de aprendizaje.
    Ejemplo: Recomendacion(estilo="V", texto="Usa mapas mentales...")
    """
    estilo  = Field(str, mandatory=True)
    texto   = Field(str, mandatory=True)


# ===========================================================================
# BASE DE CONOCIMIENTO ESTÁTICA (equivalente a hechos base en Prolog)
# ===========================================================================

PERFILES = {
    "V":    "Visual",
    "A":    "Auditivo",
    "R":    "Lector / Escritor",
    "K":    "Kinestésico",
    "VA":   "Visual — Auditivo",
    "VR":   "Visual — Lector",
    "VK":   "Visual — Kinestésico",
    "AR":   "Auditivo — Lector",
    "AK":   "Auditivo — Kinestésico",
    "RK":   "Lector — Kinestésico",
    "VAR":  "Visual · Auditivo · Lector",
    "VAK":  "Visual · Auditivo · Kinestésico",
    "VRK":  "Visual · Lector · Kinestésico",
    "ARK":  "Auditivo · Lector · Kinestésico",
    "VARK": "Multimodal",
}

RECOMENDACIONES = {
    "V": [
        "Usa mapas mentales, esquemas y diagramas para organizar la información",
        "Prefiere libros y materiales con ilustraciones, tablas y gráficos",
        "Colorea y jerarquiza tus apuntes usando códigos visuales",
        "Utiliza videos, presentaciones y animaciones como apoyo",
        "Organiza tu espacio de estudio de forma ordenada y visualmente clara",
        "Resume temas complejos en infografías o cuadros comparativos",
        "Subraya con distintos colores según la importancia del contenido",
        "Usa post-its o tarjetas visuales para recordar conceptos clave",
        "Convierte listas largas en diagramas o líneas de tiempo",
        "Dibuja conceptos o procesos mientras estudias",
    ],
    "A": [
        "Graba tus clases o explicaciones y escúchalas después",
        "Explica en voz alta lo que estás estudiando como si enseñaras a alguien",
        "Participa activamente en clases, debates y grupos de estudio",
        "Utiliza podcasts, audiolibros y videos con buena explicación oral",
        "Lee en voz alta o repite conceptos importantes para memorizarlos",
        "Estudia con un compañero y comenten los temas entre ustedes",
        "Resume la información hablando y no solo escribiendo",
        "Asocia conceptos con ritmos, sonidos o palabras clave",
        "Haz pausas para explicar lo aprendido antes de continuar",
        "Prefiere ambientes donde puedas hablar sin distraerte",
    ],
    "R": [
        "Toma notas detalladas durante las clases o lecturas",
        "Elabora resúmenes, esquemas y apuntes escritos",
        "Lee libros, artículos académicos y documentación confiable",
        "Escribe explicaciones con tus propias palabras para reforzar el aprendizaje",
        "Organiza la información en listas, tablas y textos estructurados",
        "Reescribe tus apuntes para aclarar ideas importantes",
        "Utiliza definiciones y conceptos clave por escrito",
        "Prefiere materiales con texto claro y bien organizado",
        "Usa cuestionarios escritos para autoevaluarte",
        "Mantén un cuaderno o documento digital para cada materia",
    ],
    "K": [
        "Aprende haciendo: practica ejercicios y casos reales",
        "Toma descansos activos entre sesiones de estudio",
        "Usa simulaciones, proyectos prácticos o experimentos",
        "Relaciona los conceptos con experiencias personales",
        "Participa en laboratorios, talleres y actividades prácticas",
        "Estudia en bloques cortos con movimiento entre ellos",
        "Utiliza objetos físicos o modelos para representar conceptos",
        "Aprende resolviendo problemas en lugar de solo leer",
        "Cambia de lugar o postura para mantener la concentración",
        "Aplica lo aprendido inmediatamente después de estudiarlo",
    ],
}

# ============================================================================
# MÉTODOS DE ESTUDIO
# ============================================================================
class PuntajeDimension(Fact):
    """Puntaje normalizado (0-100) obtenido en una dimensión."""
    id_dimension   = Field(int, mandatory=True)
    nombre         = Field(str, mandatory=True)
    puntaje        = Field(float, mandatory=True)   # 0-100
    nivel          = Field(str, mandatory=True)     # 'bajo','medio','alto'
    tiene_errores  = Field(bool, mandatory=True)    # True si hay preguntas negativas respondidas con Freq/Siempre
    
class PerfilVARK(Fact):
    """Perfil VARK dominante del usuario (puede ser None si aún no lo tiene)."""
    perfil = Field(str, mandatory=True)  # ej. "V", "AK", "VARK"
    
# ════════════════════════════════════════════════
# HECHOS DERIVADOS
# ════════════════════════════════════════════════
 
class ErrorDetectado(Fact):
    """Error identificado en los hábitos de estudio."""
    dimension = Field(str, mandatory=True)
    mensaje   = Field(str, mandatory=True)
 
class RecomendacionME(Fact):
    """Recomendación para mejorar métodos de estudio."""
    dimension   = Field(str, mandatory=True)
    estilo_vark = Field(str, mandatory=True)   # letra VARK o "general"
    texto       = Field(str, mandatory=True)
    
# ════════════════════════════════════════════════
# BASE DE CONOCIMIENTO ESTÁTICA
# ════════════════════════════════════════════════
 
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

# Errores por dimensión (para preguntas negativas con respuesta alta)
ERRORES = {
    1: [
        "Te distraes con facilidad al estudiar; las interrupciones digitales afectan tu concentración.",
        "Postergas el inicio del estudio con frecuencia, lo que genera acumulación de pendientes.",
    ],
    2: [
        "Estudias en ambientes con distracciones que reducen tu rendimiento.",
        "No tienes un lugar fijo de estudio, lo que dificulta crear el hábito.",
    ],
    3: [
        "Estudias en estado de agotamiento, lo que disminuye la retención de información.",
        "Tu alimentación irregular en épocas de carga académica afecta tu energía y concentración.",
    ],
    4: [
        "Estudias sin orden ni estructura, lo que genera ineficiencia y olvidos.",
        "Dejas todo el estudio para el último momento, generando estrés y aprendizaje superficial.",
    ],
    5: [
        "Lees el material de forma pasiva sin procesar activamente la información.",
        "Memorizas mecánicamente sin comprender los conceptos, dificultando la aplicación del conocimiento.",
    ],
    6: [
        "Experimentas ansiedad ante los exámenes que bloquea tu desempeño real.",
        "Estudias solo los temas que 'crees' que vendrán, dejando vacíos importantes.",
    ],
    7: [
        "Entregas trabajos incompletos o con errores por no planificar con anticipación.",
        "Copias o parafraseas sin comprender, lo que limita tu aprendizaje real.",
    ],
    8: [
        "Pierdes tiempo en actividades no académicas cuando deberías estar estudiando.",
        "Sientes que el tiempo no te alcanza; esto indica falta de planificación efectiva.",
    ],
    9: [
        "Te limitas a los apuntes de clase sin buscar fuentes adicionales.",
        "Dependes de un único recurso para estudiar, limitando la profundidad de tu aprendizaje.",
    ],
}

# Recomendaciones generales por dimensión (independiente del perfil VARK)
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

# Recomendaciones adicionales cruzadas VARK × dimensión
RECOMENDACIONES_VARK = {
    "V": {
        1: "Crea un tablero visual con tus metas académicas y colócalo donde lo veas al estudiar.",
        2: "Organiza tu escritorio con colores y elementos visuales que te inspiren.",
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
        4: "Usa listas físicas de tareas que puedas tachar con marcador al completarlas.",
        5: "Aprende haciendo: resuelve problemas, casos prácticos y ejercicios aplicados.",
        6: "Simula el examen en condiciones reales: tiempo, silencio y solo con lo permitido.",
        7: "Trabaja en borradores físicos o prototipos antes de la versión final.",
        8: "Trabaja en bloques cortos con movimiento entre sesiones para mantener el ritmo.",
        9: "Busca talleres, laboratorios, simulaciones o proyectos prácticos como recursos.",
    },
}