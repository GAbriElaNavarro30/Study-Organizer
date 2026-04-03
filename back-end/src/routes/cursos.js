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
    archivarCurso,
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
    listarCursosPorDimension
} from "../controllers/cursosController.js";

const storage = multer.memoryStorage();
const upload  = multer({ storage });

const router = Router();

router.use(verificarToken);

// ─── Catálogo ──────────────────────────────────────────────
router.get("/dimensiones", listarDimensiones);

// ─── Cursos ────────────────────────────────────────────────
router.get    ("/cursos",                    listarCursos);
router.get("/cursos/recomendados/por-dimension", listarCursosPorDimension);
router.get    ("/cursos/:id",                obtenerCurso);
router.post   ("/cursos",                    upload.single("foto"), crearCurso);
router.put    ("/cursos/:id",                upload.single("foto"), actualizarCurso);
router.patch  ("/cursos/:id/publicar",       togglePublicarCurso);
router.patch  ("/cursos/:id/archivar",       archivarCurso);
router.delete ("/cursos/:id",                eliminarCurso);

// ─── Secciones ─────────────────────────────────────────────
router.post   ("/cursos/:id/secciones",      crearSeccion);
router.put    ("/secciones/:id",             actualizarSeccion);
router.delete ("/secciones/:id",             eliminarSeccion);

// ─── Contenido ─────────────────────────────────────────────
// upload.single("imagen") en ambos verbos para que req.file esté disponible
router.post   ("/secciones/:id/contenidos",  upload.single("imagen"), crearContenido);
router.put    ("/contenidos/:id",            upload.single("imagen"), actualizarContenido);
router.delete ("/contenidos/:id",            eliminarContenido);

// ─── Test ──────────────────────────────────────────────────
router.post   ("/secciones/:id/preguntas",   crearPregunta);
router.put    ("/preguntas/:id",             actualizarPregunta);
router.delete ("/preguntas/:id",             eliminarPregunta);

export default router;