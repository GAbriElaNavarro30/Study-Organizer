// src/controllers/estilosAprendizajeController.js

//para llamar al sisitema experto
import axios from "axios";

// modelos
import { db } from "../config/db.js";
import { PreguntaEA } from "../models/PreguntaEA.js";
import { IntentoTest } from "../models/IntentoTest.js";
import { RespuestasTestVARK } from "../models/RespuestasTestVARK.js";
import { ResultadoTestEA } from "../models/ResultadoTestEA.js";

// direccion del sistema experto
const PYTHON_URL = process.env.PYTHON_URL || "http://localhost:8000";

/* ===========================================================
   Obtener preguntas con sus opciones
=========================================================== */
export async function obtenerPreguntas(req, res) {
    try {
        const rows = await PreguntaEA.getAllWithOpciones();

        const mapa = {};
        for (const row of rows) {
            if (!mapa[row.id_pregunta]) {
                mapa[row.id_pregunta] = {
                    id: row.id_pregunta,
                    texto: row.texto_pregunta,
                    opciones: [],
                };
            }
            if (row.id_opcion) {
                mapa[row.id_pregunta].opciones.push({
                    id: row.id_opcion,
                    texto: row.texto_opcion,
                    cat: row.categoria,
                });
            }
        }

        res.json({ preguntas: Object.values(mapa) });
    } catch (error) {
        console.error("Error al obtener preguntas:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
}

/* ===========================================================
   Guardar respuestas y crear intento - en 4 pasos
=========================================================== */
export async function responder(req, res) {
    try {
        // 1. obtiene el id_usuario desde el token
        const id_usuario = req.usuario.id_usuario || req.usuario.id || req.usuario.usuario_id;

        // 2. valida que esten todas las respuestas
        const { respuestas } = req.body;

        if (!respuestas || respuestas.length < 16) {
            return res.status(400).json({ error: "Debes responder todas las preguntas" });
        }

        // 3. crea un nuevo intento en la bd
        const result = await new IntentoTest({
            tipo_test: "estilos_aprendizaje",
            id_usuario,
        }).save();

        const id_intento = result.insertId;

        // 4. guarda todas las respuestas de golpe
        const ids_opciones = respuestas.map(r => r.id_opcion);
        await RespuestasTestVARK.saveMany(id_intento, ids_opciones);

        res.json({ mensaje: "Respuestas guardadas correctamente", id_intento });
    } catch (error) {
        console.error("Error al guardar respuestas VARK:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
}

/* =========================================================================
    + Obtener resultado — llama al sistema experto y guarda en BD - 4 pasos
========================================================================= */
export async function obtenerResultado(req, res) {
    try {
        const { id_intento } = req.query;
        const id_usuario = req.usuario.id_usuario || req.usuario.id || req.usuario.usuario_id;

        if (!id_intento)
            return res.status(400).json({ error: "Falta el id_intento" });

        const respuestas = await RespuestasTestVARK.getByIntento(id_intento);

        if (!respuestas || respuestas.length === 0)
            return res.status(404).json({ mensaje: "No se encontraron respuestas del intento" });

        if (respuestas.length < 16)
            return res.status(404).json({ mensaje: "No se encontraron las 16 respuestas del intento" });

        // 1. Llama a Python
        const categorias = respuestas.map(r => r.categoria);
        const pythonRes = await axios.post(`${PYTHON_URL}/ea/analizar`, { categorias });

        const {
            puntaje_v, puntaje_a, puntaje_r, puntaje_k,
            porcentaje_v, porcentaje_a, porcentaje_r, porcentaje_k,
            perfil_dominante,
            nombre_perfil,
            recomendaciones,
        } = pythonRes.data;

        // 2. Guarda resultado en BD
        await new ResultadoTestEA({
            puntaje_v, puntaje_a, puntaje_r, puntaje_k,
            perfil_dominante, nombre_perfil, id_intento,
        }).save();

        // 3. Python ya decidió los criterios
        const criterios = pythonRes.data.criterios_cursos;
        let cursos = [];

        if (criterios?.perfil_exacto) {
            const todosPerfiles = [criterios.perfil_exacto, ...(criterios.perfiles_afines || [])];
            const placeholders = todosPerfiles.map(() => "?").join(",");

            const [rows] = await db.query(
                `SELECT
            c.id_curso, c.titulo, c.descripcion, c.foto,
            c.perfil_vark, c.fecha_creacion,
            d.nombre_dimension,
            u.nombre AS nombre_tutor,
            (SELECT COUNT(*) FROM Seccion_Curso sc WHERE sc.id_curso = c.id_curso) AS total_secciones,
            CASE WHEN c.perfil_vark = ? THEN 0 ELSE 1 END AS prioridad
         FROM Curso c
         LEFT JOIN Dimension_Evaluar d ON c.id_dimension = d.id_dimension
         LEFT JOIN Usuario u ON c.id_usuario = u.id_usuario
         WHERE c.es_publicado = 1
           AND c.archivado    = 0
           AND c.id_usuario  != ?
           AND c.perfil_vark  IN (${placeholders})
         ORDER BY prioridad ASC, c.fecha_creacion DESC
         LIMIT 12`,
                [criterios.perfil_exacto, id_usuario, ...todosPerfiles]
            );
            cursos = rows;
        }

        // 4. Devuelve todo al frontend
        res.json({
            perfil_dominante,
            nombre_perfil,
            puntajes: { v: puntaje_v, a: puntaje_a, r: puntaje_r, k: puntaje_k },
            porcentajes: { v: porcentaje_v, a: porcentaje_a, r: porcentaje_r, k: porcentaje_k },
            recomendaciones,
            cursos_recomendados: cursos,
        });

    } catch (error) {
        console.error("Error al obtener resultado VARK:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
}

/* =============================================================
   Obtener resultado guardado — sin recalcular mediante JS
============================================================= */
export async function obtenerResultadoGuardado(req, res) {
    try {
        const id_usuario = req.usuario.id_usuario || req.usuario.id || req.usuario.usuario_id;

        const resultado = await ResultadoTestEA.getUltimoByUsuario(id_usuario);
        if (!resultado)
            return res.status(404).json({ mensaje: "El usuario aún no ha realizado el test" });

        const pythonRes = await axios.get(`${PYTHON_URL}/ea/recomendaciones/${resultado.perfil_dominante}`);
        const recomendaciones = pythonRes.data.recomendaciones;

        const total = resultado.puntaje_v + resultado.puntaje_a + resultado.puntaje_r + resultado.puntaje_k;
        const porcentajes = {
            v: total > 0 ? parseFloat(((resultado.puntaje_v / total) * 100).toFixed(2)) : 0,
            a: total > 0 ? parseFloat(((resultado.puntaje_a / total) * 100).toFixed(2)) : 0,
            r: total > 0 ? parseFloat(((resultado.puntaje_r / total) * 100).toFixed(2)) : 0,
            k: total > 0 ? parseFloat(((resultado.puntaje_k / total) * 100).toFixed(2)) : 0,
        };

        // Python ya decidió los criterios
        const criterios = pythonRes.data.criterios_cursos;
        let cursos = [];

        if (criterios?.perfil_exacto) {
            const todosPerfiles = [criterios.perfil_exacto, ...(criterios.perfiles_afines || [])];
            const placeholders = todosPerfiles.map(() => "?").join(",");

            const [rows] = await db.query(
                `SELECT
            c.id_curso, c.titulo, c.descripcion, c.foto,
            c.perfil_vark, c.fecha_creacion,
            d.nombre_dimension,
            u.nombre AS nombre_tutor,
            (SELECT COUNT(*) FROM Seccion_Curso sc WHERE sc.id_curso = c.id_curso) AS total_secciones,
            CASE WHEN c.perfil_vark = ? THEN 0 ELSE 1 END AS prioridad
         FROM Curso c
         LEFT JOIN Dimension_Evaluar d ON c.id_dimension = d.id_dimension
         LEFT JOIN Usuario u ON c.id_usuario = u.id_usuario
         WHERE c.es_publicado = 1
           AND c.archivado    = 0
           AND c.id_usuario  != ?
           AND c.perfil_vark  IN (${placeholders})
         ORDER BY prioridad ASC, c.fecha_creacion DESC
         LIMIT 12`,
                [criterios.perfil_exacto, id_usuario, ...todosPerfiles]
            );
            cursos = rows;
        }

        res.json({
            perfil_dominante: resultado.perfil_dominante,
            nombre_perfil: resultado.nombre_perfil,
            puntajes: { v: resultado.puntaje_v, a: resultado.puntaje_a, r: resultado.puntaje_r, k: resultado.puntaje_k },
            porcentajes,
            recomendaciones,
            cursos_recomendados: cursos,
        });

    } catch (error) {
        console.error("Error al obtener resultado guardado:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
}

/* ==============================================================
   Obtener historial del usuario
============================================================== */
export async function obtenerHistorial(req, res) {
    try {
        // 1. obtiene id_usuario desde el token
        const id_usuario = req.usuario.id_usuario || req.usuario.id || req.usuario.usuario_id;

        // 2. obtiene historial
        const historial = await ResultadoTestEA.getHistorialByUsuario(id_usuario);
        res.json({ historial });
    } catch (error) {
        console.error("Error al obtener historial:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
} 