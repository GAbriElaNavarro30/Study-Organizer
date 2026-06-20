import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.estilos_aprendizaje import router as router_ea
from routers.metodos_estudio import router as router_me
from routers.resultados_curso import router as router_cursos
from routers.frases import router as router_frases

load_dotenv()

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:3000")
PYTHON_ENV   = os.getenv("PYTHON_ENV", "development")
PYTHON_PORT  = int(os.getenv("PYTHON_PORT", 8000))

ALLOWED_ORIGINS = ["*"] if PYTHON_ENV == "development" else [BACKEND_URL]

app = FastAPI(
    title="Sistema Experto",
    docs_url="/docs"  if PYTHON_ENV == "development" else None,
    redoc_url="/redoc" if PYTHON_ENV == "development" else None,
)

# Configuración de CORS para permitir comunicación con el back-end de Node.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router_ea)
app.include_router(router_me)
app.include_router(router_cursos)
app.include_router(router_frases)

@app.get("/")
def health_check():
    return {"status": "Sistema Experto activo"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=PYTHON_PORT, reload=PYTHON_ENV == "development")