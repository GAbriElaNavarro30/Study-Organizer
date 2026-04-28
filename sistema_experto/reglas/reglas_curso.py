# reglas/reglas_curso.py

from experta import KnowledgeEngine, Rule, MATCH, TEST
from hechos.hechos_curso import (
    ResultadoExamen,
    NivelDesempeno,
    Retroalimentacion,
    NIVELES,
    RETROALIMENTACION,
)


class MotorResultadoCurso(KnowledgeEngine):
    """
    Motor de inferencia para evaluar el resultado de un curso.

    Escala de niveles:
        100          → Excelente
        90  – 99.99  → Muy bueno
        80  – 89.99  → Bueno
        70  – 79.99  → Regular
        < 70         → Deficiente
    """

    # ───────────────────────────────────────────────────────────
    # BLOQUE 1 – Reglas de clasificación de nivel
    # salience=20 para que se disparen antes que las de
    # retroalimentación (salience=1)
    # ───────────────────────────────────────────────────────────

    @Rule(
        ResultadoExamen(porcentaje=MATCH.pct),
        TEST(lambda pct: pct == 100),
        salience=20,
    )
    def nivel_excelente(self, pct):
        self.declare(NivelDesempeno(
            nivel="excelente",
            nombre=NIVELES["excelente"],
        ))

    @Rule(
        ResultadoExamen(porcentaje=MATCH.pct),
        TEST(lambda pct: 90 <= pct < 100),
        salience=20,
    )
    def nivel_muy_bueno(self, pct):
        self.declare(NivelDesempeno(
            nivel="muy_bueno",
            nombre=NIVELES["muy_bueno"],
        ))

    @Rule(
        ResultadoExamen(porcentaje=MATCH.pct),
        TEST(lambda pct: 80 <= pct < 90),
        salience=20,
    )
    def nivel_bueno(self, pct):
        self.declare(NivelDesempeno(
            nivel="bueno",
            nombre=NIVELES["bueno"],
        ))

    @Rule(
        ResultadoExamen(porcentaje=MATCH.pct),
        TEST(lambda pct: 70 <= pct < 80),
        salience=20,
    )
    def nivel_regular(self, pct):
        self.declare(NivelDesempeno(
            nivel="regular",
            nombre=NIVELES["regular"],
        ))

    @Rule(
        ResultadoExamen(porcentaje=MATCH.pct),
        TEST(lambda pct: pct < 70),
        salience=20,
    )
    def nivel_deficiente(self, pct):
        self.declare(NivelDesempeno(
            nivel="deficiente",
            nombre=NIVELES["deficiente"],
        ))

    # ───────────────────────────────────────────────────────────
    # BLOQUE 2 – Regla de retroalimentación
    # Se dispara cuando ya existe un NivelDesempeno en la WM.
    # Declara un hecho Retroalimentacion por cada mensaje del nivel.
    # ───────────────────────────────────────────────────────────

    @Rule(
        NivelDesempeno(nivel=MATCH.nivel),
        salience=1,
    )
    def generar_retroalimentacion(self, nivel):
        for texto in RETROALIMENTACION.get(nivel, []):
            self.declare(Retroalimentacion(texto=texto)) 