import { Router } from "express";
import { verificarToken } from "../middlewares/auth.js";
import {
    obtenerNotas,
    crearNota,
    actualizarNota,
    eliminarNota,
    renombrarNota,
    obtenerNota,
    buscarNotas,
    compartirNotaCorreo,
    obtenerDestinatariosCorreo,
    renombrarDestinatarioCorreo,
    compartirNotaTelegram,
    obtenerDestinatariosTelegram,
    renombrarDestinatarioTelegram,
    compartirNotaWhatsApp,
    exportarPDF,
} from "../controllers/notasController.js";

const router = Router();

// ── Notas ──
router.get("/obtener-notas",            verificarToken, obtenerNotas);
router.post("/crear-nota",              verificarToken, crearNota);
router.put("/actualizar-nota/:id",      verificarToken, actualizarNota);
router.delete("/eliminar-nota/:id",     verificarToken, eliminarNota);
router.patch("/renombrar-nota/:id",     verificarToken, renombrarNota);
router.get("/obtener-nota/:id",         verificarToken, obtenerNota);
router.get("/buscar-notas",             verificarToken, buscarNotas);

// ── Compartir ──
router.post("/compartir-nota/:id",      verificarToken, compartirNotaCorreo);
router.post("/compartir-telegram/:id",  verificarToken, compartirNotaTelegram);
router.post("/compartir-whatsapp/:id",  verificarToken, compartirNotaWhatsApp);
router.post("/exportar-pdf/:id",        verificarToken, exportarPDF);

// ── Destinatarios correo ──
router.get("/correo-destinatarios",             verificarToken, obtenerDestinatariosCorreo);
router.patch("/correo-destinatario/:id",        verificarToken, renombrarDestinatarioCorreo);

// ── Destinatarios telegram ──
router.get("/telegram-destinatarios",           verificarToken, obtenerDestinatariosTelegram);
router.patch("/telegram-destinatario/:id",      verificarToken, renombrarDestinatarioTelegram);

export default router;