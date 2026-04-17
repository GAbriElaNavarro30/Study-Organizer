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
    registrarEmocionDia,
    obtenerFraseHoy
} from "../controllers/dashboardController.js";

const router = Router();

// administrador - frases de motivación
router.get("/tip-diario", verificarToken, obtenerTipDiarioBienvenida);

// Emociones
router.get("/emociones", verificarToken, obtenerEmociones);
router.post("/emociones/agregar", verificarToken, agregarEmocionPersonalizada);
router.post("/emociones/registrar", verificarToken, registrarEmocion);

router.get("/emociones/verificar-hoy", verificarToken, verificarRegistroHoy);
router.get("/emociones/predominantes", verificarToken, obtenerEmocionesPredomnantes);
router.get("/emociones/historial", verificarToken, obtenerHistorialEmocional);
router.post("/emociones/registrar-dia", verificarToken, registrarEmocionDia);

// Alertas
router.get("/alertas", verificarToken, obtenerAlertas);
router.patch("/alertas/:id/vista", verificarToken, marcarAlertaVista);

router.get("/frase-hoy", verificarToken, obtenerFraseHoy);

export default router;

