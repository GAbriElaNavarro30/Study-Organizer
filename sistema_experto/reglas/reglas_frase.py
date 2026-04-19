# reglas/reglas_frase.py

from experta import KnowledgeEngine, Rule, MATCH, TEST

from hechos.hechos_frase import EstadoEmocional, TipoFrase

CLASIFICACIONES_VALIDAS = {"positiva", "neutra", "negativa"}
NIVELES_VALIDOS_GENERAL = {"bajo", "medio", "alto"}

class MotorFrase(KnowledgeEngine):

    # Regla general: positiva/neutra/negativa × bajo/medio/alto
    @Rule(
        EstadoEmocional(
            clasificacion=MATCH.clasif,
            nivel=MATCH.nivel,
        ),
        TEST(lambda clasif, nivel: (
            clasif in CLASIFICACIONES_VALIDAS
            and nivel in NIVELES_VALIDOS_GENERAL
        )),
    )
    def seleccionar_tipo(self, clasif, nivel):
        self.declare(TipoFrase(tipo=f"{clasif}_{nivel}"))

    # Regla específica: solo negativa + critico
    @Rule(
        EstadoEmocional(
            clasificacion="negativa",
            nivel="critico",
        ),
    )
    def seleccionar_tipo_critico(self):
        self.declare(TipoFrase(tipo="negativa_critico"))