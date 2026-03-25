import axios from "axios";

import { PreguntaME } from "../models/PreguntaME.js";
import { IntentoTest } from "../models/IntentoTest.js";
import { RespuestaTestMe } from "../models/RespuestaTestMe.js";
import { ResultadoME } from "../models/ResultadoME.js";
import { db } from "../config/db.js";

const EXPERTO_ME_URL = process.env.EXPERTO_ME_URL || "http://localhost:8001";

/* ══════════════════════════════════════════════════════
   Obtener preguntas del test (36 preguntas con opciones)
══════════════════════════════════════════════════════ */
export async function obtenerTest(req, res) {
  try {
    const preguntas = await PreguntaME.getAllWithOpciones();

    const map = new Map();
    for (const row of preguntas) {
      if (!map.has(row.id_pregunta)) {
        map.set(row.id_pregunta, {
          id_pregunta:      row.id_pregunta,
          texto_pregunta:   row.texto_pregunta,
          es_negativa:      !!row.es_negativa,
          id_dimension:     row.id_dimension,
          nombre_dimension: row.nombre_dimension,
          opciones: [],
        });
      }
      map.get(row.id_pregunta).opciones.push({
        id_opcion:    row.id_opcion,
        texto_opcion: row.texto_opcion,
        categoria:    row.categoria,
        valor:        row.valor,
      });
    }

    const dimensiones = new Map();
    for (const pregunta of map.values()) {
      const key = pregunta.id_dimension;
      if (!dimensiones.has(key)) {
        dimensiones.set(key, {
          id_dimension:     key,
          nombre_dimension: pregunta.nombre_dimension,
          preguntas: [],
        });
      }
      dimensiones.get(key).preguntas.push(pregunta);
    }

    res.json({ dimensiones: Array.from(dimensiones.values()) });
  } catch (err) {
    console.error("Error al obtener test ME:", err);
    res.status(500).json({ error: "Error al obtener el test" });
  }
}

/* ══════════════════════════════════════════════════════
   Guardar respuestas + llamar al sistema experto
══════════════════════════════════════════════════════ */
export async function responder(req, res) {
  const conn = await db.getConnection();
  try {
    const id_usuario = req.usuario.id_usuario || req.usuario.id || req.usuario.usuario_id;
    const { respuestas } = req.body;

    if (!Array.isArray(respuestas) || respuestas.length !== 36) {
      return res.status(400).json({ error: "Se requieren exactamente 36 respuestas" });
    }

    // Obtener perfil VARK dominante
    const [varkRows] = await conn.query(`
      SELECT r.perfil_dominante
      FROM Resultado_VARK r
      JOIN Intento_Test i ON r.id_intento = i.id_intento
      WHERE i.id_usuario = ? AND i.tipo_test = 'estilos_aprendizaje'
      ORDER BY i.fecha_intento DESC
      LIMIT 1
    `, [id_usuario]);
    const perfil_vark = varkRows.length > 0 ? varkRows[0].perfil_dominante : "VARK";

    await conn.beginTransaction();

    // Crear intento
    const intentoResult = await new IntentoTest({
      id_usuario,
      tipo_test: "metodos_estudio",
    }).save();
    const id_intento = intentoResult.insertId;

    // Guardar respuestas
    await RespuestaTestMe.saveMany(id_intento, respuestas);

    // Llamar al sistema experto
    const { data: analisis } = await axios.post(`${EXPERTO_ME_URL}/analizar-me`, {
      respuestas: respuestas.map(r => ({
        id_pregunta:  r.id_pregunta,
        id_dimension: r.id_dimension,
        valor:        r.valor,
        es_negativa:  r.es_negativa,
      })),
      perfil_vark,
    });

    // Guardar resultados por dimensión
    await ResultadoME.saveMany(id_intento, analisis.resultados_por_dimension);

    await conn.commit();
    res.json({ id_intento, perfil_vark, ...analisis });
  } catch (err) {
    await conn.rollback();
    console.error("Error al procesar test ME:", err);
    res.status(500).json({ error: "Error al procesar el test" });
  } finally {
    conn.release();
  }
}

/* ══════════════════════════════════════════════════════
   Obtener resultado de un intento específico
══════════════════════════════════════════════════════ */
export async function obtenerResultado(req, res) {
  try {
    const id_usuario = req.usuario.id_usuario || req.usuario.id || req.usuario.usuario_id;
    const { id_intento } = req.params;

    // Verificar que el intento pertenece al usuario
    const [check] = await db.query(
      "SELECT id_intento FROM Intento_Test WHERE id_intento = ? AND id_usuario = ? AND tipo_test = 'metodos_estudio'",
      [id_intento, id_usuario]
    );
    if (check.length === 0) {
      return res.status(404).json({ error: "Intento no encontrado" });
    }

    // Obtener respuestas guardadas
    const respuestas = await RespuestaTestMe.getByIntento(id_intento);

    // Obtener perfil VARK dominante
    const [varkRows] = await db.query(`
      SELECT rv.perfil_dominante
      FROM Resultado_VARK rv
      JOIN Intento_Test i ON rv.id_intento = i.id_intento
      WHERE i.id_usuario = ? AND i.tipo_test = 'estilos_aprendizaje'
      ORDER BY i.fecha_intento DESC
      LIMIT 1
    `, [id_usuario]);
    const perfil_vark = varkRows.length > 0 ? varkRows[0].perfil_dominante : "VARK";

    // Recalcular análisis
    const { data: analisis } = await axios.post(`${EXPERTO_ME_URL}/analizar-me`, {
      respuestas: respuestas.map(r => ({
        id_pregunta:  r.id_pregunta,
        id_dimension: r.id_dimension,
        valor:        r.valor,
        es_negativa:  !!r.es_negativa,
      })),
      perfil_vark,
    });

    res.json({ id_intento: Number(id_intento), perfil_vark, ...analisis });
  } catch (err) {
    console.error("Error al obtener resultado ME:", err);
    res.status(500).json({ error: "Error al obtener resultado" });
  }
}

/* ══════════════════════════════════════════════════════
   Obtener historial de intentos del usuario
══════════════════════════════════════════════════════ */
export async function obtenerHistorial(req, res) {
  try {
    const id_usuario = req.usuario.id_usuario || req.usuario.id || req.usuario.usuario_id;
    const historial = await ResultadoME.getHistorialByUsuario(id_usuario);
    res.json({ historial });
  } catch (err) {
    console.error("Error al obtener historial ME:", err);
    res.status(500).json({ error: "Error al obtener historial" });
  }
}