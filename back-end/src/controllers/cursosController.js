import { Curso } from "../models/Curso.js";
import { SeccionCurso } from "../models/SeccionCurso.js";
import { Contenido } from "../models/Contenido.js";
import { PreguntaTest } from "../models/PreguntaTest.js";
import { OpcionTest } from "../models/OpcionTest.js";
import { db } from "../config/db.js";
import cloudinary from "../config/cloudinary.js";

// ─────────────────────────────────────────────────────────────
// Helper
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
                d.nombre_dimension
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

        const secciones = await SeccionCurso.getByCurso(id);
        for (const seccion of secciones) {
            seccion.contenidos = await Contenido.getBySeccion(seccion.id_seccion);
            seccion.preguntas = await PreguntaTest.getBySeccionConOpciones(seccion.id_seccion);
        }

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

        // ── Validaciones (espejo del paso 1 del frontend) ──
        if (!titulo?.trim())
            return res.status(400).json({ ok: false, mensaje: "El título es obligatorio." });
        if (!perfil_vark)
            return res.status(400).json({ ok: false, mensaje: "El perfil VARK es obligatorio." });

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
        const { titulo, descripcion, perfil_vark, id_dimension } = req.body;

        const curso = await Curso.getById(id);
        if (!curso || curso.id_usuario !== id_usuario)
            return res.status(404).json({ ok: false, mensaje: "Curso no encontrado." });

        // ── Validaciones (espejo del paso 1 del frontend) ──
        if (titulo !== undefined && !titulo.trim())
            return res.status(400).json({ ok: false, mensaje: "El título no puede estar vacío." });
        if (perfil_vark !== undefined && !perfil_vark)
            return res.status(400).json({ ok: false, mensaje: "El perfil VARK es obligatorio." });

        const campos = {};
        if (titulo !== undefined) campos.titulo = titulo.trim();
        if (descripcion !== undefined) campos.descripcion = descripcion?.trim() || null;
        if (perfil_vark !== undefined) campos.perfil_vark = perfil_vark || null;
        if (id_dimension !== undefined) campos.id_dimension = id_dimension || null;
        if (req.file) campos.foto = await subirImagenCloudinary(req.file.buffer);

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

        await Curso.delete(id);
        res.json({ ok: true, mensaje: "Curso eliminado." });
    } catch (error) {
        console.error("eliminarCurso:", error);
        res.status(500).json({ ok: false, mensaje: "Error al eliminar el curso." });
    }
};

// ─────────────────────────────────────────────────────────────
// SECCIONES
// ─────────────────────────────────────────────────────────────

export const crearSeccion = async (req, res) => {
    try {
        const { id } = req.params;
        const id_usuario = req.usuario.id;
        const { titulo_seccion, orden } = req.body;

        // ── Validación (espejo del frontend: titulo_seccion requerido) ──
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
        const { titulo_seccion, orden } = req.body;

        // ── Validación: título obligatorio (espejo del frontend) ──
        if (titulo_seccion !== undefined && !titulo_seccion.trim())
            return res.status(400).json({ ok: false, mensaje: "El título de la sección no puede estar vacío." });

        const campos = {};
        if (titulo_seccion !== undefined) campos.titulo_seccion = titulo_seccion.trim();
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
        const { id } = req.params;
        const { titulo, contenido, orden } = req.body;

        // ── Validación (espejo del frontend: titulo requerido) ──
        if (!titulo?.trim())
            return res.status(400).json({ ok: false, mensaje: "El título del bloque de contenido es obligatorio." });

        let ordenFinal = orden;
        if (!ordenFinal) {
            const contenidos = await Contenido.getBySeccion(id);
            ordenFinal = contenidos.length > 0
                ? Math.max(...contenidos.map((c) => c.orden)) + 1
                : 1;
        }

        // Subir imagen si viene adjunta
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
        const { id } = req.params;
        const { titulo, contenido, orden } = req.body;

        // ── Validación (espejo del frontend: titulo requerido) ──
        if (titulo !== undefined && !titulo.trim())
            return res.status(400).json({ ok: false, mensaje: "El título del bloque de contenido no puede estar vacío." });

        const campos = {};
        if (titulo !== undefined) campos.titulo = titulo.trim();
        if (contenido !== undefined) campos.contenido = contenido?.trim() || null;
        if (orden !== undefined) campos.orden = orden;

        // Subir imagen si viene adjunta
        if (req.file)
            campos.imagen_url = await subirImagenCloudinary(req.file.buffer, "cursos/contenidos");

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
        const { id } = req.params;
        const { texto_pregunta, opciones = [] } = req.body;

        // ── Validaciones (espejo del frontend) ──
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
        const { id } = req.params;
        const { texto_pregunta, opciones = [] } = req.body;

        // ── Validaciones (espejo del frontend) ──
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
            await OpcionTest.delete(id);
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
        await PreguntaTest.delete(id);
        res.json({ ok: true, mensaje: "Pregunta eliminada." });
    } catch (error) {
        console.error("eliminarPregunta:", error);
        res.status(500).json({ ok: false, mensaje: "Error al eliminar la pregunta." });
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

export const archivarCurso = async (req, res) => {
    try {
        const { id } = req.params;
        const id_usuario = req.usuario.id;

        const curso = await Curso.getById(id);
        if (!curso || curso.id_usuario !== id_usuario)
            return res.status(404).json({ ok: false, mensaje: "Curso no encontrado." });

        const nuevo_estado = !curso.archivado;
        const campos = { archivado: nuevo_estado };
        if (nuevo_estado) campos.es_publicado = false; // archivar despublica automáticamente

        await Curso.update(id, campos);
        res.json({ ok: true, archivado: nuevo_estado });
    } catch (error) {
        console.error("archivarCurso:", error);
        res.status(500).json({ ok: false, mensaje: "Error al archivar el curso." });
    }
};


export const listarCursosRecomendados = async (req, res) => {
    try {
        const id_usuario = req.usuario.id;
        const { perfil } = req.query;

        if (!perfil)
            return res.status(400).json({ ok: false, mensaje: "El perfil VARK es requerido." });

        // Obtener el perfil guardado del estudiante si no se pasa por query
        // Generar todas las combinaciones que contienen las letras del perfil
        const letras = perfil.toUpperCase().split("").filter(l => ["V", "A", "R", "K"].includes(l));

        if (letras.length === 0)
            return res.status(400).json({ ok: false, mensaje: "Perfil VARK inválido." });

        // Buscar cursos cuyo perfil_vark tenga al menos una letra en común con el perfil del estudiante
        // Ordenados por coincidencia exacta primero, luego parcial
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


// cursosController.js — agregar al final

export const listarCursosPorDimension = async (req, res) => {
    try {
        const { perfil, dimensiones } = req.query;

        if (!perfil)
            return res.status(400).json({ ok: false, mensaje: "El perfil VARK es requerido." });

        const letras = perfil.toUpperCase().split("").filter(l => ["V", "A", "R", "K"].includes(l));
        if (letras.length === 0)
            return res.status(400).json({ ok: false, mensaje: "Perfil VARK inválido." });

        const perfilPlaceholders = letras.map(() => "c.perfil_vark LIKE ?").join(" OR ");
        const perfilParams = letras.map(l => `%${l}%`);

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
                u.nombre AS nombre_tutor,
                (SELECT COUNT(*) FROM Seccion_Curso sc WHERE sc.id_curso = c.id_curso) AS total_secciones
             FROM Curso c
             LEFT JOIN Dimension_Evaluar d ON c.id_dimension = d.id_dimension
             LEFT JOIN Usuario u ON c.id_usuario = u.id_usuario
             WHERE c.es_publicado = 1
               AND c.archivado   = 0
               AND (${perfilPlaceholders})
               ${dimFilter}
             ORDER BY
               CASE WHEN c.perfil_vark = ? THEN 0 ELSE 1 END,
               c.fecha_creacion DESC
             LIMIT 12`,
            [...perfilParams, ...dimParams, perfil.toUpperCase()]
        );

        res.json({ ok: true, cursos: rows });
    } catch (error) {
        console.error("listarCursosPorDimension:", error);
        res.status(500).json({ ok: false, mensaje: "Error al obtener cursos recomendados." });
    }
};