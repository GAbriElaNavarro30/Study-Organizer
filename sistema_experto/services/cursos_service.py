import os
import httpx
from typing import Optional

NODE_API_URL   = os.getenv("NODE_API_URL", "http://localhost:3000")
INTERNAL_TOKEN = os.getenv("INTERNAL_TOKEN")

def obtener_cursos_por_perfil(
    perfil: str,
    dimensiones_con_error: Optional[list[int]] = None,
) -> list[dict]:
    params: dict = {"perfil": perfil}
    if dimensiones_con_error:
        params["dimensiones"] = ",".join(str(d) for d in dimensiones_con_error)

    try:
        with httpx.Client(timeout=5) as client:
            r = client.get(
                f"{NODE_API_URL}/api/interno/cursos-recomendados",
                params=params,
                headers={"x-internal-token": INTERNAL_TOKEN or ""},
            )
            r.raise_for_status()
            return r.json().get("cursos", [])
    except Exception as e:
        print(f"[cursos_service] No se pudieron obtener cursos: {e}")
        return []