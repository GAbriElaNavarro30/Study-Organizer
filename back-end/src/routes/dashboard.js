// ============================== DASHBOARD ROUTES ==============================
import { Router } from "express";
import { verificarToken } from "../middlewares/auth.js";
import {
    obtenerEmociones,
    crearEmocion,
    verificarRegistroHoy,
    registrarEmocionDia,
    obtenerFraseHoy,
    obtenerHistorialEmocional,
    obtenerAlertasEspecialista,
    marcarAlertaVista,
} from "../controllers/dashboardController.js";

const router = Router();

router.get("/obtener-emociones", verificarToken, obtenerEmociones);
router.post("/crear-emocion", verificarToken, crearEmocion);
router.get("/emociones/verificar-hoy", verificarToken, verificarRegistroHoy);
router.post("/emociones/registrar-dia", verificarToken, registrarEmocionDia);
router.get("/frase-hoy", verificarToken, obtenerFraseHoy);
router.get("/emociones/historial", verificarToken, obtenerHistorialEmocional);
router.get("/alertas", verificarToken, obtenerAlertasEspecialista);  // ← nuevo
router.patch("/alertas/:id/vista", verificarToken, marcarAlertaVista);

export default router;