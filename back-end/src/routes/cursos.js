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
    listarCursosPorDimension,
    misCursos,
    obtenerCursoEstudiante,
    inscribirseACurso,
    cancelarInscripcion,
    iniciarIntento,
    marcarContenidoVisto,
    guardarRespuestasTest,
    obtenerResultadoCurso,
    listarEstudiantesCurso,
    listarResultadosCurso,
    eliminarCuestionarioSeccion,
    eliminarEstudianteCurso,
    historialResultadosEstudiante,
    miHistorialResultados,
    obtenerResultadoIntento,
} from "../controllers/cursosController.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = Router();

router.use(verificarToken);

// ─── Catálogo ──────────────────────────────────────────────
router.get("/dimensiones", listarDimensiones);

// ─── Detalle estudiante (ANTES de /cursos/:id) ─────────────
router.get("/detalle", obtenerCursoEstudiante);

// ─── Progreso e Intentos (ANTES de /cursos/:id) ────────────
router.post("/intentos", iniciarIntento);
router.post("/progreso/:id_contenido", marcarContenidoVisto);
router.post("/test/respuestas", guardarRespuestasTest);

// ─── Cursos ────────────────────────────────────────────────
router.get("/cursos", listarCursos);
router.get("/recomendados/por-dimension", listarCursosPorDimension);
router.get("/cursos/:id", obtenerCurso);           // ← al final
router.post("/cursos", upload.single("foto"), crearCurso);
router.get("/cursos/:id/estudiantes", listarEstudiantesCurso);
router.delete("/cursos/:id/estudiantes/:id_usuario", eliminarEstudianteCurso);
router.put("/cursos/:id", upload.single("foto"), actualizarCurso);
router.patch("/cursos/:id/publicar", togglePublicarCurso);
router.patch("/cursos/:id/archivar", archivarCurso);
router.delete("/cursos/:id", eliminarCurso);

// ─── Secciones ─────────────────────────────────────────────
router.post("/cursos/:id/secciones", crearSeccion);
router.put("/secciones/:id", actualizarSeccion);
router.delete("/secciones/:id", eliminarSeccion);

// ─── Contenido ─────────────────────────────────────────────
router.post("/secciones/:id/contenidos", upload.single("imagen"), crearContenido);
router.put("/contenidos/:id", upload.single("imagen"), actualizarContenido);
router.delete("/contenidos/:id", eliminarContenido);
router.delete("/secciones/:id/cuestionario", eliminarCuestionarioSeccion);

// ─── Test ──────────────────────────────────────────────────
router.post("/secciones/:id/preguntas", crearPregunta);
router.put("/preguntas/:id", actualizarPregunta);
router.delete("/preguntas/:id", eliminarPregunta);

// ─── Inscripciones ─────────────────────────────────────────
router.get("/inscripciones/mis-cursos", misCursos);
router.post("/inscripciones", inscribirseACurso);
router.delete("/inscripciones", cancelarInscripcion);

router.get("/resultado", obtenerResultadoCurso);
router.get("/mi-historial", miHistorialResultados);


router.get("/cursos/:id/resultados", listarResultadosCurso);
router.get("/cursos/:id/estudiantes/:id_usuario/historial", historialResultadosEstudiante);
router.get("/intentos/:id_intento/resultado", obtenerResultadoIntento);

export default router;