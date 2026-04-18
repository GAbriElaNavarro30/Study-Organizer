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
        1: "Visualizar tus metas le da vida a tu motivación. Escribe en un papel o pizarrón lo que quieres lograr este semestre y ponlo donde lo veas cada día antes de estudiar. Ver tu propósito te recordará por qué vale la pena el esfuerzo.",
        2: "Tu entorno visual afecta directamente cómo te sientes al estudiar. Organiza tu espacio con colores que te transmitan calma y energía. Un lugar ordenado y agradable a la vista es el primer paso para concentrarte de verdad.",
        3: "Tu cuerpo también necesita atención. Lleva un registro visual puede ser un dibujo, tabla o tracker en papel de tus horas de sueño, comidas y descansos. Ver esos patrones te ayudará a cuidarte mejor y a rendir más.",
        4: "Ver tu semana completa de un vistazo cambia todo. Dibuja o imprime un calendario y asigna colores por materia o tipo de tarea. Cuando veas el panorama completo, será mucho más fácil organizarte sin sentirte abrumado/a.",
        5: "Tu mente piensa en imágenes, así que úsala a tu favor. Transforma lo que estudias en mapas mentales, esquemas o diagramas con colores. Cuando conviertes la información en algo visual, la recuerdas mejor y con más claridad.",
        6: "Prepararte visualmente para un examen reduce la ansiedad. Elabora fichas con esquemas, flechas y colores que resuman los temas clave. Repasar algo bien organizado visualmente te da confianza y seguridad el día del examen.",
        7: "Antes de escribir, dibuja la estructura de tu trabajo. Un esquema visual con las ideas principales y cómo se conectan te ayudará a desarrollar cada parte con más orden y claridad, evitando los bloqueos típicos al redactar.",
        8: "El tiempo es más manejable cuando lo puedes ver. Usa un calendario visual con bloques de colores para estudio, descanso y actividades personales. Ver tu semana organizada te ayudará a sentir que sí tienes tiempo para todo.",
        9: "El conocimiento se expande cuando lo ves desde distintos ángulos. Complementa tus apuntes con videos, infografías o presentaciones que expliquen los temas de forma visual. Aprender con imágenes te permitirá conectar ideas más fácilmente.",
    },
    "A": {
        1: "Tu motivación crece cuando escuchas tu propio compromiso. Antes de estudiar, dite en voz alta qué vas a lograr en esa sesión y por qué te importa. Escuchar tu propia voz con intención tiene un poder real sobre tu actitud.",
        2: "El ruido equivocado te desconcentra, pero el sonido adecuado puede protegerte. Prueba con música instrumental o ruido blanco mientras estudias. Encontrar 'tu sonido' para estudiar es encontrar tu zona de concentración.",
        3: "Cuidar tu cuerpo también se puede escuchar. Busca podcasts cortos sobre descanso, alimentación o bienestar que puedas escuchar mientras te preparas o te relajas. Pequeñas dosis de información práctica pueden cambiar hábitos de raíz.",
        4: "Hablar tu plan en voz alta lo convierte en un compromiso real. Graba en audio lo que planeas hacer durante la semana y escúchalo en la mañana. Tu propia voz diciéndote el plan tiene más impacto de lo que imaginas.",
        5: "Explicar en voz alta lo que aprendes es una de las formas más poderosas de aprender. Léete los conceptos, explícalos como si enseñaras a alguien o graba tus propios resúmenes. Si puedes decirlo, es porque lo entendiste.",
        6: "Hablar los temas en voz alta antes de un examen reduce el nerviosismo. Graba resúmenes de los temas clave y escúchalos mientras caminas o te relajas. Prepararte con tu propia voz te da una sensación de dominio y calma.",
        7: "Las mejores ideas suelen salir al hablarlas antes de escribirlas. Cuéntale a alguien, o incluso a ti mismo/a en voz alta, de qué trata tu trabajo y cuál es tu argumento. Verás cómo las ideas se ordenan solas al escucharlas.",
        8: "Tu tiempo vale más cuando lo declaras en voz alta. Usa alarmas con mensajes de voz o repite tu agenda del día antes de empezar. Escuchar tu propio plan activa tu sentido de compromiso y te ayuda a cumplirlo.",
        9: "Aprender escuchando es tu fortaleza, así que aprovéchala. Busca podcasts académicos, explicaciones en audio o debates grabados sobre los temas que estudias. Escuchar distintas voces y perspectivas enriquece tu comprensión de forma natural.",
    },
    "R": {
        1: "Escribir tus metas es el primer paso para alcanzarlas. Lleva un cuaderno donde anotes tus compromisos académicos cada semana. Volver a leer lo que escribiste te recordará lo que te propusiste y te mantendrá enfocado/a.",
        2: "Un espacio ordenado empieza por tener listas claras. Escribe en un papel lo que necesitas para estudiar y lo que debes guardar. Tener tu entorno documentado y organizado en palabras te da sensación de control y claridad.",
        3: "Conocerte a ti mismo/a es clave para cuidarte mejor. Lleva un diario sencillo donde registres cómo dormiste, qué comiste y cómo te sentiste al estudiar. Con el tiempo, descubrirás qué hábitos te dan energía y cuáles te la quitan.",
        4: "Un plan escrito es un compromiso contigo mismo/a. Anota tu cronograma en un cuaderno dedicado solo a eso y úsalo como checklist diario. Tachar lo que completaste genera una satisfacción real que te motiva a seguir.",
        5: "Escribir con tus propias palabras es señal de que realmente aprendiste. Elabora resúmenes detallados y reescribe los conceptos como si se los explicaras a alguien más. Ese proceso de reescritura es donde ocurre el aprendizaje profundo.",
        6: "La mejor forma de prepararte es escribir como si ya estuvieras en el examen. Redacta respuestas completas a posibles preguntas, como si fuera el examen real. Este ejercicio te revelará qué dominas y qué necesitas repasar con más calma.",
        7: "Un buen trabajo empieza antes de escribir la primera oración. Investiga, toma notas detalladas y estructura tus ideas en un esquema escrito antes de redactar. Ese proceso previo es lo que convierte un trabajo común en uno sólido.",
        8: "Llevar un registro de tu tiempo te devuelve el control. Anota cada día las tareas que completaste y cuánto tiempo les dedicaste. Con el tiempo, ese registro te mostrará en qué inviertes tu energía y cómo mejorar tu organización.",
        9: "Leer de distintas fuentes amplía y profundiza lo que sabes. Complementa tus apuntes con artículos, libros o lecturas adicionales sobre los temas. Subrayar y anotar tus reflexiones mientras lees convierte la lectura pasiva en aprendizaje real.",
    },
    "K": {
        1: "El estudio cobra sentido cuando lo conectas con tu vida real. Antes de cada sesión, pregúntate: ¿Para qué me sirve esto en mi carrera o en mi vida? Esa conexión práctica es lo que transforma el estudio en algo significativo y motivador.",
        2: "Tu cuerpo también estudia, así que dale el espacio que necesita. Busca un lugar amplio donde puedas moverte un poco, estirar los brazos o cambiar de postura. Un entorno que te permita sentirte cómodo/a físicamente mejora tu concentración.",
        3: "El movimiento recarga tu energía mental. Incorpora pausas activas entre tus sesiones de estudio: unos minutos de estiramiento, una caminata corta o simplemente levantarte. Tu cuerpo y tu mente funcionan mejor cuando no los obligas a estar quietos por horas.",
        4: "Planificar con las manos activa tu compromiso. Escribe tus tareas en papel, recórtalas si quieres, ordénalas por prioridad y táchala con satisfacción cuando las termines. Esa experiencia física de 'completar' algo activa tu motivación de forma poderosa.",
        5: "Aprendes mejor haciendo que memorizando. Siempre que puedas, resuelve ejercicios, trabaja con casos reales o simula situaciones prácticas relacionadas con lo que estudias. La experiencia directa es tu forma más natural y efectiva de aprender.",
        6: "La mejor preparación es practicar como si fuera el examen real. Simula las condiciones del examen: silencio, tiempo limitado y sin apoyos extra. Esa práctica real te dará la confianza que ningún repaso pasivo puede darte.",
        7: "Los mejores trabajos nacen de la acción, no de la parálisis. Empieza con un borrador rápido y físico: esquemas en papel, post-its, notas sueltas. Trabajar con las manos antes de la versión final te ayuda a pensar con más libertad y menos presión.",
        8: "Tu productividad fluye mejor en movimiento que en quietud prolongada. Trabaja en bloques cortos de estudio y muévete entre uno y otro: camina, estírate, respira. Respetar ese ritmo natural te permitirá rendir más sin agotarte.",
        9: "Tu aprendizaje se potencia cuando puedes vivirlo, no solo leerlo. Busca talleres, simulaciones, laboratorios o proyectos prácticos que te permitan aplicar lo que estudias. Aprender con las manos es tu forma más auténtica de entender el mundo.",
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