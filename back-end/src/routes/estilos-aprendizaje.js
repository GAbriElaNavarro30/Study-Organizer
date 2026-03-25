// src/routes/estilosAprendizaje.js
import { Router } from "express";
import { verificarToken } from "../middlewares/auth.js";
import {
    obtenerPreguntas,
    responder,
    obtenerResultado,
    obtenerResultadoGuardado,
    obtenerHistorial,
} from "../controllers/estilosAprendizajeController.js";

const router = Router();

router.get("/preguntas", verificarToken, obtenerPreguntas);
router.post("/responder", verificarToken, responder);
router.get("/resultado", verificarToken, obtenerResultado);
router.get("/resultado-guardado", verificarToken, obtenerResultadoGuardado);
router.get("/historial", verificarToken, obtenerHistorial);

export default router;