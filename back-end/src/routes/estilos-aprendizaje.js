// src/routes/estilosAprendizaje.js
import { Router } from "express";
import { verificarToken } from "../middlewares/auth.js";
import {
    obtenerPreguntas,
    responder,
    obtenerResultado,
    obtenerResultadoGuardado,
    obtenerHistorial, // funciones
} from "../controllers/estilosAprendizajeController.js";

const router = Router(); // se crea el router donde estaran todas las rutas

router.get("/preguntas", verificarToken, obtenerPreguntas); // si existe token accede a la ruta
router.post("/responder", verificarToken, responder);
router.get("/resultado", verificarToken, obtenerResultado);
router.get("/resultado-guardado", verificarToken, obtenerResultadoGuardado);
router.get("/historial", verificarToken, obtenerHistorial);

export default router; // exporta las rutsd para que app las use 