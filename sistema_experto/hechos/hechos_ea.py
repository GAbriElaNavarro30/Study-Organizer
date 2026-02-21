# hechos.py
# Aquí defines los hechos base del sistema, equivalente a los hechos en Prolog

PERFILES = {
    "V": "Visual",
    "A": "Auditivo",
    "R": "Lector/Escritor",
    "K": "Kinestésico",
    "VA": "Visual-Auditivo",
    "VR": "Visual-Lector",
    "VK": "Visual-Kinestésico",
    "AR": "Auditivo-Lector",
    "AK": "Auditivo-Kinestésico",
    "KR": "Kinestésico-Lector",
    "VAR": "Visual-Auditivo-Lector",
    "VAK": "Visual-Auditivo-Kinestésico",
    "VRK": "Visual-Lector-Kinestésico",
    "ARK": "Auditivo-Lector-Kinestésico",
    "VARK": "Multimodal"
}

RECOMENDACIONES = {
    "V": [
        "Usa mapas mentales y diagramas para estudiar",
        "Prefiere libros con ilustraciones y gráficos",
        "Colorea y organiza visualmente tus apuntes",
        "Utiliza videos y presentaciones como material de apoyo",
        "Organiza tu espacio de estudio con colores y orden visual"
    ],
    "A": [
        "Graba tus clases y escúchalas después",
        "Explica en voz alta lo que estudias",
        "Participa en grupos de estudio con discusión oral",
        "Usa podcasts y audiolibros como material de apoyo",
        "Lee en voz alta cuando estudies"
    ],
    "R": [
        "Toma notas detalladas en clase",
        "Elabora resúmenes y esquemas escritos",
        "Lee artículos, libros y documentación oficial",
        "Escribe ensayos o explicaciones con tus propias palabras",
        "Organiza tu información en listas y textos estructurados"
    ],
    "K": [
        "Aprende haciendo: practica ejercicios y casos reales",
        "Toma descansos activos entre sesiones de estudio",
        "Usa simulaciones y proyectos prácticos",
        "Relaciona los conceptos con experiencias de tu vida",
        "Trabaja en laboratorios, talleres o actividades manuales"
    ]
}

# Umbral mínimo para considerar una categoría como dominante
UMBRAL_DOMINANTE = 4   # de 16 preguntas
UMBRAL_MULTIMODAL = 3  # si varias categorías tienen puntaje similar