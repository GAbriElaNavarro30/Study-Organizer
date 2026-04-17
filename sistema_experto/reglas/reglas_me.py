from experta import KnowledgeEngine, Rule, MATCH, TEST, NOT

from hechos.hechos_me import (
    PuntajeDimension, PreguntaConError, PerfilVARK,
    ErrorDetectado, RecomendacionME,
    ERRORES_POR_PREGUNTA, RECOMENDACIONES_GENERALES, RECOMENDACIONES_VARK, TODOS_LOS_PERFILES,
    CriteriosCurso,
)

NIVELES_A_MEJORAR = ("deficiente", "regular", "bueno")
NIVELES_POSITIVOS = ("muy_bueno", "excelente")

 
class MotorMetodosEstudio(KnowledgeEngine):

    # ── BLOQUE 1: Error específico por pregunta ──
    # Se dispara una vez por cada pregunta donde se detectó un hábito problemático.
    @Rule(
        PreguntaConError(
            id_pregunta=MATCH.id_p,
            nombre_dim=MATCH.nombre,
        ),
        salience=20,
    )
    def detectar_error_por_pregunta(self, id_p, nombre):
        mensaje = ERRORES_POR_PREGUNTA.get(id_p)
        if mensaje:
            self.declare(ErrorDetectado(dimension=nombre, mensaje=mensaje))

    # ── BLOQUE 2: Recomendaciones generales (deficiente, regular, bueno) ──
    @Rule(
        PuntajeDimension(
            id_dimension=MATCH.id_dim,
            nombre=MATCH.nombre,
            nivel=MATCH.nivel,
        ),
        TEST(lambda nivel: nivel in NIVELES_A_MEJORAR),
        salience=10,
    )
    def recomendar_general(self, id_dim, nombre, nivel):
        for texto in RECOMENDACIONES_GENERALES.get(id_dim, []):
            self.declare(RecomendacionME(
                dimension=nombre,
                estilo_vark="general",
                texto=texto,
            ))

    # ── BLOQUE 3: Recomendaciones VARK (deficiente, regular, bueno) ──
    @Rule(
        PuntajeDimension(
            id_dimension=MATCH.id_dim,
            nombre=MATCH.nombre,
            nivel=MATCH.nivel,
        ),
        TEST(lambda nivel: nivel in NIVELES_A_MEJORAR),
        PerfilVARK(perfil=MATCH.perfil),
        salience=8,
    )
    def recomendar_vark(self, id_dim, nombre, nivel, perfil):
        for letra in perfil:
            texto = RECOMENDACIONES_VARK.get(letra, {}).get(id_dim)
            if texto:
                self.declare(RecomendacionME(
                    dimension=nombre,
                    estilo_vark=letra,
                    texto=texto,
                ))

    # ── BLOQUE 4: Refuerzo positivo (muy_bueno, excelente) ──
    @Rule(
        PuntajeDimension(
            id_dimension=MATCH.id_dim,
            nombre=MATCH.nombre,
            nivel=MATCH.nivel,
        ),
        TEST(lambda nivel: nivel in NIVELES_POSITIVOS),
        salience=5,
    )
    def refuerzo_positivo(self, id_dim, nombre, nivel):
        mensaje = (
            f"Tus hábitos en '{nombre}' son ejemplares. "
            f"Mantén esta disciplina y considera compartir tus estrategias con tus compañeros."
            if nivel == "excelente" else
            f"Tus hábitos en '{nombre}' son muy buenos. "
            f"Con pequeños ajustes puedes alcanzar un nivel excelente en esta área."
        )
        self.declare(RecomendacionME(
            dimension=nombre,
            estilo_vark="general",
            texto=mensaje,
        ))

    # ── BLOQUE 5: Recomendaciones VARK para niveles positivos ──
    @Rule(
        PuntajeDimension(
            id_dimension=MATCH.id_dim,
            nombre=MATCH.nombre,
            nivel=MATCH.nivel,
        ),
        TEST(lambda nivel: nivel in NIVELES_POSITIVOS),
        PerfilVARK(perfil=MATCH.perfil),
        salience=4,
    )
    def recomendar_vark_positivo(self, id_dim, nombre, nivel, perfil):
        for letra in perfil:
            texto = RECOMENDACIONES_VARK.get(letra, {}).get(id_dim)
            if texto:
                self.declare(RecomendacionME(
                    dimension=nombre,
                    estilo_vark=letra,
                    texto=texto,
                ))
          
          
                
    # ── BLOQUE 6: Con perfil VARK conocido ──
    @Rule(PerfilVARK(perfil=MATCH.perfil), salience=1)
    def criterios_cursos_con_perfil(self, perfil):
        dimensiones_debiles = [
            fact["id_dimension"]
            for fact in self.facts.values()
            if isinstance(fact, PuntajeDimension)
            and fact["nivel"] in ("deficiente", "regular")
        ]
        # Deducir perfiles afines igual que el motor EA
        afines = [
            p for p in TODOS_LOS_PERFILES
            if p != perfil and any(letra in p for letra in perfil)
        ]
        self.declare(CriteriosCurso(
            perfil_exacto=perfil,
            perfiles_afines=afines,
            dimensiones=dimensiones_debiles,
        ))

    # ── BLOQUE 7: Sin perfil VARK ──
    @Rule(NOT(PerfilVARK()), salience=1)
    def criterios_cursos_sin_perfil(self):
        self.declare(CriteriosCurso(
            perfil_exacto="",
            perfiles_afines=[],
            dimensiones=[],
        ))