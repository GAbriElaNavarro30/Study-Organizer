# reglas_ea.py
# Motor de reglas del sistema experto VARK usando experta.
#
# En experta cada Rule se dispara automáticamente cuando la Working Memory
# contiene hechos que coinciden con sus patrones — igual que las cláusulas
# de Prolog. No hay if/else manuales: el motor de inferencia decide.

from experta import KnowledgeEngine, Rule, MATCH, TEST, AND, NOT, OR
from hechos.hechos_ea import (
    PuntajesVARK, PerfilDominante, Recomendacion,
    PERFILES, RECOMENDACIONES,
)


class MotorVARK(KnowledgeEngine):
    """
    Motor de inferencia VARK.
    Cada método decorado con @Rule es una regla del sistema experto.
    experta las dispara en orden de salience (prioridad) cuando los
    patrones de hechos coinciden con la Working Memory.
    """

    # -----------------------------------------------------------------------
    # BLOQUE 1 – Reglas de perfil SIMPLE (un solo estilo dominante)
    # Salience alta para que se resuelvan antes que los combinados.
    # -----------------------------------------------------------------------

    @Rule(
        PuntajesVARK(
            v=MATCH.v, a=MATCH.a, r=MATCH.r, k=MATCH.k
        ),
        TEST(lambda v, a, r, k: v > a and v > r and v > k),
        salience=20,
    )
    def perfil_visual(self, v, a, r, k):
        self.declare(PerfilDominante(perfil="V", nombre=PERFILES["V"]))

    @Rule(
        PuntajesVARK(
            v=MATCH.v, a=MATCH.a, r=MATCH.r, k=MATCH.k
        ),
        TEST(lambda v, a, r, k: a > v and a > r and a > k),
        salience=20,
    )
    def perfil_auditivo(self, v, a, r, k):
        self.declare(PerfilDominante(perfil="A", nombre=PERFILES["A"]))

    @Rule(
        PuntajesVARK(
            v=MATCH.v, a=MATCH.a, r=MATCH.r, k=MATCH.k
        ),
        TEST(lambda v, a, r, k: r > v and r > a and r > k),
        salience=20,
    )
    def perfil_lector(self, v, a, r, k):
        self.declare(PerfilDominante(perfil="R", nombre=PERFILES["R"]))

    @Rule(
        PuntajesVARK(
            v=MATCH.v, a=MATCH.a, r=MATCH.r, k=MATCH.k
        ),
        TEST(lambda v, a, r, k: k > v and k > a and k > r),
        salience=20,
    )
    def perfil_kinestesico(self, v, a, r, k):
        self.declare(PerfilDominante(perfil="K", nombre=PERFILES["K"]))

    # -----------------------------------------------------------------------
    # BLOQUE 2 – Reglas de perfil BIMODAL (dos estilos empatados)
    # -----------------------------------------------------------------------

    @Rule(
        PuntajesVARK(v=MATCH.v, a=MATCH.a, r=MATCH.r, k=MATCH.k),
        TEST(lambda v, a, r, k: v == a and v > r and v > k),
        salience=15,
    )
    def perfil_va(self, v, a, r, k):
        self.declare(PerfilDominante(perfil="VA", nombre=PERFILES["VA"]))

    @Rule(
        PuntajesVARK(v=MATCH.v, a=MATCH.a, r=MATCH.r, k=MATCH.k),
        TEST(lambda v, a, r, k: v == r and v > a and v > k),
        salience=15,
    )
    def perfil_vr(self, v, a, r, k):
        self.declare(PerfilDominante(perfil="VR", nombre=PERFILES["VR"]))

    @Rule(
        PuntajesVARK(v=MATCH.v, a=MATCH.a, r=MATCH.r, k=MATCH.k),
        TEST(lambda v, a, r, k: v == k and v > a and v > r),
        salience=15,
    )
    def perfil_vk(self, v, a, r, k):
        self.declare(PerfilDominante(perfil="VK", nombre=PERFILES["VK"]))

    @Rule(
        PuntajesVARK(v=MATCH.v, a=MATCH.a, r=MATCH.r, k=MATCH.k),
        TEST(lambda v, a, r, k: a == r and a > v and a > k),
        salience=15,
    )
    def perfil_ar(self, v, a, r, k):
        self.declare(PerfilDominante(perfil="AR", nombre=PERFILES["AR"]))

    @Rule(
        PuntajesVARK(v=MATCH.v, a=MATCH.a, r=MATCH.r, k=MATCH.k),
        TEST(lambda v, a, r, k: a == k and a > v and a > r),
        salience=15,
    )
    def perfil_ak(self, v, a, r, k):
        self.declare(PerfilDominante(perfil="AK", nombre=PERFILES["AK"]))

    @Rule(
        PuntajesVARK(v=MATCH.v, a=MATCH.a, r=MATCH.r, k=MATCH.k),
        TEST(lambda v, a, r, k: r == k and r > v and r > a),
        salience=15,
    )
    def perfil_rk(self, v, a, r, k):
        self.declare(PerfilDominante(perfil="RK", nombre=PERFILES["RK"]))

    # -----------------------------------------------------------------------
    # BLOQUE 3 – Reglas de perfil TRIMODAL (tres estilos empatados)
    # -----------------------------------------------------------------------

    @Rule(
        PuntajesVARK(v=MATCH.v, a=MATCH.a, r=MATCH.r, k=MATCH.k),
        TEST(lambda v, a, r, k: v == a == r and v > k),
        salience=10,
    )
    def perfil_var(self, v, a, r, k):
        self.declare(PerfilDominante(perfil="VAR", nombre=PERFILES["VAR"]))

    @Rule(
        PuntajesVARK(v=MATCH.v, a=MATCH.a, r=MATCH.r, k=MATCH.k),
        TEST(lambda v, a, r, k: v == a == k and v > r),
        salience=10,
    )
    def perfil_vak(self, v, a, r, k):
        self.declare(PerfilDominante(perfil="VAK", nombre=PERFILES["VAK"]))

    @Rule(
        PuntajesVARK(v=MATCH.v, a=MATCH.a, r=MATCH.r, k=MATCH.k),
        TEST(lambda v, a, r, k: v == r == k and v > a),
        salience=10,
    )
    def perfil_vrk(self, v, a, r, k):
        self.declare(PerfilDominante(perfil="VRK", nombre=PERFILES["VRK"]))

    @Rule(
        PuntajesVARK(v=MATCH.v, a=MATCH.a, r=MATCH.r, k=MATCH.k),
        TEST(lambda v, a, r, k: a == r == k and a > v),
        salience=10,
    )
    def perfil_ark(self, v, a, r, k):
        self.declare(PerfilDominante(perfil="ARK", nombre=PERFILES["ARK"]))

    # -----------------------------------------------------------------------
    # BLOQUE 4 – Regla MULTIMODAL (los cuatro estilos empatados)
    # -----------------------------------------------------------------------

    @Rule(
        PuntajesVARK(v=MATCH.v, a=MATCH.a, r=MATCH.r, k=MATCH.k),
        TEST(lambda v, a, r, k: v == a == r == k),
        salience=5,
    )
    def perfil_vark(self, v, a, r, k):
        self.declare(PerfilDominante(perfil="VARK", nombre=PERFILES["VARK"]))

    # -----------------------------------------------------------------------
    # BLOQUE 5 – Reglas de RECOMENDACIONES
    # Se disparan cuando ya existe un PerfilDominante en la WM.
    # Por cada letra del perfil se generan los hechos Recomendacion.
    # -----------------------------------------------------------------------

    @Rule(
        PerfilDominante(perfil=MATCH.perfil),
        salience=1,
    )
    def generar_recomendaciones(self, perfil):
        """
        Itera sobre cada letra del perfil y declara un Recomendacion
        por cada texto asociado a ese estilo en la base de conocimiento.
        """
        for letra in perfil:
            if letra in RECOMENDACIONES:
                for texto in RECOMENDACIONES[letra]:
                    self.declare(Recomendacion(estilo=letra, texto=texto))