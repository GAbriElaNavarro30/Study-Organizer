// ============================== DASHBOARD ROUTES ==============================
import { Router } from "express";
import { verificarToken } from "../middlewares/auth.js";
import {
    obtenerTipDiarioBienvenida,
    obtenerEmociones,
    agregarEmocionPersonalizada,
    registrarEmocion,
    obtenerEmocionesPredomnantes,
    obtenerAlertas,
    marcarAlertaVista,
    verificarRegistroHoy,
    obtenerHistorialEmocional,
} from "../controllers/dashboardController.js";

const router = Router();

// Emociones
router.get("/emociones", verificarToken, obtenerEmociones);
router.post("/emociones/agregar", verificarToken, agregarEmocionPersonalizada);
router.post("/emociones/registrar", verificarToken, registrarEmocion);
router.get("/emociones/verificar-hoy", verificarToken, verificarRegistroHoy);
router.get("/emociones/predominantes", verificarToken, obtenerEmocionesPredomnantes);
router.get("/emociones/historial", verificarToken, obtenerHistorialEmocional);

// Tip / frase del día
router.get("/tip-diario", verificarToken, obtenerTipDiarioBienvenida);

// Alertas
router.get("/alertas", verificarToken, obtenerAlertas);
router.patch("/alertas/:id/vista", verificarToken, marcarAlertaVista);

export default router;

