// src/controllers/estilosAprendizajeController.js
import axios from "axios"; //para llamar al sisitema experto

import { PreguntaEA } from "../models/PreguntaEA.js";
import { IntentoTest } from "../models/IntentoTest.js";
import { RespuestasTestVARK } from "../models/RespuestasTestVARK.js";
import { ResultadoTestEA } from "../models/ResultadoTestEA.js";

const PYTHON_URL = process.env.PYTHON_URL || "http://localhost:8000";

/* ══════════════════════════════════════════════════════════════
   Obtener preguntas con opciones
══════════════════════════════════════════════════════════════ */
export async function obtenerPreguntas(req, res) {
    try {
        const rows = await PreguntaEA.getAllWithOpciones();

        const mapa = {};
        for (const row of rows) {
            if (!mapa[row.id_pregunta]) {
                mapa[row.id_pregunta] = {
                    id:      row.id_pregunta,
                    texto:   row.texto_pregunta,
                    opciones: [],
                };
            }
            if (row.id_opcion) {
                mapa[row.id_pregunta].opciones.push({
                    id:    row.id_opcion,
                    texto: row.texto_opcion,
                    cat:   row.categoria,
                });
            }
        }

        res.json({ preguntas: Object.values(mapa) });
    } catch (error) {
        console.error("Error al obtener preguntas:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
}

/* ══════════════════════════════════════════════════════════════
   Guardar respuestas y crear intento
══════════════════════════════════════════════════════════════ */
export async function responder(req, res) {
    try {
        const id_usuario = req.usuario.id_usuario || req.usuario.id || req.usuario.usuario_id;
        const { respuestas } = req.body;

        if (!respuestas || respuestas.length < 16) {
            return res.status(400).json({ error: "Debes responder todas las preguntas" });
        }

        const result = await new IntentoTest({
            tipo_test: "estilos_aprendizaje",
            id_usuario,
        }).save();

        const id_intento = result.insertId;

        const ids_opciones = respuestas.map(r => r.id_opcion);
        await RespuestasTestVARK.saveMany(id_intento, ids_opciones);

        res.json({ mensaje: "Respuestas guardadas correctamente", id_intento });
    } catch (error) {
        console.error("Error al guardar respuestas VARK:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
}

/* ══════════════════════════════════════════════════════════════
   Obtener resultado — llama al sistema experto y guarda en BD
══════════════════════════════════════════════════════════════ */
export async function obtenerResultado(req, res) {
    try {
        const id_usuario = req.usuario.id_usuario || req.usuario.id || req.usuario.usuario_id;
        const { id_intento } = req.query;

        if (!id_intento) {
            return res.status(400).json({ error: "Falta el id_intento" });
        }

        const respuestas = await RespuestasTestVARK.getByIntento(id_intento);

        if (!respuestas || respuestas.length === 0) {
            return res.status(404).json({ mensaje: "No se encontraron respuestas del intento" });
        }

        if (respuestas.length < 16) {
            return res.status(404).json({ mensaje: "No se encontraron las 16 respuestas del intento" });
        }

        const categorias = respuestas.map(r => r.categoria);

        const pythonRes = await axios.post(`${PYTHON_URL}/analizar`, { categorias });
        const {
            puntaje_v, puntaje_a, puntaje_r, puntaje_k,
            porcentaje_v, porcentaje_a, porcentaje_r, porcentaje_k,
            perfil_dominante, recomendaciones,
        } = pythonRes.data;

        await new ResultadoTestEA({
            puntaje_v,
            puntaje_a,
            puntaje_r,
            puntaje_k,
            perfil_dominante,
            id_intento,
        }).save();

        res.json({
            perfil_dominante,
            puntajes:    { v: puntaje_v,    a: puntaje_a,    r: puntaje_r,    k: puntaje_k },
            porcentajes: { v: porcentaje_v, a: porcentaje_a, r: porcentaje_r, k: porcentaje_k },
            recomendaciones,
        });
    } catch (error) {
        console.error("Error al obtener resultado VARK:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
}

/* ══════════════════════════════════════════════════════════════
   Obtener resultado guardado — sin recalcular
══════════════════════════════════════════════════════════════ */
export async function obtenerResultadoGuardado(req, res) {
    try {
        const id_usuario = req.usuario.id_usuario || req.usuario.id || req.usuario.usuario_id;

        const resultado = await ResultadoTestEA.getUltimoByUsuario(id_usuario);

        if (!resultado) {
            return res.status(404).json({ mensaje: "El usuario aún no ha realizado el test" });
        }

        const pythonRes = await axios.get(`${PYTHON_URL}/recomendaciones/${resultado.perfil_dominante}`);
        const recomendaciones = pythonRes.data.recomendaciones;

        const total = resultado.puntaje_v + resultado.puntaje_a + resultado.puntaje_r + resultado.puntaje_k;
        const porcentajes = {
            v: total > 0 ? Math.round((resultado.puntaje_v / total) * 100) : 0,
            a: total > 0 ? Math.round((resultado.puntaje_a / total) * 100) : 0,
            r: total > 0 ? Math.round((resultado.puntaje_r / total) * 100) : 0,
            k: total > 0 ? Math.round((resultado.puntaje_k / total) * 100) : 0,
        };

        res.json({
            perfil_dominante: resultado.perfil_dominante,
            puntajes: {
                v: resultado.puntaje_v,
                a: resultado.puntaje_a,
                r: resultado.puntaje_r,
                k: resultado.puntaje_k,
            },
            porcentajes,
            recomendaciones,
        });
    } catch (error) {
        console.error("Error al obtener resultado guardado:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
}

/* ══════════════════════════════════════════════════════════════
   Obtener historial del usuario
══════════════════════════════════════════════════════════════ */
export async function obtenerHistorial(req, res) {
    try {
        const id_usuario = req.usuario.id_usuario || req.usuario.id || req.usuario.usuario_id;
        const historial = await ResultadoTestEA.getHistorialByUsuario(id_usuario);
        res.json({ historial });
    } catch (error) {
        console.error("Error al obtener historial:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
}