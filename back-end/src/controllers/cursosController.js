// src/controllers/cursosController.js
import { Curso } from "../models/Curso.js";
import { SeccionCurso } from "../models/SeccionCurso.js";
import { Contenido } from "../models/Contenido.js";
import { PreguntaTest } from "../models/PreguntaTest.js";
import { OpcionTest } from "../models/OpcionTest.js";
import { Inscripcion } from "../models/Inscripcion.js";
import { IntentoCurso } from "../models/IntentoCurso.js";
import { Progreso } from "../models/Progreso.js";
import { RespuestaTestCurso } from "../models/RespuestaTestCurso.js";
import { ResultadoCurso } from "../models/ResultadoCurso.js";

import { db } from "../config/db.js";
import cloudinary from "../config/cloudinary.js";
import axios from "axios";

const PYTHON_URL = process.env.PYTHON_URL || "http://localhost:8000";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const subirImagenCloudinary = (buffer, carpeta = "cursos") =>
    new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: carpeta, resource_type: "image" },
            (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url);
            }
        );
        stream.end(buffer);
    });

const cursoEstaArchivado = async (id_curso) => {
    const curso = await Curso.getById(id_curso);
    return Boolean(curso?.archivado);
};

// ─────────────────────────────────────────────────────────────
// CURSOS
// ─────────────────────────────────────────────────────────────

export const listarCursos = async (req, res) => {
    try {
        const id_usuario = req.usuario.id;
        const cursos = await Curso.getByUsuario(id_usuario);
        res.json({ ok: true, cursos });
    } catch (error) {
        console.error("listarCursos:", error);
        res.status(500).json({ ok: false, mensaje: "Error al obtener los cursos." });
    }
};

export const obtenerCurso = async (req, res) => {
    try {
        const { id } = req.params;
        const id_usuario = req.usuario.id;

        const curso = await Curso.getById(id);
        if (!curso || curso.id_usuario !== id_usuario) {
            return res.status(404).json({ ok: false, mensaje: "Curso no encontrado." });
        }

        const cursoCompleto = await Curso.getCursoCompleto(id);
        res.json({ ok: true, curso: cursoCompleto });
    } catch (error) {
        console.error("obtenerCurso:", error);
        res.status(500).json({ ok: false, mensaje: "Error al obtener el curso." });
    }
};

export const crearCurso = async (req, res) => {
    try {
        const id_usuario = req.usuario.id;
        const { titulo, descripcion, perfil_vark, id_dimension } = req.body;

        if (!titulo?.trim()) {
            return res.status(400).json({ ok: false, mensaje: "El título es obligatorio." });
        }
        if (titulo.trim().length > 200) {
            return res.status(400).json({ ok: false, mensaje: "El título no puede superar los 200 caracteres." });
        }
        if (titulo.trim().length < 5) {
            return res.status(400).json({ ok: false, mensaje: "El título debe tener al menos 5 caracteres." });
        }
        if (descripcion && descripcion.trim().length > 500) {
            return res.status(400).json({ ok: false, mensaje: "La descripción no puede superar los 500 caracteres." });
        }
        if (!perfil_vark) {
            return res.status(400).json({ ok: false, mensaje: "El perfil VARK es obligatorio." });
        }

        const [existing] = await db.query(
            "SELECT id_curso FROM Curso WHERE titulo = ? AND id_usuario = ?",
            [titulo.trim(), id_usuario]
        );
        if (existing.length > 0) {
            return res.status(409).json({ ok: false, mensaje: "Ya tienes un curso con ese título." });
        }

        let foto = null;
        if (req.file) foto = await subirImagenCloudinary(req.file.buffer);

        const curso = new Curso({
            titulo: titulo.trim(),
            descripcion: descripcion?.trim() || null,
            foto,
            perfil_vark: perfil_vark || null,
            id_dimension: id_dimension || null,
            id_usuario,
        });

        const [result] = await curso.save();
        res.status(201).json({ ok: true, id_curso: result.insertId });
    } catch (error) {
        console.error("crearCurso:", error);
        res.status(500).json({ ok: false, mensaje: "Error al crear el curso." });
    }
};

export const actualizarCurso = async (req, res) => {
    try {
        const { id } = req.params;
        const id_usuario = req.usuario.id;
        const { titulo, descripcion, perfil_vark, id_dimension, eliminar_foto } = req.body;

        const curso = await Curso.getById(id);
        if (!curso || curso.id_usuario !== id_usuario) {
            return res.status(404).json({ ok: false, mensaje: "Curso no encontrado." });
        }

        if (titulo !== undefined && !titulo.trim()) {
            return res.status(400).json({ ok: false, mensaje: "El título no puede estar vacío." });
        }
        if (titulo !== undefined && titulo.trim().length > 200) {
            return res.status(400).json({ ok: false, mensaje: "El título no puede superar los 200 caracteres." });
        }
        if (titulo !== undefined && titulo.trim().length < 5) {
            return res.status(400).json({ ok: false, mensaje: "El título debe tener al menos 5 caracteres." });
        }
        if (descripcion !== undefined && descripcion && descripcion.trim().length > 500) {
            return res.status(400).json({ ok: false, mensaje: "La descripción no puede superar los 500 caracteres." });
        }
        if (perfil_vark !== undefined && !perfil_vark) {
            return res.status(400).json({ ok: false, mensaje: "El perfil VARK es obligatorio." });
        }

        if (titulo !== undefined) {
            const [existing] = await db.query(
                "SELECT id_curso FROM Curso WHERE titulo = ? AND id_usuario = ? AND id_curso != ?",
                [titulo.trim(), id_usuario, id]
            );
            if (existing.length > 0) {
                return res.status(409).json({ ok: false, mensaje: "Ya tienes un curso con ese título." });
            }
        }

        const campos = {};
        if (titulo !== undefined) campos.titulo = titulo.trim();
        if (descripcion !== undefined) campos.descripcion = descripcion?.trim() || null;
        if (perfil_vark !== undefined) campos.perfil_vark = perfil_vark || null;
        if (id_dimension !== undefined) campos.id_dimension = id_dimension || null;

        if (req.file) {
            campos.foto = await subirImagenCloudinary(req.file.buffer);
        } else if (eliminar_foto === "true" || eliminar_foto === true) {
            campos.foto = null;
        }

        if (Object.keys(campos).length === 0) {
            return res.status(400).json({ ok: false, mensaje: "No hay campos para actualizar." });
        }

        await Curso.update(id, campos);
        res.json({ ok: true, mensaje: "Curso actualizado." });
    } catch (error) {
        console.error("actualizarCurso:", error);
        res.status(500).json({ ok: false, mensaje: "Error al actualizar el curso." });
    }
};

export const togglePublicarCurso = async (req, res) => {
    try {
        const { id } = req.params;
        const id_usuario = req.usuario.id;

        const curso = await Curso.getById(id);
        if (!curso || curso.id_usuario !== id_usuario) {
            return res.status(404).json({ ok: false, mensaje: "Curso no encontrado." });
        }

        if (curso.archivado) {
            return res.status(403).json({ ok: false, mensaje: "No puedes publicar un curso archivado. Desarchívalo primero." });
        }

        const nuevo_estado = !curso.es_publicado;
        await Curso.update(id, { es_publicado: nuevo_estado });
        res.json({ ok: true, es_publicado: nuevo_estado });
    } catch (error) {
        console.error("togglePublicarCurso:", error);
        res.status(500).json({ ok: false, mensaje: "Error al cambiar estado del curso." });
    }
};

export const eliminarCurso = async (req, res) => {
    try {
        const { id } = req.params;
        const id_usuario = req.usuario.id;

        const curso = await Curso.getById(id);
        if (!curso || curso.id_usuario !== id_usuario) {
            return res.status(404).json({ ok: false, mensaje: "Curso no encontrado." });
        }

        await Curso.delete(id);
        res.json({ ok: true, mensaje: "Curso eliminado." });
    } catch (error) {
        console.error("eliminarCurso:", error);
        res.status(500).json({ ok: false, mensaje: "Error al eliminar el curso." });
    }
};

export const archivarCurso = async (req, res) => {
    try {
        const { id } = req.params;
        const id_usuario = req.usuario.id;

        const curso = await Curso.getById(id);
        if (!curso || curso.id_usuario !== id_usuario) {
            return res.status(404).json({ ok: false, mensaje: "Curso no encontrado." });
        }

        const nuevo_estado = !curso.archivado;
        const campos = { archivado: nuevo_estado };

        if (nuevo_estado) {
            campos.era_publicado = curso.es_publicado ? 1 : 0;
            campos.es_publicado = false;
        } else {
            if (curso.era_publicado) {
                campos.es_publicado = true;
            }
            campos.era_publicado = 0;
        }

        await Curso.update(id, campos);
        res.json({ ok: true, archivado: nuevo_estado, es_publicado: campos.es_publicado ?? curso.es_publicado });
    } catch (error) {
        console.error("archivarCurso:", error);
        res.status(500).json({ ok: false, mensaje: "Error al archivar el curso." });
    }
};

// ─────────────────────────────────────────────────────────────
// SECCIONES
// ─────────────────────────────────────────────────────────────

export const crearSeccion = async (req, res) => {
    try {
        const { id } = req.params;
        const id_usuario = req.usuario.id;
        const { titulo_seccion, descripcion_seccion, orden } = req.body;

        if (!titulo_seccion?.trim()) {
            return res.status(400).json({ ok: false, mensaje: "El título de la sección es obligatorio." });
        }

        const curso = await Curso.getById(id);
        if (!curso || curso.id_usuario !== id_usuario) {
            return res.status(404).json({ ok: false, mensaje: "Curso no encontrado." });
        }

        let ordenFinal = orden;
        if (!ordenFinal) {
            const secciones = await SeccionCurso.getByCurso(id);
            ordenFinal = secciones.length > 0 ? Math.max(...secciones.map(s => s.orden)) + 1 : 1;
        }

        const seccion = new SeccionCurso({
            titulo_seccion: titulo_seccion.trim(),
            descripcion_seccion: descripcion_seccion?.trim() || null,
            orden: ordenFinal,
            id_curso: id,
        });

        const [result] = await seccion.save();
        res.status(201).json({ ok: true, id_seccion: result.insertId, orden: ordenFinal });
    } catch (error) {
        console.error("crearSeccion:", error);
        res.status(500).json({ ok: false, mensaje: "Error al crear la sección." });
    }
};

export const actualizarSeccion = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo_seccion, descripcion_seccion, orden } = req.body;

        if (titulo_seccion !== undefined && !titulo_seccion.trim()) {
            return res.status(400).json({ ok: false, mensaje: "El título de la sección no puede estar vacío." });
        }

        const campos = {};
        if (titulo_seccion !== undefined) campos.titulo_seccion = titulo_seccion.trim();
        if (descripcion_seccion !== undefined) campos.descripcion_seccion = descripcion_seccion?.trim() || null;
        if (orden !== undefined) campos.orden = orden;

        if (Object.keys(campos).length === 0) {
            return res.status(400).json({ ok: false, mensaje: "No hay campos para actualizar." });
        }

        await SeccionCurso.update(id, campos);
        res.json({ ok: true, mensaje: "Sección actualizada." });
    } catch (error) {
        console.error("actualizarSeccion:", error);
        res.status(500).json({ ok: false, mensaje: "Error al actualizar la sección." });
    }
};

export const eliminarSeccion = async (req, res) => {
    try {
        const { id } = req.params;
        await SeccionCurso.delete(id);
        res.json({ ok: true, mensaje: "Sección eliminada." });
    } catch (error) {
        console.error("eliminarSeccion:", error);
        res.status(500).json({ ok: false, mensaje: "Error al eliminar la sección." });
    }
};

// ─────────────────────────────────────────────────────────────
// CONTENIDO
// ─────────────────────────────────────────────────────────────

export const crearContenido = async (req, res) => {
    try {
        const { id } = req.params; // id_seccion
        const { titulo, contenido, orden } = req.body;

        let ordenFinal = orden;
        if (!ordenFinal) {
            const contenidos = await Contenido.getBySeccion(id);
            ordenFinal = contenidos.length > 0 ? Math.max(...contenidos.map(c => c.orden)) + 1 : 1;
        }

        let imagen_url = null;
        if (req.file) imagen_url = await subirImagenCloudinary(req.file.buffer, "cursos/contenidos");

        const bloque = new Contenido({
            titulo: titulo.trim(),
            contenido: contenido?.trim() || null,
            orden: ordenFinal,
            id_seccion: id,
            imagen_url,
        });

        const [result] = await bloque.save();

        await SeccionCurso.recalcularTotalContenidos(id);

        res.status(201).json({ ok: true, id_contenido: result.insertId, orden: ordenFinal });
    } catch (error) {
        console.error("crearContenido:", error);
        res.status(500).json({ ok: false, mensaje: "Error al crear el contenido." });
    }
};

export const actualizarContenido = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, contenido, orden, eliminar_imagen } = req.body;

        const campos = {};
        if (titulo !== undefined) campos.titulo = titulo.trim();
        if (contenido !== undefined) campos.contenido = contenido?.trim() || null;
        if (orden !== undefined) campos.orden = orden;

        if (req.file) {
            campos.imagen_url = await subirImagenCloudinary(req.file.buffer, "cursos/contenidos");
        } else if (eliminar_imagen === "true" || eliminar_imagen === true) {
            campos.imagen_url = null;
        }

        if (Object.keys(campos).length === 0) {
            return res.status(400).json({ ok: false, mensaje: "No hay campos para actualizar." });
        }

        await Contenido.update(id, campos);
        res.json({ ok: true, mensaje: "Contenido actualizado." });
    } catch (error) {
        console.error("actualizarContenido:", error);
        res.status(500).json({ ok: false, mensaje: "Error al actualizar el contenido." });
    }
};

export const eliminarContenido = async (req, res) => {
    try {
        const { id } = req.params;

        const contenido = await Contenido.getById(id);
        const id_seccion = contenido?.id_seccion ?? null;

        await Contenido.delete(id);

        if (id_seccion) {
            await SeccionCurso.recalcularTotalContenidos(id_seccion);
        }

        res.json({ ok: true, mensaje: "Contenido eliminado." });
    } catch (error) {
        console.error("eliminarContenido:", error);
        res.status(500).json({ ok: false, mensaje: "Error al eliminar el contenido." });
    }
};

// ─────────────────────────────────────────────────────────────
// TEST (preguntas + opciones)
// ─────────────────────────────────────────────────────────────

export const crearPregunta = async (req, res) => {
    try {
        const { id } = req.params;
        const { texto_pregunta, opciones = [] } = req.body;

        const id_curso = await SeccionCurso.getIdCursoPorSeccion(id);

        if (id_curso) {
            const tienePreguntas = await PreguntaTest.seccionTienePreguntas(id);
            if (tienePreguntas) {
                const tieneInscritos = await Curso.tieneInscritos(id_curso);
                if (tieneInscritos) {
                    return res.status(403).json({
                        ok: false,
                        mensaje: "No puedes agregar preguntas a un cuestionario existente si el curso ya tiene estudiantes inscritos.",
                    });
                }
            }
        }

        if (!texto_pregunta?.trim()) {
            return res.status(400).json({ ok: false, mensaje: "El texto de la pregunta es obligatorio." });
        }
        if (opciones.length < 2) {
            return res.status(400).json({ ok: false, mensaje: "Debe haber al menos 2 opciones." });
        }
        if (opciones.some(o => !o.texto_opcion?.trim())) {
            return res.status(400).json({ ok: false, mensaje: "Todas las opciones deben tener texto." });
        }
        if (!opciones.some(o => o.es_correcta)) {
            return res.status(400).json({ ok: false, mensaje: "Debe marcarse al menos una opción correcta." });
        }

        const pregunta = new PreguntaTest({ texto_pregunta: texto_pregunta.trim(), id_seccion: id });
        const [pregResult] = await pregunta.save();
        const id_test = pregResult.insertId;

        for (const op of opciones) {
            const opcion = new OpcionTest({
                texto_opcion: op.texto_opcion.trim(),
                es_correcta: Boolean(op.es_correcta),
                id_test,
            });
            await opcion.save();
        }

        res.status(201).json({ ok: true, id_test });
    } catch (error) {
        console.error("crearPregunta:", error);
        res.status(500).json({ ok: false, mensaje: "Error al crear la pregunta." });
    }
};

export const actualizarPregunta = async (req, res) => {
    try {
        const { id } = req.params;
        const { texto_pregunta, opciones = [] } = req.body;

        const id_curso = await PreguntaTest.getIdCursoPorPregunta(id);

        if (id_curso) {
            const tieneInscritos = await Curso.tieneInscritos(id_curso);
            if (tieneInscritos) {
                return res.status(403).json({
                    ok: false,
                    mensaje: "No puedes modificar el cuestionario de un curso con estudiantes inscritos.",
                });
            }
        }

        if (texto_pregunta !== undefined && !texto_pregunta.trim()) {
            return res.status(400).json({ ok: false, mensaje: "El texto de la pregunta no puede estar vacío." });
        }
        if (opciones.length > 0) {
            if (opciones.length < 2) {
                return res.status(400).json({ ok: false, mensaje: "Debe haber al menos 2 opciones." });
            }
            if (opciones.some(o => !o.texto_opcion?.trim())) {
                return res.status(400).json({ ok: false, mensaje: "Todas las opciones deben tener texto." });
            }
            if (!opciones.some(o => o.es_correcta)) {
                return res.status(400).json({ ok: false, mensaje: "Debe marcarse al menos una opción correcta." });
            }
        }

        if (texto_pregunta) {
            await PreguntaTest.update(id, { texto_pregunta: texto_pregunta.trim() });
        }

        if (opciones.length > 0) {
            await OpcionTest.deleteByPregunta(id);
            for (const op of opciones) {
                const opcion = new OpcionTest({
                    texto_opcion: op.texto_opcion.trim(),
                    es_correcta: Boolean(op.es_correcta),
                    id_test: id,
                });
                await opcion.save();
            }
        }

        res.json({ ok: true, mensaje: "Pregunta actualizada." });
    } catch (error) {
        console.error("actualizarPregunta:", error);
        res.status(500).json({ ok: false, mensaje: "Error al actualizar la pregunta." });
    }
};

export const eliminarPregunta = async (req, res) => {
    try {
        const { id } = req.params;

        const id_curso = await PreguntaTest.getIdCursoPorPregunta(id);

        if (id_curso) {
            const tieneInscritos = await Curso.tieneInscritos(id_curso);
            if (tieneInscritos) {
                return res.status(403).json({
                    ok: false,
                    mensaje: "No puedes eliminar preguntas de un curso con estudiantes inscritos.",
                });
            }
        }

        await PreguntaTest.delete(id);
        res.json({ ok: true, mensaje: "Pregunta eliminada." });
    } catch (error) {
        console.error("eliminarPregunta:", error);
        res.status(500).json({ ok: false, mensaje: "Error al eliminar la pregunta." });
    }
};

export const eliminarCuestionarioSeccion = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM Pregunta_Test WHERE id_seccion = ?", [id]);
        res.json({ ok: true, mensaje: "Cuestionario eliminado." });
    } catch (error) {
        console.error("eliminarCuestionarioSeccion:", error);
        res.status(500).json({ ok: false, mensaje: "Error al eliminar el cuestionario." });
    }
};

// ─────────────────────────────────────────────────────────────
// DIMENSIONES
// ─────────────────────────────────────────────────────────────

export const listarDimensiones = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT id_dimension, nombre_dimension FROM Dimension_Evaluar ORDER BY nombre_dimension"
        );
        res.json({ ok: true, dimensiones: rows });
    } catch (error) {
        console.error("listarDimensiones:", error);
        res.status(500).json({ ok: false, mensaje: "Error al obtener las dimensiones." });
    }
};

// ─────────────────────────────────────────────────────────────
// CATÁLOGO ESTUDIANTE
// ─────────────────────────────────────────────────────────────

export const listarCursosRecomendados = async (req, res) => {
    try {
        const id_usuario = req.usuario.id;
        const { perfil } = req.query;

        if (!perfil) {
            return res.status(400).json({ ok: false, mensaje: "El perfil VARK es requerido." });
        }

        const cursos = await Curso.getRecomendadosPorPerfil(id_usuario, perfil);
        res.json({ ok: true, cursos });
    } catch (error) {
        console.error("listarCursosRecomendados:", error);
        res.status(500).json({ ok: false, mensaje: "Error al obtener cursos recomendados." });
    }
};

export const listarCursosPorDimension = async (req, res) => {
    try {
        const { perfil, dimensiones } = req.query;

        if (!perfil) {
            return res.status(400).json({ ok: false, mensaje: "El perfil VARK es requerido." });
        }

        let dimensionIds = [];
        if (dimensiones) {
            dimensionIds = dimensiones.split(",").map(Number).filter(Boolean);
        }

        const cursos = await Curso.getPorDimensionYPerfil(perfil, dimensionIds);
        res.json({ ok: true, cursos });
    } catch (error) {
        console.error("listarCursosPorDimension:", error);
        res.status(500).json({ ok: false, mensaje: "Error al obtener cursos." });
    }
};

// ─────────────────────────────────────────────────────────────
// INSCRIPCIONES + PROGRESO
// ─────────────────────────────────────────────────────────────

export const misCursos = async (req, res) => {
    try {
        const id_usuario = req.usuario.id;
        const cursos = await Curso.getCursosEstudiante(id_usuario);
        const archivados = await Curso.getCursosEstudianteArchivados(id_usuario);
        res.json({ ok: true, cursos, archivados });
    } catch (error) {
        console.error("misCursos:", error);
        res.status(500).json({ ok: false, mensaje: "Error al obtener tus cursos." });
    }
};

export const obtenerCursoEstudiante = async (req, res) => {
    try {
        const { id } = req.query;
        const id_usuario = req.usuario.id;

        const cursoData = await Curso.getCursoParaEstudiante(id);
        if (!cursoData) {
            return res.status(404).json({ ok: false, mensaje: "Curso no encontrado." });
        }

        const secciones = await SeccionCurso.getByCurso(id);
        for (const seccion of secciones) {
            seccion.contenidos = await Contenido.getBySeccion(seccion.id_seccion);
            seccion.preguntas = await PreguntaTest.getBySeccionConOpciones(seccion.id_seccion);
        }

        const curso = {
            ...cursoData,
            secciones,
            tutor: {
                nombre: `${cursoData.nombre_tutor || ''} ${cursoData.apellido_tutor || ''}`.trim(),
                foto: cursoData.foto_tutor || null,
                descripcion: cursoData.descripcion_tutor || null,
                correo: cursoData.correo_tutor || null,
                telefono: cursoData.telefono_tutor || null,
            }
        };

        const inscrito = !!(await Inscripcion.getByUsuarioYCurso(id_usuario, id));
        const progreso = inscrito ? await Inscripcion.getProgresoEstudiante(id_usuario, id) : null;
        const ultimoResultado = inscrito ? await Inscripcion.getUltimoResultado(id_usuario, id) : null;

        res.json({ ok: true, curso, inscrito, progreso, ultimoResultado });
    } catch (error) {
        console.error("obtenerCursoEstudiante:", error);
        res.status(500).json({ ok: false, mensaje: "Error al obtener el curso." });
    }
};

export const inscribirseACurso = async (req, res) => {
    try {
        const id_usuario = req.usuario.id;
        const { id_curso } = req.body;

        if (!id_curso) {
            return res.status(400).json({ ok: false, mensaje: "El id_curso es requerido." });
        }

        const curso = await Curso.getById(id_curso);
        if (!curso || !curso.es_publicado || curso.archivado) {
            return res.status(404).json({ ok: false, mensaje: "Curso no disponible." });
        }

        const yaInscrito = await Inscripcion.getByUsuarioYCurso(id_usuario, id_curso);
        if (yaInscrito) {
            return res.status(400).json({ ok: false, mensaje: "Ya estás inscrito en este curso." });
        }

        const inscripcion = new Inscripcion({ id_usuario, id_curso });
        await inscripcion.save();
        res.status(201).json({ ok: true, mensaje: "Inscripción exitosa." });
    } catch (error) {
        console.error("inscribirseACurso:", error);
        res.status(500).json({ ok: false, mensaje: "Error al inscribirse." });
    }
};

export const cancelarInscripcion = async (req, res) => {
    try {
        const id_usuario = req.usuario.id;
        const { id_curso } = req.body;

        if (!id_curso) {
            return res.status(400).json({ ok: false, mensaje: "El id_curso es requerido." });
        }

        const inscripcion = await Inscripcion.getByUsuarioYCurso(id_usuario, id_curso);
        if (!inscripcion) {
            return res.status(404).json({ ok: false, mensaje: "No estás inscrito en este curso." });
        }

        await Inscripcion.delete(inscripcion.id_inscripcion);
        res.json({ ok: true, mensaje: "Inscripción cancelada." });
    } catch (error) {
        console.error("cancelarInscripcion:", error);
        res.status(500).json({ ok: false, mensaje: "Error al cancelar la inscripción." });
    }
};

export const iniciarIntento = async (req, res) => {
    try {
        const id_usuario = req.usuario.id;
        const { id_curso } = req.body;

        const inscripcion = await Inscripcion.getByUsuarioYCurso(id_usuario, id_curso);
        if (!inscripcion) {
            return res.status(403).json({ ok: false, mensaje: "No estás inscrito en este curso." });
        }

        const curso = await Curso.getById(id_curso);
        if (curso?.archivado) {
            return res.status(403).json({ ok: false, mensaje: "Este curso está archivado y no puede realizarse." });
        }

        const intentos = await IntentoCurso.getByInscripcion(inscripcion.id_inscripcion);
        const numero_intento = intentos.length + 1;

        const intento = new IntentoCurso({ numero_intento, id_inscripcion: inscripcion.id_inscripcion });
        const [result] = await intento.save();

        res.status(201).json({ ok: true, id_intento: result.insertId, numero_intento });
    } catch (error) {
        console.error("iniciarIntento:", error);
        res.status(500).json({ ok: false, mensaje: "Error al iniciar el intento." });
    }
};

export const marcarContenidoVisto = async (req, res) => {
    try {
        const { id_contenido } = req.params;
        const id_usuario = req.usuario.id;
        const { id_curso } = req.body;

        const inscripcion = await Inscripcion.getByUsuarioYCurso(id_usuario, id_curso);
        if (!inscripcion) {
            return res.status(403).json({ ok: false, mensaje: "No estás inscrito." });
        }

        const curso = await Curso.getById(id_curso);
        if (curso?.archivado) {
            return res.status(403).json({ ok: false, mensaje: "Este curso está archivado." });
        }

        const intento = await IntentoCurso.getUltimoPorInscripcion(inscripcion.id_inscripcion);
        if (!intento) {
            return res.status(404).json({ ok: false, mensaje: "No hay intento activo." });
        }

        await Progreso.marcarVisto(intento.id_intento, id_contenido);
        const pct = await Progreso.getPorcentajeCompletado(intento.id_intento, id_curso);

        if (pct === 100 && !intento.completado) {
            await IntentoCurso.completar(intento.id_intento);

            // ── Verificar si el curso tiene cuestionarios ──
            const [[{ total_cuestionarios }]] = await db.query(
                `SELECT COUNT(DISTINCT pt.id_seccion) AS total_cuestionarios
                 FROM Pregunta_Test pt
                 JOIN Seccion_Curso sc ON pt.id_seccion = sc.id_seccion
                 WHERE sc.id_curso = ?`,
                [id_curso]
            );

            let porcentaje_final = 0;
            let total_preguntas_global = 0;
            let correctas_global = 0;
            let nivel = null;
            let retroalimentacion = [];

            if (total_cuestionarios > 0) {
                // ── Promedio de puntajes por sección ──
                const [[{ promedio }]] = await db.query(
                    `SELECT AVG(sub.pct) AS promedio
                     FROM (
                         SELECT 
                             pt.id_seccion,
                             (SUM(rtc.es_correcta) / COUNT(*)) * 100 AS pct
                         FROM Respuesta_Test_Curso rtc
                         JOIN Pregunta_Test pt ON rtc.id_test = pt.id_test
                         WHERE rtc.id_intento = ?
                         GROUP BY pt.id_seccion
                     ) sub`,
                    [intento.id_intento]
                );

                // ── Totales globales ──
                const [[totales]] = await db.query(
                    `SELECT COUNT(*) AS total, SUM(es_correcta) AS correctas
                     FROM Respuesta_Test_Curso
                     WHERE id_intento = ?`,
                    [intento.id_intento]
                );

                porcentaje_final = parseFloat((Number(promedio) || 0).toFixed(2));
                total_preguntas_global = totales.total || 0;
                correctas_global = totales.correctas || 0;

                // ── Llamar al Sistema Experto ──
                try {
                    const pythonRes = await axios.post(`${PYTHON_URL}/cursos/evaluar`, {
                        porcentaje: porcentaje_final
                    });
                    nivel = pythonRes.data.nombre_nivel;
                    retroalimentacion = pythonRes.data.retroalimentacion ?? [];
                } catch (errPython) {
                    console.error("marcarContenidoVisto — sistema experto no disponible:", errPython.message);
                }

                // ── Guardar resultado final en BD ──
                const resultado = new ResultadoCurso({
                    total_preguntas: total_preguntas_global,
                    respuestas_correctas: correctas_global,
                    porcentaje: porcentaje_final,
                    nivel,
                    id_intento: intento.id_intento,
                });
                await resultado.save();
            }

            return res.json({
                ok: true,
                porcentaje: pct,
                completado: true,
                resultado: {
                    porcentaje: porcentaje_final,
                    nivel,
                    retroalimentacion,
                }
            });
        }

        res.json({ ok: true, porcentaje: pct, completado: pct === 100 });
    } catch (error) {
        console.error("marcarContenidoVisto:", error);
        res.status(500).json({ ok: false, mensaje: "Error al marcar contenido." });
    }
};

// ─────────────────────────────────────────────────────────────
// RESPUESTAS TEST + SISTEMA EXPERTO
// ─────────────────────────────────────────────────────────────

export const guardarRespuestasTest = async (req, res) => {
    try {
        const id_usuario = req.usuario.id;
        const { id_curso, respuestas } = req.body;

        if (!id_curso || !respuestas?.length) {
            return res.status(400).json({ ok: false, mensaje: "Datos incompletos." });
        }

        const inscripcion = await Inscripcion.getByUsuarioYCurso(id_usuario, id_curso);
        if (!inscripcion) {
            return res.status(403).json({ ok: false, mensaje: "No estás inscrito." });
        }

        const curso = await Curso.getById(id_curso);
        if (curso?.archivado) {
            return res.status(403).json({ ok: false, mensaje: "Este curso está archivado." });
        }

        const intento = await IntentoCurso.getUltimoPorInscripcion(inscripcion.id_inscripcion);
        if (!intento) {
            return res.status(404).json({ ok: false, mensaje: "No hay intento activo." });
        }

        // ── Calcular correctas de este cuestionario ──
        let correctas = 0;
        const filas = [];
        for (const r of respuestas) {
            const [[opcion]] = await db.query(
                "SELECT es_correcta FROM Opcion_Test WHERE id_opcion = ?",
                [r.id_opcion]
            );
            const es_correcta = opcion?.es_correcta ? 1 : 0;
            if (es_correcta) correctas++;
            filas.push({ es_correcta, id_test: r.id_test, id_opcion: r.id_opcion });
        }

        // ── Guardar respuestas acumulando las de todos los cuestionarios ──
        await RespuestaTestCurso.saveMany(intento.id_intento, filas);

        const total = respuestas.length;
        const porcentaje = total > 0
            ? parseFloat(((correctas / total) * 100).toFixed(2))
            : 0;

        // ── Solo devolver resultado parcial de este cuestionario al front ──
        res.json({
            ok: true,
            correctas,
            total,
            porcentaje,
        });
    } catch (error) {
        console.error("guardarRespuestasTest:", error);
        res.status(500).json({ ok: false, mensaje: "Error al guardar respuestas." });
    }
};

export const obtenerResultadoCurso = async (req, res) => {
    try {
        const id_usuario = req.usuario.id;
        const { id_curso } = req.query;

        const inscripcion = await Inscripcion.getByUsuarioYCurso(id_usuario, id_curso);
        if (!inscripcion) {
            return res.status(403).json({ ok: false, mensaje: "No estás inscrito." });
        }

        // ── Buscar el último intento que tenga resultado guardado ──
        const [[intentoConResultado]] = await db.query(
            `SELECT ic.id_intento
             FROM Intento_Curso ic
             INNER JOIN Resultado_Curso rc ON rc.id_intento = ic.id_intento
             WHERE ic.id_inscripcion = ?
             ORDER BY ic.numero_intento DESC
             LIMIT 1`,
            [inscripcion.id_inscripcion]
        );

        if (!intentoConResultado) {
            return res.json({ ok: true, resultado: null, retroalimentacion: [] });
        }

        const resultado = await ResultadoCurso.getByIntento(intentoConResultado.id_intento);

        // ── Agregar fechas del intento al resultado ──
        const [[intentoDetalle]] = await db.query(
            `SELECT fecha_inicio, fecha_fin FROM Intento_Curso WHERE id_intento = ?`,
            [intentoConResultado.id_intento]
        );
        if (resultado && intentoDetalle) {
            resultado.fecha_inicio = intentoDetalle.fecha_inicio;
            resultado.fecha_fin = intentoDetalle.fecha_fin;
        }

        // ── Recalcular retroalimentación desde el sistema experto ──
        let retroalimentacion = [];
        if (resultado?.porcentaje !== undefined) {
            try {
                const pythonRes = await axios.post(`${PYTHON_URL}/cursos/evaluar`, {
                    porcentaje: resultado.porcentaje
                });
                retroalimentacion = pythonRes.data.retroalimentacion ?? [];
            } catch (errPython) {
                console.error("obtenerResultadoCurso — sistema experto no disponible:", errPython.message);
            }
        }

        res.json({
            ok: true,
            resultado: resultado || null,
            retroalimentacion,
        });
    } catch (error) {
        console.error("obtenerResultadoCurso:", error);
        res.status(500).json({ ok: false, mensaje: "Error al obtener el resultado." });
    }
};

export const listarEstudiantesCurso = async (req, res) => {
    try {
        const { id } = req.params;
        const id_usuario = req.usuario.id;

        const curso = await Curso.getById(id);
        if (!curso || curso.id_usuario !== id_usuario) {
            return res.status(404).json({ ok: false, mensaje: "Curso no encontrado." });
        }

        const estudiantes = await Inscripcion.getEstudiantesConDatos(id);
        res.json({ ok: true, estudiantes });
    } catch (error) {
        console.error("listarEstudiantesCurso:", error);
        res.status(500).json({ ok: false, mensaje: error.message });
    }
};

export const listarResultadosCurso = async (req, res) => {
    try {
        const { id } = req.params;
        const id_usuario = req.usuario.id;

        const curso = await Curso.getById(id);
        if (!curso || curso.id_usuario !== id_usuario) {
            return res.status(404).json({ ok: false, mensaje: "Curso no encontrado." });
        }

        const resultados = await ResultadoCurso.getResultadosPorCurso(id);
        res.json({ ok: true, resultados });
    } catch (error) {
        console.error("listarResultadosCurso:", error);
        res.status(500).json({ ok: false, mensaje: "Error al obtener los resultados." });
    }
};

export const eliminarEstudianteCurso = async (req, res) => {
    try {
        const { id, id_usuario } = req.params;
        const tutor_id = req.usuario.id;

        const curso = await Curso.getById(id);
        if (!curso || curso.id_usuario !== tutor_id) {
            return res.status(404).json({ ok: false, mensaje: "Curso no encontrado." });
        }

        const inscripcion = await Inscripcion.getByUsuarioYCurso(id_usuario, id);
        if (!inscripcion) {
            return res.status(404).json({ ok: false, mensaje: "El estudiante no está inscrito en este curso." });
        }

        await Inscripcion.delete(inscripcion.id_inscripcion);
        res.json({ ok: true, mensaje: "Estudiante eliminado del curso." });
    } catch (error) {
        console.error("eliminarEstudianteCurso:", error);
        res.status(500).json({ ok: false, mensaje: "Error al eliminar al estudiante." });
    }
};

export const historialResultadosEstudiante = async (req, res) => {
    try {
        const { id, id_usuario } = req.params;
        const tutor_id = req.usuario.id;

        const curso = await Curso.getById(id);
        if (!curso || curso.id_usuario !== tutor_id) {
            return res.status(404).json({ ok: false, mensaje: "Curso no encontrado." });
        }

        const [[estudiante]] = await db.query(
            `SELECT u.id_usuario, u.nombre, u.apellido, u.correo_electronico,
                    u.foto_perfil, i.fecha_inscripcion
             FROM Usuario u
             JOIN Inscripcion i ON i.id_usuario = u.id_usuario
             WHERE u.id_usuario = ? AND i.id_curso = ?`,
            [id_usuario, id]
        );

        if (!estudiante) {
            return res.status(404).json({ ok: false, mensaje: "Estudiante no encontrado." });
        }

        const historial = await ResultadoCurso.getHistorialEstudiante(id, id_usuario);
        res.json({ ok: true, estudiante, historial });
    } catch (error) {
        console.error("historialResultadosEstudiante:", error);
        res.status(500).json({ ok: false, mensaje: "Error al obtener el historial." });
    }
};

export const miHistorialResultados = async (req, res) => {
    try {
        const id_usuario = req.usuario.id;
        const { id } = req.query;

        const inscripcion = await Inscripcion.getByUsuarioYCurso(id_usuario, id);
        if (!inscripcion) {
            return res.status(403).json({ ok: false, mensaje: "No estás inscrito." });
        }

        // Obtener datos del propio estudiante
        const [[estudiante]] = await db.query(
            `SELECT u.id_usuario, u.nombre, u.apellido, u.correo_electronico,
                    u.foto_perfil, i.fecha_inscripcion
             FROM Usuario u
             JOIN Inscripcion i ON i.id_usuario = u.id_usuario
             WHERE u.id_usuario = ? AND i.id_curso = ?`,
            [id_usuario, id]
        );

        const historial = await ResultadoCurso.getHistorialEstudiante(id, id_usuario);
        res.json({ ok: true, historial, estudiante: estudiante || null });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: "Error al obtener el historial." });
    }
};

export const obtenerResultadoIntento = async (req, res) => {
    try {
        const id_usuario = req.usuario.id;
        const { id_intento } = req.params;

        const [[intento]] = await db.query(
            `SELECT ic.id_intento, ic.id_inscripcion, ic.numero_intento,
                    i.id_usuario, i.id_curso
             FROM Intento_Curso ic
             JOIN Inscripcion i ON ic.id_inscripcion = i.id_inscripcion
             WHERE ic.id_intento = ?`,
            [id_intento]
        );

        if (!intento) {
            return res.status(404).json({ ok: false, mensaje: "Intento no encontrado." });
        }

        const curso = await Curso.getById(intento.id_curso);
        const esPropioEstudiante = intento.id_usuario === id_usuario;
        const esTutor = curso?.id_usuario === id_usuario;

        if (!esPropioEstudiante && !esTutor) {
            return res.status(403).json({ ok: false, mensaje: "Sin acceso a este intento." });
        }

        const resultado = await ResultadoCurso.getDetalleIntento(id_intento);
        if (!resultado) {
            return res.status(404).json({ ok: false, mensaje: "Resultado no encontrado." });
        }

        // ── Datos del tutor ──
        const [[tutorData]] = await db.query(
            `SELECT u.nombre, u.apellido, u.foto_perfil, u.descripcion, u.correo_electronico
             FROM Usuario u
             WHERE u.id_usuario = ?`,
            [curso.id_usuario]
        );

        const tutor = tutorData ? {
            nombre: `${tutorData.nombre || ""} ${tutorData.apellido || ""}`.trim(),
            foto: tutorData.foto_perfil || null,
            descripcion: tutorData.descripcion || null,
            correo: tutorData.correo_electronico || null,
        } : null;

        // ── Retroalimentación del sistema experto ──
        let retroalimentacion = [];
        try {
            const pythonRes = await axios.post(`${PYTHON_URL}/cursos/evaluar`, {
                porcentaje: resultado.puntaje,
            });
            retroalimentacion = pythonRes.data.retroalimentacion ?? [];
        } catch (errPython) {
            console.error("obtenerResultadoIntento — sistema experto no disponible:", errPython.message);
        }

        res.json({
            ok: true,
            resultado,
            curso: {
                id_curso: intento.id_curso,
                titulo: curso.titulo,
                tutor,
            },
            retroalimentacion,
        });
    } catch (error) {
        console.error("obtenerResultadoIntento:", error);
        res.status(500).json({ ok: false, mensaje: "Error al obtener el resultado del intento." });
    }
};

// para el dashboard del tutor
export const estadisticasTutor = async (req, res) => {
    try {
        const id_usuario = req.usuario.id;

        // ── Conteos básicos + total estudiantes ──
        const [[conteos]] = await db.query(
            `SELECT
                COUNT(*)                                 AS total_cursos,
                SUM(es_publicado = 1 AND archivado = 0)  AS cursos_publicados,
                SUM(archivado = 1)                        AS cursos_archivados,
                (
                    SELECT COUNT(i.id_usuario)
                    FROM Inscripcion i
                    INNER JOIN Curso c ON c.id_curso = i.id_curso
                    WHERE c.id_usuario = ?
                )                                         AS total_estudiantes
             FROM Curso
             WHERE id_usuario = ?`,
            [id_usuario, id_usuario]
        );

        // ── Lista de cursos del tutor (para el filtro del frontend) ──
        const [cursos_tutor] = await db.query(
            `SELECT id_curso, titulo FROM Curso WHERE id_usuario = ? ORDER BY titulo`,
            [id_usuario]
        );

        // ── Cursos y alumnos por perfil VARK ──
        const [vark] = await db.query(
            `SELECT
                p.perfil,
                COUNT(DISTINCT c.id_curso)       AS cursos,
                COUNT(DISTINCT i.id_usuario)     AS estudiantes
            FROM (
                SELECT 'V'    AS perfil, 1  AS orden UNION ALL
                SELECT 'A',              2           UNION ALL
                SELECT 'R',              3           UNION ALL
                SELECT 'K',              4           UNION ALL
                SELECT 'VA',             5           UNION ALL
                SELECT 'VR',             6           UNION ALL
                SELECT 'VK',             7           UNION ALL
                SELECT 'AR',             8           UNION ALL
                SELECT 'AK',             9           UNION ALL
                SELECT 'RK',             10          UNION ALL
                SELECT 'VAR',            11          UNION ALL
                SELECT 'VAK',            12          UNION ALL
                SELECT 'VRK',            13          UNION ALL
                SELECT 'ARK',            14          UNION ALL
                SELECT 'VARK',           15
            ) p
            LEFT JOIN Curso c
                    ON c.perfil_vark = p.perfil AND c.id_usuario = ?
            LEFT JOIN Inscripcion i ON i.id_curso = c.id_curso
            GROUP BY p.perfil, p.orden
            ORDER BY p.orden`,
            [id_usuario]
        );

        // ── Cursos y alumnos por dimensión ──
        const [dimensiones] = await db.query(
            `SELECT
                d.id_dimension,
                d.nombre_dimension,
                d.nombre_dimension AS nombre,
                COUNT(DISTINCT c.id_curso)   AS cursos,
                COUNT(DISTINCT i.id_usuario) AS estudiantes
            FROM Dimension_Evaluar d
            LEFT JOIN Curso c ON c.id_dimension = d.id_dimension AND c.id_usuario = ?
            LEFT JOIN Inscripcion i ON i.id_curso = c.id_curso
            GROUP BY d.id_dimension, d.nombre_dimension
            ORDER BY d.nombre_dimension`,
            [id_usuario]
        );

        // ── Inscripciones por mes (últimos 12 meses) ──
        const [inscripciones_mes] = await db.query(
            `SELECT
                DATE_FORMAT(i.fecha_inscripcion, '%b %Y') AS mes,
                COUNT(*)                                   AS total
             FROM Inscripcion i
             INNER JOIN Curso c ON c.id_curso = i.id_curso
             WHERE c.id_usuario = ?
               AND i.fecha_inscripcion >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
             GROUP BY YEAR(i.fecha_inscripcion), MONTH(i.fecha_inscripcion)
             ORDER BY YEAR(i.fecha_inscripcion), MONTH(i.fecha_inscripcion)`,
            [id_usuario]
        );

        // ── Promedio de alumnos por curso ──
        const [promedios_cursos] = await db.query(
            `SELECT
        c.titulo,
        COUNT(DISTINCT i.id_usuario)          AS estudiantes,
        COALESCE(ROUND(AVG(ultimo.porcentaje), 1), 0) AS promedio
     FROM Curso c
     LEFT JOIN Inscripcion i ON i.id_curso = c.id_curso
     LEFT JOIN (
         SELECT rc.porcentaje, it.id_inscripcion
         FROM Resultado_Curso rc
         JOIN Intento_Curso it ON rc.id_intento = it.id_intento
         WHERE rc.id_resultado = (
             SELECT rc2.id_resultado
             FROM Resultado_Curso rc2
             JOIN Intento_Curso it2 ON rc2.id_intento = it2.id_intento
             WHERE it2.id_inscripcion = it.id_inscripcion
             ORDER BY rc2.id_resultado DESC
             LIMIT 1
         )
     ) ultimo ON ultimo.id_inscripcion = i.id_inscripcion
     WHERE c.id_usuario = ?
     GROUP BY c.id_curso, c.titulo
     ORDER BY promedio DESC`,
            [id_usuario]
        );

        // ── Distribución de niveles — solo el último intento por alumno ──
        const [distribucion_niveles] = await db.query(
            `SELECT rc.nivel, COUNT(*) AS total
             FROM Resultado_Curso rc
             JOIN Intento_Curso ic ON rc.id_intento = ic.id_intento
             JOIN Inscripcion i    ON ic.id_inscripcion = i.id_inscripcion
             JOIN Curso c          ON i.id_curso = c.id_curso
             WHERE c.id_usuario = ?
               AND rc.nivel IS NOT NULL
               AND rc.id_resultado = (
                   SELECT rc2.id_resultado
                   FROM Resultado_Curso rc2
                   JOIN Intento_Curso ic2 ON rc2.id_intento = ic2.id_intento
                   WHERE ic2.id_inscripcion = i.id_inscripcion
                   ORDER BY rc2.id_resultado DESC
                   LIMIT 1
               )
             GROUP BY rc.nivel
             ORDER BY rc.nivel`,
            [id_usuario]
        );

        // ── Tasa de finalización por curso ──
        // ── Tasa de finalización por curso ──
        const [finalizacion_cursos] = await db.query(
            `SELECT
                c.titulo,
                COUNT(DISTINCT i.id_usuario)        AS inscritos,
                COUNT(DISTINCT ultimo.id_usuario)   AS completados,
                ROUND(
                    COUNT(DISTINCT ultimo.id_usuario) * 100.0 /
                    NULLIF(COUNT(DISTINCT i.id_usuario), 0)
                , 1) AS tasa
            FROM Curso c
            LEFT JOIN Inscripcion i ON i.id_curso = c.id_curso
            LEFT JOIN (
                SELECT i2.id_usuario, i2.id_curso
                FROM Inscripcion i2
                INNER JOIN Intento_Curso ic2 ON ic2.id_inscripcion = i2.id_inscripcion
                INNER JOIN Resultado_Curso rc2 ON rc2.id_intento = ic2.id_intento
                WHERE rc2.id_resultado = (
                    SELECT rc3.id_resultado
                    FROM Resultado_Curso rc3
                    INNER JOIN Intento_Curso ic3 ON rc3.id_intento = ic3.id_intento
                    WHERE ic3.id_inscripcion = i2.id_inscripcion
                    ORDER BY rc3.id_resultado DESC
                    LIMIT 1
                )
            ) ultimo ON ultimo.id_usuario = i.id_usuario
                    AND ultimo.id_curso  = c.id_curso
            WHERE c.id_usuario = ?
            GROUP BY c.id_curso, c.titulo
            ORDER BY tasa DESC`,
            [id_usuario]
        );

        // ── Actividad reciente (últimas 10 acciones) ──
        const [actividad_reciente] = await db.query(
            `(SELECT
        'inscripcion' AS tipo,
        CONCAT(u.nombre, ' ', u.apellido) AS actor,
        c.titulo AS recurso,
        i.fecha_inscripcion AS fecha
      FROM Inscripcion i
      JOIN Usuario u ON u.id_usuario = i.id_usuario
      JOIN Curso c   ON c.id_curso   = i.id_curso
      WHERE c.id_usuario = ?)
     UNION ALL
     (SELECT
        'completado' AS tipo,
        CONCAT(u.nombre, ' ', u.apellido) AS actor,
        c.titulo AS recurso,
        ic.fecha_fin AS fecha
      FROM Intento_Curso ic
      JOIN Inscripcion i  ON ic.id_inscripcion = i.id_inscripcion
      JOIN Usuario u      ON u.id_usuario = i.id_usuario
      JOIN Curso c        ON c.id_curso   = i.id_curso
      JOIN Resultado_Curso rc ON rc.id_intento = ic.id_intento
      WHERE c.id_usuario = ?)
     ORDER BY fecha DESC
     LIMIT 10`,
            [id_usuario, id_usuario]
        );

        res.json({
            ok: true,
            total_cursos: Number(conteos.total_cursos) || 0,
            cursos_publicados: Number(conteos.cursos_publicados) || 0,
            cursos_archivados: Number(conteos.cursos_archivados) || 0,
            total_estudiantes: Number(conteos.total_estudiantes) || 0,
            vark,
            dimensiones,
            inscripciones_mes,
            promedios_cursos,
            distribucion_niveles,
            finalizacion_cursos,
            actividad_reciente,
            cursos_tutor,          // ← nuevo: lista para el select del filtro
        });
    } catch (error) {
        console.error("estadisticasTutor:", error);
        res.status(500).json({ ok: false, mensaje: "Error al obtener estadísticas." });
    }
};

// ── Niveles filtrados por curso específico ──────────────────────────────────
export const nivelesPorCurso = async (req, res) => {
    try {
        const id_usuario = req.usuario.id;
        const { id_curso, mes, anio } = req.query;

        if (!id_curso) {
            return res.status(400).json({ ok: false, mensaje: "id_curso es requerido." });
        }

        // Filtro de fecha opcional
        const filtroFecha = (mes && anio)
            ? `AND MONTH(ic.fecha_fin) = ${db.escape(mes)} AND YEAR(ic.fecha_fin) = ${db.escape(anio)}`
            : (anio ? `AND YEAR(ic.fecha_fin) = ${db.escape(anio)}` : "");

        const [distribucion_niveles] = await db.query(
            `SELECT rc.nivel, COUNT(*) AS total
             FROM Resultado_Curso rc
             JOIN Intento_Curso ic ON rc.id_intento = ic.id_intento
             JOIN Inscripcion i    ON ic.id_inscripcion = i.id_inscripcion
             JOIN Curso c          ON i.id_curso = c.id_curso
             WHERE c.id_usuario = ?
               AND (? = 'todos' OR c.id_curso = ?)
               AND rc.nivel IS NOT NULL
               ${filtroFecha}
               AND rc.id_resultado = (
                   SELECT rc2.id_resultado
                   FROM Resultado_Curso rc2
                   JOIN Intento_Curso ic2 ON rc2.id_intento = ic2.id_intento
                   WHERE ic2.id_inscripcion = i.id_inscripcion
                   ORDER BY rc2.id_resultado DESC
                   LIMIT 1
               )
             GROUP BY rc.nivel
             ORDER BY rc.nivel`,
            [id_usuario, id_curso, id_curso]
        );

        res.json({ ok: true, distribucion_niveles });
    } catch (error) {
        console.error("nivelesPorCurso:", error);
        res.status(500).json({ ok: false, mensaje: "Error al filtrar niveles por curso." });
    }
};

export const misCursosConResultados = async (req, res) => {
    try {
        const id_usuario = req.usuario.id;

        const [cursos] = await db.query(
            `SELECT 
                c.id_curso,
                c.titulo,
                c.foto,
                ultimo.porcentaje AS puntaje,
                ultimo.nivel
             FROM Curso c
             JOIN Inscripcion i ON i.id_curso = c.id_curso AND i.id_usuario = ?
             LEFT JOIN (
                 SELECT rc.porcentaje, rc.nivel, ic.id_inscripcion
                 FROM Resultado_Curso rc
                 JOIN Intento_Curso ic ON rc.id_intento = ic.id_intento
                 WHERE rc.id_resultado = (
                     SELECT rc2.id_resultado
                     FROM Resultado_Curso rc2
                     JOIN Intento_Curso ic2 ON rc2.id_intento = ic2.id_intento
                     WHERE ic2.id_inscripcion = ic.id_inscripcion
                     ORDER BY rc2.id_resultado DESC
                     LIMIT 1
                 )
             ) ultimo ON ultimo.id_inscripcion = i.id_inscripcion
             WHERE c.es_publicado = 1
             ORDER BY c.titulo`,
            [id_usuario]
        );

        res.json({ ok: true, cursos });
    } catch (error) {
        console.error("misCursosConResultados:", error);
        res.status(500).json({ ok: false, mensaje: "Error al obtener cursos." });
    }
};

export const inscripcionesFiltradas = async (req, res) => {
    try {
        const id_usuario = req.usuario.id;
        const { id_curso, perfil_vark, id_dimension, mes, anio } = req.query;

        let where = "c.id_usuario = ?";
        const params = [id_usuario];

        if (id_curso && id_curso !== "todos") {
            where += " AND c.id_curso = ?";
            params.push(id_curso);
        }
        if (perfil_vark && perfil_vark !== "todos") {
            where += " AND c.perfil_vark = ?";
            params.push(perfil_vark);
        }
        if (id_dimension && id_dimension !== "todos") {
            where += " AND c.id_dimension = ?";
            params.push(id_dimension);
        }
        if (anio && anio !== "todos") {
            where += " AND YEAR(i.fecha_inscripcion) = ?";
            params.push(anio);
        }
        if (mes && mes !== "todos" && anio && anio !== "todos") {
            where += " AND MONTH(i.fecha_inscripcion) = ?";
            params.push(mes);
        }

        const [[{ total }]] = await db.query(
            `SELECT COUNT(i.id_inscripcion) AS total
             FROM Curso c
             LEFT JOIN Inscripcion i ON i.id_curso = c.id_curso
             WHERE ${where}`,
            params
        );

        res.json({ ok: true, total: Number(total) });
    } catch (error) {
        console.error("inscripcionesFiltradas:", error);
        res.status(500).json({ ok: false, mensaje: "Error al obtener inscripciones." });
    }
};

export const obtenerRespuestasIntento = async (req, res) => {
    try {
        const id_usuario = req.usuario.id;
        const { id_curso } = req.query;

        const inscripcion = await Inscripcion.getByUsuarioYCurso(id_usuario, id_curso);
        if (!inscripcion) {
            return res.status(403).json({ ok: false, mensaje: "No estás inscrito." });
        }

        const intento = await IntentoCurso.getUltimoPorInscripcion(inscripcion.id_inscripcion);
        if (!intento || intento.completado) {
            // No hay intento activo sin completar
            return res.json({ ok: true, respuestas: [], intento_completado: !!intento?.completado });
        }

        const [respuestas] = await db.query(
            `SELECT rtc.id_test, rtc.id_opcion, rtc.es_correcta,
                    pt.id_seccion
             FROM Respuesta_Test_Curso rtc
             JOIN Pregunta_Test pt ON pt.id_test = rtc.id_test
             WHERE rtc.id_intento = ?`,
            [intento.id_intento]
        );

        res.json({ ok: true, respuestas, intento_completado: false });
    } catch (error) {
        console.error("obtenerRespuestasIntento:", error);
        res.status(500).json({ ok: false, mensaje: "Error al obtener respuestas." });
    }
};