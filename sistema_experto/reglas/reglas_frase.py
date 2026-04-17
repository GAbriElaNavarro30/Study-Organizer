# reglas/reglas_frase.py

from experta import KnowledgeEngine, Rule, MATCH, TEST

from hechos.hechos_frase import (
    EstadoEmocional,
    TipoFrase,
)

CLASIFS_DIFICILES = ("critica")


class MotorFrase(KnowledgeEngine):
    """
    Motor de inferencia para seleccionar el tipo de frase
    que se mostrará al usuario según su estado emocional del día.

    Prioridad (salience):
        30 — Racha crítica   (7+ días negativos/críticos con nivel alto)
        25 — Racha moderada  (5-6 días negativos/críticos)
        20 — Racha suave     (3-4 días negativos/críticos)
        10 — Emoción crítica (cualquier nivel, cualquier racha)
         5 — Negativa alto   (sin racha preocupante)
         1 — Resto de combinaciones (positiva/neutra/negativa bajo-medio)
    """

    # ────────────────────────────────────────────────────────
    # BLOQUE 1 — Rachas prolongadas (mayor prioridad)
    # ────────────────────────────────────────────────────────

    @Rule(
        EstadoEmocional(
            clasificacion=MATCH.clasif,
            nivel=MATCH.nivel,
            dias_consecutivos=MATCH.dias,
        ),
        TEST(lambda clasif, nivel, dias: (
            clasif in CLASIFS_DIFICILES
            and dias >= 7
            and nivel == ("alto", "medio")
        )),
        salience=30,
    )
    def racha_critica(self, clasif, nivel, dias):
        self.declare(TipoFrase(
            tipo="racha_critica",
            mostrar_alerta=True,
        ))

    @Rule(
        EstadoEmocional(
            clasificacion=MATCH.clasif,
            nivel=MATCH.nivel,
            dias_consecutivos=MATCH.dias,
        ),
        TEST(lambda clasif, nivel, dias: (
            clasif in CLASIFS_DIFICILES
            and 5 <= dias <= 6
        )),
        salience=25,
    )
    def racha_moderada(self, clasif, nivel, dias):
        self.declare(TipoFrase(
            tipo="racha_moderada",
            mostrar_alerta=True,
        ))

    @Rule(
        EstadoEmocional(
            clasificacion=MATCH.clasif,
            nivel=MATCH.nivel,
            dias_consecutivos=MATCH.dias,
        ),
        TEST(lambda clasif, nivel, dias: (
            clasif in CLASIFS_DIFICILES
            and 3 <= dias <= 4
        )),
        salience=20,
    )
    def racha_suave(self, clasif, nivel, dias):
        self.declare(TipoFrase(
            tipo="racha_suave",
            mostrar_alerta=True,
        ))

    # ────────────────────────────────────────────────────────
    # BLOQUE 2 — Emoción crítica (sin racha o racha < 3)
    # ────────────────────────────────────────────────────────

    @Rule(
        EstadoEmocional(
            clasificacion=MATCH.clasif,
            nivel=MATCH.nivel,
            dias_consecutivos=MATCH.dias,
        ),
        TEST(lambda clasif, nivel, dias: (
            clasif == "critica"
            and dias < 3
        )),
        salience=10,
    )

    # ────────────────────────────────────────────────────────
    # BLOQUE 3 — Negativa alta (sin racha preocupante)
    # ────────────────────────────────────────────────────────

    @Rule(
        EstadoEmocional(
            clasificacion=MATCH.clasif,
            nivel=MATCH.nivel,
            dias_consecutivos=MATCH.dias,
        ),
        TEST(lambda clasif, nivel, dias: (
            clasif == "negativa"
            and nivel == "alto"
            and dias < 3
        )),
        salience=5,
    )
    def negativa_alta(self, clasif, nivel, dias):
        self.declare(TipoFrase(
            tipo="negativa_alto",
            mostrar_alerta=False,
        ))

    # ────────────────────────────────────────────────────────
    # BLOQUE 4 — Resto de combinaciones (caso general)
    # positiva/neutra cualquier nivel + negativa bajo/medio sin racha
    # ────────────────────────────────────────────────────────

    @Rule(
        EstadoEmocional(
            clasificacion=MATCH.clasif,
            nivel=MATCH.nivel,
            dias_consecutivos=MATCH.dias,
        ),
        TEST(lambda clasif, nivel, dias: (
            clasif in ("positiva", "neutra")
            or (clasif == "negativa" and nivel in ("bajo", "medio") and dias < 3)
        )),
        salience=1,
    )
    def caso_general(self, clasif, nivel, dias):
        self.declare(TipoFrase(
            tipo=f"{clasif}_{nivel}",
            mostrar_alerta=False,
        ))