// src/routes/metodosEstudio.js
import { Router } from "express";
import { verificarToken } from "../middlewares/auth.js";
import {
  obtenerTest,
  responder,
  obtenerResultado,
  obtenerHistorial,
} from "../controllers/metodosEstudioController.js";

const router = Router();

router.get("/preguntas", verificarToken, obtenerTest);
router.post("/guardar-respuestas", verificarToken, responder);
router.get("/resultado/:id_intento", verificarToken, obtenerResultado);
router.get("/historial", verificarToken, obtenerHistorial);

export default router;