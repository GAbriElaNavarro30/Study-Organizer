# reglas_ea.py

from experta import KnowledgeEngine, Rule, MATCH, TEST, AND, NOT, OR
# hechos
from hechos.hechos_ea import (
    PuntajesVARK, PerfilDominante, Recomendacion, # hechos derivados WM
    PERFILES, RECOMENDACIONES, # consulta hechos estaticos
)

class MotorVARK(KnowledgeEngine):
    # Ej : v = 4, a = 5, r = 5, k = 2, total = 16
    
    # -----------------------------------------------------------------------
    # 1 – Reglas de perfil (un solo estilo dominante)
    # -----------------------------------------------------------------------

    # perfil dominante = visual
    @Rule(
        PuntajesVARK(
            v=MATCH.v, a=MATCH.a, r=MATCH.r, k=MATCH.k 
        ),
        TEST(lambda v, a, r, k: v > a and v > r and v > k),
        salience=20,
    )
    def perfil_visual(self, v, a, r, k):
        self.declare(PerfilDominante(perfil="V", nombre=PERFILES["V"])) # si se cumple la condicion agrega el hecho a la WM

    # auditivo
    @Rule(
        PuntajesVARK(
            v=MATCH.v, a=MATCH.a, r=MATCH.r, k=MATCH.k
        ),
        TEST(lambda v, a, r, k: a > v and a > r and a > k),
        salience=20,
    )
    def perfil_auditivo(self, v, a, r, k):
        self.declare(PerfilDominante(perfil="A", nombre=PERFILES["A"]))

    # lector / escritor
    @Rule(
        PuntajesVARK(
            v=MATCH.v, a=MATCH.a, r=MATCH.r, k=MATCH.k
        ),
        TEST(lambda v, a, r, k: r > v and r > a and r > k),
        salience=20,
    )
    def perfil_lector(self, v, a, r, k):
        self.declare(PerfilDominante(perfil="R", nombre=PERFILES["R"])) 

    # kinestesico
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
    # 2 – Reglas de perfil BIMODAL (dos estilos empatados)
    # -----------------------------------------------------------------------

    # va
    @Rule(
        PuntajesVARK(v=MATCH.v, a=MATCH.a, r=MATCH.r, k=MATCH.k),
        TEST(lambda v, a, r, k: v == a and v > r and v > k),
        salience=15,
    )
    def perfil_va(self, v, a, r, k):
        self.declare(PerfilDominante(perfil="VA", nombre=PERFILES["VA"])) 

    # vr
    @Rule(
        PuntajesVARK(v=MATCH.v, a=MATCH.a, r=MATCH.r, k=MATCH.k),
        TEST(lambda v, a, r, k: v == r and v > a and v > k),
        salience=15,
    )
    def perfil_vr(self, v, a, r, k):
        self.declare(PerfilDominante(perfil="VR", nombre=PERFILES["VR"]))

    # vk
    @Rule(
        PuntajesVARK(v=MATCH.v, a=MATCH.a, r=MATCH.r, k=MATCH.k),
        TEST(lambda v, a, r, k: v == k and v > a and v > r),
        salience=15,
    )
    def perfil_vk(self, v, a, r, k):
        self.declare(PerfilDominante(perfil="VK", nombre=PERFILES["VK"]))

    # ar
    @Rule(
        PuntajesVARK(v=MATCH.v, a=MATCH.a, r=MATCH.r, k=MATCH.k),
        TEST(lambda v, a, r, k: a == r and a > v and a > k),
        salience=15,
    )
    def perfil_ar(self, v, a, r, k):
        self.declare(PerfilDominante(perfil="AR", nombre=PERFILES["AR"]))

    # ak
    @Rule(
        PuntajesVARK(v=MATCH.v, a=MATCH.a, r=MATCH.r, k=MATCH.k),
        TEST(lambda v, a, r, k: a == k and a > v and a > r),
        salience=15,
    )
    def perfil_ak(self, v, a, r, k):
        self.declare(PerfilDominante(perfil="AK", nombre=PERFILES["AK"]))

    # rk
    @Rule(
        PuntajesVARK(v=MATCH.v, a=MATCH.a, r=MATCH.r, k=MATCH.k),
        TEST(lambda v, a, r, k: r == k and r > v and r > a),
        salience=15,
    )
    def perfil_rk(self, v, a, r, k):
        self.declare(PerfilDominante(perfil="RK", nombre=PERFILES["RK"]))

    # -----------------------------------------------------------------------
    # 3 – Reglas de perfil TRIMODAL (tres estilos empatados)
    # -----------------------------------------------------------------------

    # VAR
    @Rule(
        PuntajesVARK(v=MATCH.v, a=MATCH.a, r=MATCH.r, k=MATCH.k),
        TEST(lambda v, a, r, k: v == a == r and v > k),
        salience=10,
    )
    def perfil_var(self, v, a, r, k):
        self.declare(PerfilDominante(perfil="VAR", nombre=PERFILES["VAR"]))

    # VAK
    @Rule(
        PuntajesVARK(v=MATCH.v, a=MATCH.a, r=MATCH.r, k=MATCH.k),
        TEST(lambda v, a, r, k: v == a == k and v > r),
        salience=10,
    )
    def perfil_vak(self, v, a, r, k):
        self.declare(PerfilDominante(perfil="VAK", nombre=PERFILES["VAK"]))

    # VRK
    @Rule(
        PuntajesVARK(v=MATCH.v, a=MATCH.a, r=MATCH.r, k=MATCH.k),
        TEST(lambda v, a, r, k: v == r == k and v > a),
        salience=10,
    )
    def perfil_vrk(self, v, a, r, k):
        self.declare(PerfilDominante(perfil="VRK", nombre=PERFILES["VRK"]))

    # ARK
    @Rule(
        PuntajesVARK(v=MATCH.v, a=MATCH.a, r=MATCH.r, k=MATCH.k),
        TEST(lambda v, a, r, k: a == r == k and a > v),
        salience=10,
    )
    def perfil_ark(self, v, a, r, k):
        self.declare(PerfilDominante(perfil="ARK", nombre=PERFILES["ARK"]))

    # -----------------------------------------------------------------------
    # 4 – Regla MULTIMODAL (los cuatro estilos empatados)
    # -----------------------------------------------------------------------

    # VARK
    @Rule(
        PuntajesVARK(v=MATCH.v, a=MATCH.a, r=MATCH.r, k=MATCH.k),
        TEST(lambda v, a, r, k: v == a == r == k),
        salience=5,
    )
    def perfil_vark(self, v, a, r, k):
        self.declare(PerfilDominante(perfil="VARK", nombre=PERFILES["VARK"]))

    # -----------------------------------------------------------------------
    # BLOQUE 5 – Reglas de RECOMENDACIONES
    # Se disparan cuando ya existe un PerfilDominante en la WM. si ya valido el perfil
    # -----------------------------------------------------------------------

    @Rule(
        PerfilDominante(perfil=MATCH.perfil),
        salience=1,
    )
    def generar_recomendaciones(self, perfil): # perfil = AR
        for letra in perfil:
            if letra in RECOMENDACIONES: # letra = A, letra = R ¿existe?
                for texto in RECOMENDACIONES[letra]: 
                    self.declare(Recomendacion(estilo=letra, texto=texto))  # delcara 20 hechos en total en la WM del motor