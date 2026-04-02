import { Router } from "express";
import multer from "multer";
import { verificarToken } from "../middlewares/auth.js";

import {
    listarCursos,
    obtenerCurso,
    crearCurso,
    actualizarCurso,
    togglePublicarCurso,
    eliminarCurso,
    archivarCurso,          // ← nueva
    crearSeccion,
    actualizarSeccion,
    eliminarSeccion,
    crearContenido,
    actualizarContenido,
    eliminarContenido,
    crearPregunta,
    actualizarPregunta,
    eliminarPregunta,
    listarDimensiones,
} from "../controllers/cursosController.js";

const storage = multer.memoryStorage();
const upload  = multer({ storage });

const router = Router();

router.use(verificarToken);

// ─── Catálogo ──────────────────────────────────────────────
router.get("/dimensiones", listarDimensiones);

// ─── Cursos ────────────────────────────────────────────────
router.get    ("/cursos",                    listarCursos);
router.get    ("/cursos/:id",                obtenerCurso);
router.post   ("/cursos",     upload.single("foto"), crearCurso);
router.put    ("/cursos/:id", upload.single("foto"), actualizarCurso);
router.patch  ("/cursos/:id/publicar",       togglePublicarCurso);
router.patch  ("/cursos/:id/archivar",       archivarCurso);       // ← nueva
router.delete ("/cursos/:id",                eliminarCurso);

// ─── Secciones ─────────────────────────────────────────────
router.post   ("/cursos/:id/secciones",      crearSeccion);
router.put    ("/secciones/:id",             actualizarSeccion);
router.delete ("/secciones/:id",             eliminarSeccion);

// ─── Contenido ─────────────────────────────────────────────
router.post   ("/secciones/:id/contenidos",  crearContenido);
router.put    ("/contenidos/:id",            actualizarContenido);
router.delete ("/contenidos/:id",            eliminarContenido);

// ─── Test ──────────────────────────────────────────────────
router.post   ("/secciones/:id/preguntas",   crearPregunta);
router.put    ("/preguntas/:id",             actualizarPregunta);
router.delete ("/preguntas/:id",             eliminarPregunta);

export default router;