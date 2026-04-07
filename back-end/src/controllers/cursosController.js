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

/**
 * Devuelve true si el curso con ese id está archivado.
 * Se usa como guard en todas las operaciones de escritura.
 */
const cursoEstaArchivado = async (id_curso) => {
    const [[row]] = await db.query(
        "SELECT archivado FROM Curso WHERE id_curso = ?",
        [id_curso]
    );
    return Boolean(row?.archivado);
};

/**
 * Resuelve el id_curso a partir de una sección.
 */
const idCursoDesdeSEccion = async (id_seccion) => {
    const [[row]] = await db.query(
        "SELECT id_curso FROM Seccion_Curso WHERE id_seccion = ?",
        [id_seccion]
    );
    return row?.id_curso ?? null;
};

/**
 * Resuelve el id_curso a partir de un contenido.
 */
const idCursoDesdeContenido = async (id_contenido) => {
    const [[row]] = await db.query(
        `SELECT sc.id_curso
         FROM Contenido c
         JOIN Seccion_Curso sc ON c.id_seccion = sc.id_seccion
         WHERE c.id_contenido = ?`,
        [id_contenido]
    );
    return row?.id_curso ?? null;
};

/**
 * Resuelve el id_curso a partir de una pregunta de test.
 */
const idCursoDesdePregunta = async (id_test) => {
    const [[row]] = await db.query(
        `SELECT sc.id_curso
         FROM Pregunta_Test pt
         JOIN Seccion_Curso sc ON pt.id_seccion = sc.id_seccion
         WHERE pt.id_test = ?`,
        [id_test]
    );
    return row?.id_curso ?? null;
};

// ─────────────────────────────────────────────────────────────
// CURSOS
// ─────────────────────────────────────────────────────────────

export const listarCursos = async (req, res) => {
    try {
        const id_usuario = req.usuario.id;
        const [rows] = await db.query(
            `SELECT
                c.id_curso, c.titulo, c.descripcion, c.foto,
                c.perfil_vark, c.es_publicado, c.archivado,
                c.fecha_creacion, c.fecha_actualizacion,
                d.nombre_dimension,
                (SELECT COUNT(*) FROM Seccion_Curso sc WHERE sc.id_curso = c.id_curso) AS total_secciones,
                (SELECT COUNT(*) FROM Inscripcion i WHERE i.id_curso = c.id_curso) AS total_estudiantes
             FROM Curso c
             LEFT JOIN Dimension_Evaluar d ON c.id_dimension = d.id_dimension
             WHERE c.id_usuario = ?
             ORDER BY c.fecha_creacion DESC`,
            [id_usuario]
        );
        res.json({ ok: true, cursos: rows });
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
        if (!curso || curso.id_usuario !== id_usuario)
            return res.status(404).json({ ok: false, mensaje: "Curso no encontrado." });

        const [secciones, todosContenidos, todasPreguntas] = await Promise.all([
            SeccionCurso.getByCurso(id),
            Contenido.getByCurso(id),
            PreguntaTest.getByCursoConOpciones(id),
        ]);

        for (const seccion of secciones) {
            seccion.contenidos = todosContenidos.filter(c => c.id_seccion === seccion.id_seccion);
            seccion.preguntas = todasPreguntas.filter(p => p.id_seccion === seccion.id_seccion);
        }

        const [[{ total_estudiantes }]] = await db.query(
            "SELECT COUNT(*) AS total_estudiantes FROM Inscripcion WHERE id_curso = ?",
            [id]
        );
        curso.total_estudiantes = total_estudiantes;
        curso.secciones = secciones;

        res.json({ ok: true, curso });
    } catch (error) {
        console.error("obtenerCurso:", error);
        res.status(500).json({ ok: false, mensaje: "Error al obtener el curso." });
    }
};

export const crearCurso = async (req, res) => {
    try {
        const id_usuario = req.usuario.id;
        const { titulo, descripcion, perfil_vark, id_dimension } = req.body;

        if (!titulo?.trim())
            return res.status(400).json({ ok: false, mensaje: "El título es obligatorio." });
        if (titulo.trim().length > 200)
            return res.status(400).json({ ok: false, mensaje: "El título no puede superar los 200 caracteres." });
        if (titulo.trim().length < 5)
            return res.status(400).json({ ok: false, mensaje: "El título debe tener al menos 5 caracteres." });
        if (descripcion && descripcion.trim().length > 500)
            return res.status(400).json({ ok: false, mensaje: "La descripción no puede superar los 500 caracteres." });
        if (!perfil_vark)
            return res.status(400).json({ ok: false, mensaje: "El perfil VARK es obligatorio." });

        const [existing] = await db.query(
            "SELECT id_curso FROM Curso WHERE titulo = ? AND id_usuario = ?",
            [titulo.trim(), id_usuario]
        );
        if (existing.length > 0)
            return res.status(409).json({ ok: false, mensaje: "Ya tienes un curso con ese título." });

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
        if (!curso || curso.id_usuario !== id_usuario)
            return res.status(404).json({ ok: false, mensaje: "Curso no encontrado." });


        if (titulo !== undefined && !titulo.trim())
            return res.status(400).json({ ok: false, mensaje: "El título no puede estar vacío." });
        if (titulo !== undefined && titulo.trim().length > 200)
            return res.status(400).json({ ok: false, mensaje: "El título no puede superar los 200 caracteres." });
        if (titulo !== undefined && titulo.trim().length < 5)
            return res.status(400).json({ ok: false, mensaje: "El título debe tener al menos 5 caracteres." });
        if (descripcion !== undefined && descripcion && descripcion.trim().length > 500)
            return res.status(400).json({ ok: false, mensaje: "La descripción no puede superar los 500 caracteres." });
        if (perfil_vark !== undefined && !perfil_vark)
            return res.status(400).json({ ok: false, mensaje: "El perfil VARK es obligatorio." });

        if (titulo !== undefined) {
            const [existing] = await db.query(
                "SELECT id_curso FROM Curso WHERE titulo = ? AND id_usuario = ? AND id_curso != ?",
                [titulo.trim(), id_usuario, id]
            );
            if (existing.length > 0)
                return res.status(409).json({ ok: false, mensaje: "Ya tienes un curso con ese título." });
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

        if (Object.keys(campos).length === 0)
            return res.status(400).json({ ok: false, mensaje: "No hay campos para actualizar." });

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
        if (!curso || curso.id_usuario !== id_usuario)
            return res.status(404).json({ ok: false, mensaje: "Curso no encontrado." });

        // ── BLOQUEO: no se puede publicar un curso archivado ──
        if (curso.archivado)
            return res.status(403).json({ ok: false, mensaje: "No puedes publicar un curso archivado. Desarchívalo primero." });

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
        if (!curso || curso.id_usuario !== id_usuario)
            return res.status(404).json({ ok: false, mensaje: "Curso no encontrado." });

        // Permitir eliminar aunque esté archivado (acción permitida para el tutor)
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
        if (!curso || curso.id_usuario !== id_usuario)
            return res.status(404).json({ ok: false, mensaje: "Curso no encontrado." });

        const nuevo_estado = !curso.archivado;
        const campos = { archivado: nuevo_estado };

        if (nuevo_estado) {
            // Archivando: guardar si estaba publicado y despublicar
            campos.era_publicado = curso.es_publicado ? 1 : 0;
            campos.es_publicado = false;
        } else {
            // Desarchivando: restaurar publicación si era_publicado=1
            if (curso.era_publicado) {
                campos.es_publicado = true;
            }
            campos.era_publicado = 0; // limpiar el flag
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
        const { id } = req.params; // id_curso
        const id_usuario = req.usuario.id;
        const { titulo_seccion, descripcion_seccion, orden } = req.body;

        if (!titulo_seccion?.trim())
            return res.status(400).json({ ok: false, mensaje: "El título de la sección es obligatorio." });

        const curso = await Curso.getById(id);
        if (!curso || curso.id_usuario !== id_usuario)
            return res.status(404).json({ ok: false, mensaje: "Curso no encontrado." });

        let ordenFinal = orden;
        if (!ordenFinal) {
            const secciones = await SeccionCurso.getByCurso(id);
            ordenFinal = secciones.length > 0
                ? Math.max(...secciones.map((s) => s.orden)) + 1
                : 1;
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
        const { id } = req.params; // id_seccion
        const { titulo_seccion, descripcion_seccion, orden } = req.body;

        // ── BLOQUEO ───────────────────────────────────────────
        const id_curso = await idCursoDesdeSEccion(id);

        if (titulo_seccion !== undefined && !titulo_seccion.trim())
            return res.status(400).json({ ok: false, mensaje: "El título de la sección no puede estar vacío." });

        const campos = {};
        if (titulo_seccion !== undefined) campos.titulo_seccion = titulo_seccion.trim();
        if (descripcion_seccion !== undefined) campos.descripcion_seccion = descripcion_seccion?.trim() || null;
        if (orden !== undefined) campos.orden = orden;

        if (Object.keys(campos).length === 0)
            return res.status(400).json({ ok: false, mensaje: "No hay campos para actualizar." });

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

        // ── BLOQUEO ───────────────────────────────────────────
        const id_curso = await idCursoDesdeSEccion(id);

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

        // ── BLOQUEO ───────────────────────────────────────────
        const id_curso = await idCursoDesdeSEccion(id);

        let ordenFinal = orden;
        if (!ordenFinal) {
            const contenidos = await Contenido.getBySeccion(id);
            ordenFinal = contenidos.length > 0
                ? Math.max(...contenidos.map((c) => c.orden)) + 1
                : 1;
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
        res.status(201).json({ ok: true, id_contenido: result.insertId, orden: ordenFinal });
    } catch (error) {
        console.error("crearContenido:", error);
        res.status(500).json({ ok: false, mensaje: "Error al crear el contenido." });
    }
};

export const actualizarContenido = async (req, res) => {
    try {
        const { id } = req.params; // id_contenido
        const { titulo, contenido, orden, eliminar_imagen } = req.body;

        // ── BLOQUEO ───────────────────────────────────────────
        const id_curso = await idCursoDesdeContenido(id);

        const campos = {};
        if (titulo !== undefined) campos.titulo = titulo.trim();
        if (contenido !== undefined) campos.contenido = contenido?.trim() || null;
        if (orden !== undefined) campos.orden = orden;

        if (req.file) {
            campos.imagen_url = await subirImagenCloudinary(req.file.buffer, "cursos/contenidos");
        } else if (eliminar_imagen === "true" || eliminar_imagen === true) {
            campos.imagen_url = null;
        }

        if (Object.keys(campos).length === 0)
            return res.status(400).json({ ok: false, mensaje: "No hay campos para actualizar." });

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

        // ── BLOQUEO ───────────────────────────────────────────
        const id_curso = await idCursoDesdeContenido(id);

        await Contenido.delete(id);
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
        const { id } = req.params; // id_seccion
        const { texto_pregunta, opciones = [] } = req.body;

        // ── BLOQUEO ───────────────────────────────────────────
        const id_curso = await idCursoDesdeSEccion(id);

        // ── NUEVO BLOQUEO ─────────────────────────────────────
        // Si la sección ya tiene preguntas Y el curso tiene inscritos,
        // no se permite agregar más preguntas al cuestionario existente.
        if (id_curso) {
            const [[{ preguntasExistentes }]] = await db.query(
                "SELECT COUNT(*) AS preguntasExistentes FROM Pregunta_Test WHERE id_seccion = ?",
                [id]
            );
            if (preguntasExistentes > 0) {
                const [[{ total }]] = await db.query(
                    "SELECT COUNT(*) AS total FROM Inscripcion WHERE id_curso = ?",
                    [id_curso]
                );
                if (total > 0)
                    return res.status(403).json({
                        ok: false,
                        mensaje: "No puedes agregar preguntas a un cuestionario existente si el curso ya tiene estudiantes inscritos.",
                    });
            }
        }

        if (!texto_pregunta?.trim())
            return res.status(400).json({ ok: false, mensaje: "El texto de la pregunta es obligatorio." });
        if (opciones.length < 2)
            return res.status(400).json({ ok: false, mensaje: "Debe haber al menos 2 opciones." });
        if (opciones.some((o) => !o.texto_opcion?.trim()))
            return res.status(400).json({ ok: false, mensaje: "Todas las opciones deben tener texto." });
        if (!opciones.some((o) => o.es_correcta))
            return res.status(400).json({ ok: false, mensaje: "Debe marcarse al menos una opción correcta." });

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
        const { id } = req.params; // id_test

        // ── BLOQUEO: archivado o con inscritos ────────────────
        const id_curso = await idCursoDesdePregunta(id);

        if (id_curso) {
            const [[{ total }]] = await db.query(
                "SELECT COUNT(*) AS total FROM Inscripcion WHERE id_curso = ?",
                [id_curso]
            );
            if (total > 0)
                return res.status(403).json({
                    ok: false,
                    mensaje: "No puedes modificar el cuestionario de un curso con estudiantes inscritos.",
                });
        }

        const { texto_pregunta, opciones = [] } = req.body;

        if (texto_pregunta !== undefined && !texto_pregunta.trim())
            return res.status(400).json({ ok: false, mensaje: "El texto de la pregunta no puede estar vacío." });
        if (opciones.length > 0) {
            if (opciones.length < 2)
                return res.status(400).json({ ok: false, mensaje: "Debe haber al menos 2 opciones." });
            if (opciones.some((o) => !o.texto_opcion?.trim()))
                return res.status(400).json({ ok: false, mensaje: "Todas las opciones deben tener texto." });
            if (!opciones.some((o) => o.es_correcta))
                return res.status(400).json({ ok: false, mensaje: "Debe marcarse al menos una opción correcta." });
        }

        if (texto_pregunta)
            await PreguntaTest.update(id, { texto_pregunta: texto_pregunta.trim() });

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
        const { id } = req.params; // id_test

        // ── BLOQUEO: archivado o con inscritos ────────────────
        const id_curso = await idCursoDesdePregunta(id);

        if (id_curso) {
            const [[{ total }]] = await db.query(
                "SELECT COUNT(*) AS total FROM Inscripcion WHERE id_curso = ?",
                [id_curso]
            );
            if (total > 0)
                return res.status(403).json({
                    ok: false,
                    mensaje: "No puedes modificar el cuestionario de un curso con estudiantes inscritos.",
                });
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
        const { id } = req.params; // id_seccion

        // ── BLOQUEO ───────────────────────────────────────────
        const id_curso = await idCursoDesdeSEccion(id);

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

        if (!perfil)
            return res.status(400).json({ ok: false, mensaje: "El perfil VARK es requerido." });

        const letras = perfil.toUpperCase().split("").filter(l => ["V", "A", "R", "K"].includes(l));
        if (letras.length === 0)
            return res.status(400).json({ ok: false, mensaje: "Perfil VARK inválido." });

        const placeholders = letras.map(() => "perfil_vark LIKE ?").join(" OR ");
        const likeParams = letras.map(l => `%${l}%`);

        const [rows] = await db.query(
            `SELECT
                c.id_curso, c.titulo, c.descripcion, c.foto,
                c.perfil_vark, c.fecha_creacion,
                d.nombre_dimension,
                u.nombre AS nombre_tutor,
                (SELECT COUNT(*) FROM Seccion_Curso sc WHERE sc.id_curso = c.id_curso) AS total_secciones
             FROM Curso c
             LEFT JOIN Dimension_Evaluar d ON c.id_dimension = d.id_dimension
             LEFT JOIN Usuario u ON c.id_usuario = u.id_usuario
             WHERE c.es_publicado = 1
               AND c.archivado   = 0
               AND c.id_usuario  != ?
               AND (${placeholders})
             ORDER BY
               CASE WHEN c.perfil_vark = ? THEN 0 ELSE 1 END,
               c.fecha_creacion DESC
             LIMIT 20`,
            [id_usuario, ...likeParams, perfil.toUpperCase()]
        );

        res.json({ ok: true, cursos: rows });
    } catch (error) {
        console.error("listarCursosRecomendados:", error);
        res.status(500).json({ ok: false, mensaje: "Error al obtener cursos recomendados." });
    }
};

export const listarCursosPorDimension = async (req, res) => {
    try {
        const { perfil, dimensiones } = req.query;

        if (!perfil)
            return res.status(400).json({ ok: false, mensaje: "El perfil VARK es requerido." });

        const letras = perfil.toUpperCase().split("").filter(l => ["V", "A", "R", "K"].includes(l));
        if (letras.length === 0)
            return res.status(400).json({ ok: false, mensaje: "Perfil VARK inválido." });

        let dimFilter = "";
        let dimParams = [];
        if (dimensiones) {
            const ids = dimensiones.split(",").map(Number).filter(Boolean);
            if (ids.length > 0) {
                dimFilter = `AND c.id_dimension IN (${ids.map(() => "?").join(",")})`;
                dimParams = ids;
            }
        }

        const [rows] = await db.query(
            `SELECT
                c.id_curso, c.titulo, c.descripcion, c.foto,
                c.perfil_vark, c.fecha_creacion,
                d.nombre_dimension, d.id_dimension,
                CONCAT(u.nombre, ' ', u.apellido) AS nombre_tutor,
                (SELECT COUNT(*) FROM Seccion_Curso sc WHERE sc.id_curso = c.id_curso) AS total_secciones
             FROM Curso c
             LEFT JOIN Dimension_Evaluar d ON c.id_dimension = d.id_dimension
             LEFT JOIN Usuario u ON c.id_usuario = u.id_usuario
             WHERE c.es_publicado = 1
               AND c.archivado   = 0
               AND c.perfil_vark = ?
               ${dimFilter}
             ORDER BY c.fecha_creacion DESC
             LIMIT 12`,
            [perfil.toUpperCase(), ...dimParams]
        );

        res.json({ ok: true, cursos: rows });
    } catch (error) {
        console.error("listarCursosPorDimension:", error);
        res.status(500).json({ ok: false, mensaje: "Error al obtener cursos recomendados." });
    }
};

// ─────────────────────────────────────────────────────────────
// INSCRIPCIONES + PROGRESO
// ─────────────────────────────────────────────────────────────

// DESPUÉS
export const misCursos = async (req, res) => {
    try {
        const id_usuario = req.usuario.id;

        const [rows] = await db.query(
            `SELECT
                c.id_curso, c.titulo, c.descripcion, c.foto,
                c.perfil_vark, c.archivado,
                d.nombre_dimension,
                CONCAT(u.nombre, ' ', u.apellido) AS nombre_tutor,
                (SELECT COUNT(*) FROM Seccion_Curso sc WHERE sc.id_curso = c.id_curso) AS total_secciones,
                i.fecha_inscripcion,
                -- progreso del último intento
                COALESCE(
                    (SELECT COUNT(*) FROM Progreso p
                     JOIN Intento_Curso it2 ON p.id_intento = it2.id_intento
                     WHERE it2.id_inscripcion = i.id_inscripcion
                       AND p.visto = 1
                     ORDER BY it2.fecha_inicio DESC LIMIT 1),
                    0
                ) AS contenidos_vistos,
                (SELECT COUNT(*) FROM Contenido co
                 JOIN Seccion_Curso sc2 ON co.id_seccion = sc2.id_seccion
                 WHERE sc2.id_curso = c.id_curso) AS total_contenidos,
                COALESCE(
                    (SELECT it3.completado FROM Intento_Curso it3
                     WHERE it3.id_inscripcion = i.id_inscripcion
                     ORDER BY it3.fecha_inicio DESC LIMIT 1),
                    0
                ) AS completado
             FROM Inscripcion i
             JOIN Curso c ON i.id_curso = c.id_curso
             LEFT JOIN Dimension_Evaluar d ON c.id_dimension = d.id_dimension
             LEFT JOIN Usuario u ON c.id_usuario = u.id_usuario
             WHERE i.id_usuario = ?
               AND c.archivado = 0          -- ← activos para el estudiante
             ORDER BY i.fecha_inscripcion DESC`,
            [id_usuario]
        );

        // Cursos que el tutor archivó mientras el estudiante estaba inscrito
        const [archivados] = await db.query(
            `SELECT
                c.id_curso, c.titulo, c.descripcion, c.foto,
                c.perfil_vark, c.archivado,
                d.nombre_dimension,
                CONCAT(u.nombre, ' ', u.apellido) AS nombre_tutor,
                i.fecha_inscripcion,
                COALESCE(
                    (SELECT COUNT(*) FROM Progreso p
                     JOIN Intento_Curso it2 ON p.id_intento = it2.id_intento
                     WHERE it2.id_inscripcion = i.id_inscripcion
                       AND p.visto = 1),
                    0
                ) AS contenidos_vistos,
                (SELECT COUNT(*) FROM Contenido co
                 JOIN Seccion_Curso sc2 ON co.id_seccion = sc2.id_seccion
                 WHERE sc2.id_curso = c.id_curso) AS total_contenidos,
                COALESCE(
                    (SELECT it3.completado FROM Intento_Curso it3
                     WHERE it3.id_inscripcion = i.id_inscripcion
                     ORDER BY it3.fecha_inicio DESC LIMIT 1),
                    0
                ) AS completado
             FROM Inscripcion i
             JOIN Curso c ON i.id_curso = c.id_curso
             LEFT JOIN Dimension_Evaluar d ON c.id_dimension = d.id_dimension
             LEFT JOIN Usuario u ON c.id_usuario = u.id_usuario
             WHERE i.id_usuario = ?
               AND c.archivado = 1          -- ← archivados por el tutor
             ORDER BY i.fecha_inscripcion DESC`,
            [id_usuario]
        );

        res.json({ ok: true, cursos: rows, archivados });
    } catch (error) {
        console.error("misCursos:", error);
        res.status(500).json({ ok: false, mensaje: "Error al obtener tus cursos." });
    }
};

export const obtenerCursoEstudiante = async (req, res) => {
    try {
        const { id } = req.query;
        const id_usuario = req.usuario.id;

        const [rows] = await db.query(
            `SELECT
                c.*,
                d.nombre_dimension,
                u.nombre        AS nombre_tutor,
                u.apellido      AS apellido_tutor,
                u.foto_perfil   AS foto_tutor,
                u.descripcion   AS descripcion_tutor,
                u.correo_electronico AS correo_tutor,
                u.telefono      AS telefono_tutor
             FROM Curso c
             LEFT JOIN Dimension_Evaluar d ON c.id_dimension = d.id_dimension
             LEFT JOIN Usuario u ON c.id_usuario = u.id_usuario
             WHERE c.id_curso = ?`,
            [id]
        );

        const curso = rows[0];
        if (!curso)
            return res.status(404).json({ ok: false, mensaje: "Curso no encontrado." });

        const secciones = await SeccionCurso.getByCurso(id);
        for (const seccion of secciones) {
            seccion.contenidos = await Contenido.getBySeccion(seccion.id_seccion);
            seccion.preguntas = await PreguntaTest.getBySeccionConOpciones(seccion.id_seccion);
        }

        curso.tutor = {
            nombre: `${curso.nombre_tutor} ${curso.apellido_tutor}`.trim(),
            foto: curso.foto_tutor || null,
            descripcion: curso.descripcion_tutor || null,
            correo: curso.correo_tutor || null,
            telefono: curso.telefono_tutor || null,
        };
        curso.secciones = secciones;

        const inscripcion = await Inscripcion.getByUsuarioYCurso(id_usuario, id);
        const inscrito = !!inscripcion;

        let progreso = null;
        if (inscrito) {
            const intento = await IntentoCurso.getUltimoPorInscripcion(inscripcion.id_inscripcion);
            const total = secciones.reduce((a, s) => a + (s.contenidos?.length || 0), 0);

            if (intento) {
                const progresoRows = await Progreso.getByIntento(intento.id_intento);
                const vistos = progresoRows.filter(p => p.visto).length;
                const pct = total > 0 ? Math.round((vistos / total) * 100) : 0;
                progreso = {
                    id_intento: intento.id_intento,
                    total,
                    vistos,
                    porcentaje: pct,
                    completado: intento.completado,
                    contenidos_vistos: progresoRows.filter(p => p.visto).map(p => p.id_contenido),
                };
            } else {
                progreso = { total, vistos: 0, porcentaje: 0, completado: false, contenidos_vistos: [] };
            }
        }

        res.json({ ok: true, curso, inscrito, progreso });
    } catch (error) {
        console.error("obtenerCursoEstudiante:", error);
        res.status(500).json({ ok: false, mensaje: "Error al obtener el curso." });
    }
};

export const inscribirseACurso = async (req, res) => {
    try {
        const id_usuario = req.usuario.id;
        const { id_curso } = req.body;

        if (!id_curso)
            return res.status(400).json({ ok: false, mensaje: "El id_curso es requerido." });

        const curso = await Curso.getById(id_curso);
        if (!curso || !curso.es_publicado || curso.archivado)
            return res.status(404).json({ ok: false, mensaje: "Curso no disponible." });

        const yaInscrito = await Inscripcion.getByUsuarioYCurso(id_usuario, id_curso);
        if (yaInscrito)
            return res.status(400).json({ ok: false, mensaje: "Ya estás inscrito en este curso." });

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

        if (!id_curso)
            return res.status(400).json({ ok: false, mensaje: "El id_curso es requerido." });

        const inscripcion = await Inscripcion.getByUsuarioYCurso(id_usuario, id_curso);
        if (!inscripcion)
            return res.status(404).json({ ok: false, mensaje: "No estás inscrito en este curso." });

        await Inscripcion.delete(inscripcion.id_inscripcion);
        res.json({ ok: true, mensaje: "Inscripción cancelada." });
    } catch (error) {
        console.error("cancelarInscripcion:", error);
        res.status(500).json({ ok: false, mensaje: "Error al cancelar la inscripción." });
    }
};

export const iniciarIntento = async (req, res) => {
    console.log(">>> iniciarIntento llamado", req.body);
    try {
        const id_usuario = req.usuario.id;
        const { id_curso } = req.body;

        const inscripcion = await Inscripcion.getByUsuarioYCurso(id_usuario, id_curso);
        if (!inscripcion)
            return res.status(403).json({ ok: false, mensaje: "No estás inscrito en este curso." });

        // ── BLOQUEO: no iniciar intento en curso archivado ────
        const curso = await Curso.getById(id_curso);
        if (curso?.archivado)
            return res.status(403).json({ ok: false, mensaje: "Este curso está archivado y no puede realizarse." });

        const intentos = await IntentoCurso.getByInscripcion(inscripcion.id_inscripcion);
        const numero_intento = intentos.length + 1;

        const intento = new IntentoCurso({ numero_intento, id_inscripcion: inscripcion.id_inscripcion });
        const [result] = await intento.save();

        res.status(201).json({ ok: true, id_intento: result.insertId, numero_intento });
    } catch (error) {
        console.error("iniciarIntento ERROR:", error);
        res.status(500).json({ ok: false, mensaje: "Error al iniciar el intento." });
    }
};

export const marcarContenidoVisto = async (req, res) => {
    console.log(">>> marcarContenidoVisto llamado", req.params, req.body);
    try {
        const { id_contenido } = req.params;
        const id_usuario = req.usuario.id;
        const { id_curso } = req.body;

        const inscripcion = await Inscripcion.getByUsuarioYCurso(id_usuario, id_curso);
        if (!inscripcion)
            return res.status(403).json({ ok: false, mensaje: "No estás inscrito." });

        // ── BLOQUEO: no registrar progreso en curso archivado ─
        const curso = await Curso.getById(id_curso);
        if (curso?.archivado)
            return res.status(403).json({ ok: false, mensaje: "Este curso está archivado." });

        const intento = await IntentoCurso.getUltimoPorInscripcion(inscripcion.id_inscripcion);
        if (!intento)
            return res.status(404).json({ ok: false, mensaje: "No hay intento activo." });

        await Progreso.marcarVisto(intento.id_intento, id_contenido);

        const pct = await Progreso.getPorcentajeCompletado(intento.id_intento, id_curso);

        if (pct === 100 && !intento.completado)
            await IntentoCurso.completar(intento.id_intento);

        res.json({ ok: true, porcentaje: pct, completado: pct === 100 });
    } catch (error) {
        console.error("marcarContenidoVisto ERROR:", error);
        res.status(500).json({ ok: false, mensaje: "Error al marcar contenido." });
    }
};

export const guardarRespuestasTest = async (req, res) => {
    try {
        const id_usuario = req.usuario.id;
        const { id_curso, respuestas } = req.body;

        if (!id_curso || !respuestas?.length)
            return res.status(400).json({ ok: false, mensaje: "Datos incompletos." });

        const inscripcion = await Inscripcion.getByUsuarioYCurso(id_usuario, id_curso);
        if (!inscripcion)
            return res.status(403).json({ ok: false, mensaje: "No estás inscrito." });

        // ── BLOQUEO: no guardar respuestas en curso archivado ─
        const curso = await Curso.getById(id_curso);
        if (curso?.archivado)
            return res.status(403).json({ ok: false, mensaje: "Este curso está archivado." });

        const intento = await IntentoCurso.getUltimoPorInscripcion(inscripcion.id_inscripcion);
        if (!intento)
            return res.status(404).json({ ok: false, mensaje: "No hay intento activo." });

        await db.query("DELETE FROM Respuesta_Test_Curso WHERE id_intento = ?", [intento.id_intento]);

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

        await RespuestaTestCurso.saveMany(intento.id_intento, filas);

        const total = respuestas.length;
        const porcentaje = total > 0 ? parseFloat(((correctas / total) * 100).toFixed(2)) : 0;

        const resultado = new ResultadoCurso({
            total_preguntas: total,
            respuestas_correctas: correctas,
            porcentaje,
            id_intento: intento.id_intento,
        });
        await resultado.save();

        res.json({ ok: true, correctas, total, porcentaje });
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
        if (!inscripcion)
            return res.status(403).json({ ok: false, mensaje: "No estás inscrito." });

        const intento = await IntentoCurso.getUltimoPorInscripcion(inscripcion.id_inscripcion);
        if (!intento)
            return res.status(404).json({ ok: false, mensaje: "No hay intento." });

        const resultado = await ResultadoCurso.getByIntento(intento.id_intento);
        res.json({ ok: true, resultado: resultado || null });
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
        if (!curso || curso.id_usuario !== id_usuario)
            return res.status(404).json({ ok: false, mensaje: "Curso no encontrado." });

        const [rows] = await db.query(
            `SELECT
                u.id_usuario, u.nombre, u.apellido,
                u.correo_electronico, u.telefono, u.foto_perfil,
                i.fecha_inscripcion
             FROM Inscripcion i
             INNER JOIN Usuario u ON i.id_usuario = u.id_usuario
             WHERE i.id_curso = ?
             ORDER BY i.fecha_inscripcion DESC`,
            [id]
        );

        res.json({ ok: true, estudiantes: rows });
    } catch (error) {
        console.error("listarEstudiantesCurso ERROR:", error);
        res.status(500).json({ ok: false, mensaje: error.message });
    }
};

export const listarResultadosCurso = async (req, res) => {
    try {
        const { id } = req.params;
        const id_usuario = req.usuario.id;

        const curso = await Curso.getById(id);
        if (!curso || curso.id_usuario !== id_usuario)
            return res.status(404).json({ ok: false, mensaje: "Curso no encontrado." });

        const [rows] = await db.query(
            `SELECT
                u.nombre, u.apellido, u.foto_perfil,
                rc.total_preguntas, rc.respuestas_correctas,
                rc.porcentaje AS puntaje,
                CASE
                    WHEN rc.porcentaje >= 90 THEN 'excelente'
                    WHEN rc.porcentaje >= 80 THEN 'muy-bueno'
                    WHEN rc.porcentaje >= 70 THEN 'bueno'
                    WHEN rc.porcentaje >= 50 THEN 'regular'
                    ELSE 'deficiente'
                END AS nivel,
                it.fecha_inicio AS fecha
             FROM Resultado_Curso rc
             JOIN Intento_Curso it ON rc.id_intento = it.id_intento
             JOIN Inscripcion i ON it.id_inscripcion = i.id_inscripcion
             JOIN Usuario u ON i.id_usuario = u.id_usuario
             WHERE i.id_curso = ?
             ORDER BY rc.porcentaje DESC`,
            [id]
        );

        res.json({ ok: true, resultados: rows });
    } catch (error) {
        console.error("listarResultadosCurso:", error);
        res.status(500).json({ ok: false, mensaje: "Error al obtener los resultados." });
    }
};