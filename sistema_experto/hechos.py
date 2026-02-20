# ====================================================================================================================
#                                          PARA LOS ESTILOS DE APRENDIZAJE                                           
# ====================================================================================================================
'''
# ====================== ESTILOS RECONOCIDOS ========================
# En Prolog: estilo(v). estilo(a). estilo(r). estilo(k).
estilos = [
    "V",
    "A",
    "R",
    "K"
]

# ============================ NOMBRES ==============================
# En Prolog: nombre(v, "Visual"). nombre(a, "Auditivo"). ...
nombres = {
    "V": "Visual",
    "A": "Auditivo",
    "R": "Lectura/Escritura",
    "K": "Kinestésico",
}

# ========================== DESCRIPCIONES ==========================
# En Prolog: descripcion(v, "Eres un aprendiz Visual...").
descripciones = {
    "V": (
        "Eres un aprendiz Visual. Procesas mejor la información cuando se presenta "
        "de forma gráfica y espacial. Los mapas mentales, diagramas, colores y "
        "esquemas son tus mejores aliados."
    ),
    "A": (
        "Eres un aprendiz Auditivo. Tu mente procesa y retiene mejor la información "
        "que escuchas. Las discusiones, audiolibros y podcasts te benefician enormemente."
    ),
    "R": (
        "Eres un aprendiz de Lectura/Escritura. Tienes afinidad especial con el texto "
        "escrito. Leer, tomar apuntes detallados y reescribir información son tus "
        "estrategias más efectivas."
    ),
    "K": (
        "Eres un aprendiz Kinestésico. Aprendes mejor haciendo. La práctica directa, "
        "laboratorios, proyectos reales y ejemplos concretos anclan mejor el conocimiento en ti."
    ),
}

# ================================== OPCIONES ==================================
# En Prolog: opcion(0). opcion(1). opcion(2). opcion(3).
opciones = [0, 1, 2, 3]

# =============================== OPCION = ESTILO ==============================
# En Prolog: opcion_es_estilo(0, v). opcion_es_estilo(1, a). ...
# El frontend envía índice 0-3 por pregunta; este mapeo los convierte a estilo.
opcion_es_estilo = {
    0: "V",
    1: "A",
    2: "R",
    3: "K",
}

# ================================ CLASIFICACIÓN ===============================
# En Prolog: clasificacion("Dominante"). clasificacion("Fuerte").
clasificaciones = ["Dominante", "Fuerte", "Moderado", "Débil"]

# ─── UMBRALES DE CLASIFICACIÓN ────────────────────────────────────────────────
# En Prolog: umbral(dominante, 5). umbral(fuerte, 3). ...
clasificacion_es = {
    "dominante": 5,
    "fuerte":    3,
    "moderado":  2,
    "debil":     1,
}

# ─── TOTAL DE PREGUNTAS ───────────────────────────────────────────────────────
TOTAL_PREGUNTAS = 16

# ─── PREGUNTAS DEL CUESTIONARIO ───────────────────────────────────────────────
# En Prolog:
#   pregunta(1, "Cuando aprendes algo nuevo, prefieres...").
#   opcion(1, 0, v, "Ver diagramas, gráficos o esquemas...").
#   opcion(1, 1, a, "Escuchar a alguien explicarlo...").
#   ...
PREGUNTAS = [
    {
        "id": 0,
        "texto": "Cuando aprendes algo nuevo, prefieres...",
        "opciones": [
            {"indice": 0, "estilo": "V", "texto": "Ver diagramas, gráficos o esquemas visuales que expliquen el concepto."},
            {"indice": 1, "estilo": "A", "texto": "Escuchar a alguien explicarlo verbalmente o en una clase."},
            {"indice": 2, "estilo": "R", "texto": "Leer sobre el tema en libros, artículos o apuntes detallados."},
            {"indice": 3, "estilo": "K", "texto": "Intentarlo tú mismo con ejemplos prácticos o experimentos."},
        ],
    },
    {
        "id": 1,
        "texto": "Cuando necesitas recordar una dirección nueva, ¿qué haces?",
        "opciones": [
            {"indice": 0, "estilo": "V", "texto": "Visualizo un mapa mental del trayecto en mi cabeza."},
            {"indice": 1, "estilo": "A", "texto": "Repito las instrucciones en voz alta varias veces."},
            {"indice": 2, "estilo": "R", "texto": "Las escribo en papel o en mi teléfono."},
            {"indice": 3, "estilo": "K", "texto": "Simplemente lo recorro una vez y lo recuerdo por experiencia."},
        ],
    },
    {
        "id": 2,
        "texto": "Durante una presentación, lo que más te ayuda a entender es...",
        "opciones": [
            {"indice": 0, "estilo": "V", "texto": "Las diapositivas con colores, imágenes e ilustraciones."},
            {"indice": 1, "estilo": "A", "texto": "La voz y las explicaciones verbales del presentador."},
            {"indice": 2, "estilo": "R", "texto": "El material escrito que puedo leer y subrayar."},
            {"indice": 3, "estilo": "K", "texto": "Las demostraciones prácticas o ejemplos de la vida real."},
        ],
    },
    {
        "id": 3,
        "texto": "Si debes explicarle algo complejo a alguien, ¿cómo lo harías?",
        "opciones": [
            {"indice": 0, "estilo": "V", "texto": "Dibujo un esquema o diagrama para que lo visualice."},
            {"indice": 1, "estilo": "A", "texto": "Se lo explico hablando con metáforas y ejemplos verbales."},
            {"indice": 2, "estilo": "R", "texto": "Le paso un resumen escrito o una lista de pasos."},
            {"indice": 3, "estilo": "K", "texto": "Le pido que lo intente conmigo paso a paso de forma práctica."},
        ],
    },
    {
        "id": 4,
        "texto": "Cuando estudias para un examen, tu método más efectivo es...",
        "opciones": [
            {"indice": 0, "estilo": "V", "texto": "Crear mapas mentales, tablas o usar colores para organizar la info."},
            {"indice": 1, "estilo": "A", "texto": "Escuchar grabaciones, podcasts o leer en voz alta."},
            {"indice": 2, "estilo": "R", "texto": "Escribir resúmenes, repasar apuntes y hacer fichas."},
            {"indice": 3, "estilo": "K", "texto": "Practicar con ejercicios, casos reales o simulacros."},
        ],
    },
    {
        "id": 5,
        "texto": "¿Qué tipo de libro o contenido disfrutas más?",
        "opciones": [
            {"indice": 0, "estilo": "V", "texto": "Libros con ilustraciones, infografías y diseño visual."},
            {"indice": 1, "estilo": "A", "texto": "Audiolibros, podcasts o contenido en formato audio."},
            {"indice": 2, "estilo": "R", "texto": "Novelas, ensayos o artículos extensos bien escritos."},
            {"indice": 3, "estilo": "K", "texto": "Manuales prácticos, tutoriales o guías paso a paso."},
        ],
    },
    {
        "id": 6,
        "texto": "Cuando algo no funciona (un aparato, una tarea), tu reacción es...",
        "opciones": [
            {"indice": 0, "estilo": "V", "texto": "Busco un diagrama o esquema visual que explique cómo funciona."},
            {"indice": 1, "estilo": "A", "texto": "Llamo a alguien para que me lo explique o busco un video."},
            {"indice": 2, "estilo": "R", "texto": "Leo el manual de instrucciones detalladamente."},
            {"indice": 3, "estilo": "K", "texto": "Pruebo diferentes soluciones hasta encontrar la que funciona."},
        ],
    },
    {
        "id": 7,
        "texto": "En clase, te concentras mejor cuando...",
        "opciones": [
            {"indice": 0, "estilo": "V", "texto": "El profesor usa pizarrón, proyecciones e imágenes."},
            {"indice": 1, "estilo": "A", "texto": "El profesor explica con detalle y hay debate en clase."},
            {"indice": 2, "estilo": "R", "texto": "Hay material escrito o puedo tomar apuntes detallados."},
            {"indice": 3, "estilo": "K", "texto": "Hay actividades prácticas, laboratorios o proyectos."},
        ],
    },
    {
        "id": 8,
        "texto": "Cuando ves un nuevo software o app, ¿cómo aprendes a usarlo?",
        "opciones": [
            {"indice": 0, "estilo": "V", "texto": "Exploro visualmente la interfaz y los íconos."},
            {"indice": 1, "estilo": "A", "texto": "Veo un tutorial en video con explicación verbal."},
            {"indice": 2, "estilo": "R", "texto": "Leo la documentación o guía del usuario."},
            {"indice": 3, "estilo": "K", "texto": "Lo uso directamente y aprendo sobre la marcha."},
        ],
    },
    {
        "id": 9,
        "texto": "Al recordar una experiencia pasada, ¿qué recuerdas más vívidamente?",
        "opciones": [
            {"indice": 0, "estilo": "V", "texto": "Las imágenes, colores y cómo se veía el lugar."},
            {"indice": 1, "estilo": "A", "texto": "Las conversaciones y sonidos de ese momento."},
            {"indice": 2, "estilo": "R", "texto": "Lo que escribí o leí en ese momento (notas, mensajes)."},
            {"indice": 3, "estilo": "K", "texto": "Cómo me sentí físicamente y lo que hice con mis manos."},
        ],
    },
    {
        "id": 10,
        "texto": "Para planear un viaje, prefieres...",
        "opciones": [
            {"indice": 0, "estilo": "V", "texto": "Buscar fotos del destino y hacer un mapa visual del recorrido."},
            {"indice": 1, "estilo": "A", "texto": "Hablar con alguien que ya fue o ver vlogs del lugar."},
            {"indice": 2, "estilo": "R", "texto": "Leer blogs de viaje, guías y reseñas detalladas."},
            {"indice": 3, "estilo": "K", "texto": "Hacer la maleta y descubrir el destino al llegar."},
        ],
    },
    {
        "id": 11,
        "texto": "Si tuvieras que aprender un nuevo idioma, elegiría...",
        "opciones": [
            {"indice": 0, "estilo": "V", "texto": "Tarjetas con imágenes asociadas a palabras y tablas visuales."},
            {"indice": 1, "estilo": "A", "texto": "Escuchar canciones, series y hablar con nativos constantemente."},
            {"indice": 2, "estilo": "R", "texto": "Leer gramática, vocabulario y estudiar reglas escritas."},
            {"indice": 3, "estilo": "K", "texto": "Irme al país e inmergirme totalmente en la cultura."},
        ],
    },
]

# ─── RECOMENDACIONES ──────────────────────────────────────────────────────────
# En Prolog: recomendacion(v, 1, "Usa mapas mentales..."). recomendacion(v, 2, "Resalta tus apunte...").
# {} diccionario
# [] listas
# { [], [], [] } diccionario de listas
recomendaciones = {
    "V": [
        "Usa mapas mentales y diagramas de flujo para organizar ideas.",
        "Resalta tus apuntes con colores y símbolos visuales.",
        "Convierte textos en esquemas o tablas.",
        "Usa aplicaciones visuales como Notion, MindMeister o Canva.",
    ],
    "A": [
        "Grábate explicando los temas y escúchalo después.",
        "Participa activamente en debates y discusiones de grupo.",
        "Usa audiolibros y podcasts educativos.",
        "Lee en voz alta cuando estudies conceptos difíciles.",
    ],
    "R": [
        "Escribe resúmenes detallados después de cada clase.",
        "Crea fichas con definiciones y conceptos clave.",
        "Lee bibliografía complementaria sobre los temas.",
        "Convierte diagramas en texto escrito propio.",
    ],
    "K": [
        "Busca prácticas, laboratorios o simulaciones del tema.",
        "Aplica lo aprendido en proyectos o problemas reales.",
        "Aprende con ejemplos del mundo cotidiano.",
        "Estudia moviéndote: camina mientras repasas o usa objetos físicos.",
    ],
}

'''
