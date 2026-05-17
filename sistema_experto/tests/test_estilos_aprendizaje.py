import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app import app
from motor.motor_ea import procesar_respuestas, obtener_recomendaciones_perfil

client = TestClient(app)

# ============== PU-13 ==============
def test_perfil_visual():
    """PU-13 - Procesar respuestas y obtener perfil Visual"""
    categorias = ["V"] * 10 + ["A"] * 2 + ["R"] * 2 + ["K"] * 2
    resultado = procesar_respuestas(categorias)
    print(f"\nresultado: perfil_dominante={resultado['perfil_dominante']}, nombre_perfil={resultado['nombre_perfil']}")
    assert resultado["perfil_dominante"] == "V"
    assert resultado["nombre_perfil"] == "Visual"

# ============== PU-14 ==============
def test_perfil_bimodal():
    """PU-14 - Procesar respuestas y obtener perfil bimodal VA"""
    categorias = ["V"] * 8 + ["A"] * 8
    resultado = procesar_respuestas(categorias)
    print(f"\nresultado: perfil_dominante={resultado['perfil_dominante']}, nombre_perfil={resultado['nombre_perfil']}")
    assert resultado["perfil_dominante"] == "VA"
    assert resultado["nombre_perfil"] == "Visual — Auditivo"

# ============== PU-15 ==============
def test_menos_de_16_respuestas():
    """PU-15 - Analizar test con menos de 16 respuestas"""
    response = client.post("/ea/analizar", json={"categorias": ["V", "A", "R"]})
    print(f"\nresultado: status={response.status_code}, detail={response.json()['detail']}")
    assert response.status_code == 400
    assert response.json()["detail"] == "Se requieren al menos 16 respuestas"

# ============== PU-16 ==============
def test_categoria_invalida():
    """PU-16 - Analizar test con categoría inválida"""
    categorias = ["V"] * 15 + ["X"]
    response = client.post("/ea/analizar", json={"categorias": categorias})
    print(f"\nresultado: status={response.status_code}, detail={response.json()['detail']}")
    assert response.status_code == 400
    assert "Categoría inválida" in response.json()["detail"]

# ============== PU-17 ==============
def test_recomendaciones_perfil_valido():
    """PU-17 - Obtener recomendaciones de un perfil válido"""
    response = client.get("/ea/recomendaciones/V")
    print(f"\nresultado: status={response.status_code}, recomendaciones={response.json()['recomendaciones']}")
    assert response.status_code == 200
    assert "recomendaciones" in response.json()
    assert "V" in response.json()["recomendaciones"]

# ============== PU-18 ==============
def test_recomendaciones_perfil_inexistente():
    """PU-18 - Obtener recomendaciones de un perfil inexistente"""
    response = client.get("/ea/recomendaciones/XYZ")
    print(f"\nresultado: status={response.status_code}, detail={response.json()['detail']}")
    assert response.status_code == 404