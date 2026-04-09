/// src/controllers/metodosEstudioController.js
import axios from "axios";
import { PreguntaME } from "../models/PreguntaME.js";
import { IntentoTest } from "../models/IntentoTest.js";
import { RespuestaTestMe } from "../models/RespuestaTestMe.js";
import { ResultadoME } from "../models/ResultadoME.js";
import { db } from "../config/db.js";

const PYTHON_URL = process.env.PYTHON_URL || "http://localhost:8000";

// ── Helper compartido: calcula nivel y puntaje con truncado ──
function calcularGlobal(resultados) {
  const puntaje = resultados.reduce((sum, d) => sum + d.puntaje, 0) / resultados.length;
  const truncado = Math.floor(puntaje * 100) / 100;
  const nivel =
    puntaje >= 95 ? "excelente"
      : puntaje >= 80 ? "muy_bueno"
        : puntaje >= 65 ? "bueno"
          : puntaje >= 50 ? "regular"
            : "deficiente";
  return { puntaje_global: truncado, nivel_global: nivel };
}

/* ══════════════════════════════════════════════════════
   Obtener preguntas del test
══════════════════════════════════════════════════════ */
export async function obtenerTest(req, res) {
  try {
    const preguntas = await PreguntaME.getAllWithOpciones();

    const map = new Map();
    for (const row of preguntas) {
      if (!map.has(row.id_pregunta)) {
        map.set(row.id_pregunta, {
          id_pregunta: row.id_pregunta,
          texto_pregunta: row.texto_pregunta,
          es_negativa: !!row.es_negativa,
          id_dimension: row.id_dimension,
          nombre_dimension: row.nombre_dimension,
          opciones: [],
        });
      }
      map.get(row.id_pregunta).opciones.push({
        id_opcion: row.id_opcion,
        categoria: row.categoria,
        valor: row.valor,
      });
    }

    const dimensiones = new Map();
    for (const pregunta of map.values()) {
      const key = pregunta.id_dimension;
      if (!dimensiones.has(key)) {
        dimensiones.set(key, {
          id_dimension: key,
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
      FROM Resultado_Test_EA r
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
    const { data: analisis } = await axios.post(`${PYTHON_URL}/me/analizar-me`, {
      respuestas: respuestas.map(r => ({
        id_pregunta: r.id_pregunta,
        id_dimension: r.id_dimension,
        valor: r.valor,
        es_negativa: r.es_negativa,
      })),
      perfil_vark,
    });

    // Guardar resultados por dimensión
    await ResultadoME.saveMany(id_intento, analisis.resultados_por_dimension);

    await conn.commit();

    const { puntaje_global, nivel_global } = calcularGlobal(analisis.resultados_por_dimension);

    // ── Python ya decidió los criterios ──
    const criterios = analisis.criterios_cursos;
    let cursos_recomendados = [];

    if (criterios?.perfil_exacto && criterios.dimensiones?.length > 0) {
      const todosPerfiles = [criterios.perfil_exacto, ...(criterios.perfiles_afines || [])];
      const placeholders = todosPerfiles.map(() => "?").join(",");
      const dimPlaceholders = criterios.dimensiones.map(() => "?").join(",");

      const [cursos] = await conn.query(
        `SELECT
            c.id_curso, c.titulo, c.descripcion, c.foto,
            c.perfil_vark, c.fecha_creacion,
            d.nombre_dimension,
            CONCAT_WS(' ', u.nombre, u.apellido) AS nombre_tutor,
            (SELECT COUNT(*) FROM Seccion_Curso sc WHERE sc.id_curso = c.id_curso) AS total_secciones,
            CASE WHEN c.perfil_vark = ? THEN 0 ELSE 1 END AS prioridad
         FROM Curso c
         LEFT JOIN Dimension_Evaluar d ON c.id_dimension = d.id_dimension
         LEFT JOIN Usuario u ON c.id_usuario = u.id_usuario
         WHERE c.es_publicado  = 1
           AND c.archivado     = 0
           AND c.id_usuario   != ?
           AND c.perfil_vark   IN (${placeholders})
           AND c.id_dimension  IN (${dimPlaceholders})
         ORDER BY prioridad ASC, c.fecha_creacion DESC
         LIMIT 12`,
        [criterios.perfil_exacto, id_usuario, ...todosPerfiles, ...criterios.dimensiones]
      );
      cursos_recomendados = cursos;
    }
    res.json({
      id_intento,
      perfil_vark,
      ...analisis,
      puntaje_global,
      nivel_global,
      cursos_recomendados,
    });

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

    const [check] = await db.query(
      "SELECT id_intento FROM Intento_Test WHERE id_intento = ? AND id_usuario = ? AND tipo_test = 'metodos_estudio'",
      [id_intento, id_usuario]
    );
    if (check.length === 0) {
      return res.status(404).json({ error: "Intento no encontrado" });
    }

    const respuestas = await RespuestaTestMe.getByIntento(id_intento);

    const [varkRows] = await db.query(`
      SELECT r.perfil_dominante
      FROM Resultado_Test_EA r
      JOIN Intento_Test i ON r.id_intento = i.id_intento
      WHERE i.id_usuario = ? AND i.tipo_test = 'estilos_aprendizaje'
      ORDER BY i.fecha_intento DESC
      LIMIT 1
    `, [id_usuario]);
    const perfil_vark = varkRows.length > 0 ? varkRows[0].perfil_dominante : "VARK";

    const { data: analisis } = await axios.post(`${PYTHON_URL}/me/analizar-me`, {
      respuestas: respuestas.map(r => ({
        id_pregunta: r.id_pregunta,
        id_dimension: r.id_dimension,
        valor: r.valor,
        es_negativa: !!r.es_negativa,
      })),
      perfil_vark,
    });

    const { puntaje_global, nivel_global } = calcularGlobal(analisis.resultados_por_dimension);

    // ── Python ya decidió los criterios ──
    const criterios = analisis.criterios_cursos;
    let cursos_recomendados = [];

    if (criterios?.perfil_exacto && criterios.dimensiones?.length > 0) {
      const todosPerfiles = [criterios.perfil_exacto, ...(criterios.perfiles_afines || [])];
      const placeholders = todosPerfiles.map(() => "?").join(",");
      const dimPlaceholders = criterios.dimensiones.map(() => "?").join(",");

      const [cursos] = await db.query(
        `SELECT
            c.id_curso, c.titulo, c.descripcion, c.foto,
            c.perfil_vark, c.fecha_creacion,
            d.nombre_dimension,
            CONCAT_WS(' ', u.nombre, u.apellido) AS nombre_tutor,
            (SELECT COUNT(*) FROM Seccion_Curso sc WHERE sc.id_curso = c.id_curso) AS total_secciones,
            CASE WHEN c.perfil_vark = ? THEN 0 ELSE 1 END AS prioridad
         FROM Curso c
         LEFT JOIN Dimension_Evaluar d ON c.id_dimension = d.id_dimension
         LEFT JOIN Usuario u ON c.id_usuario = u.id_usuario
         WHERE c.es_publicado  = 1
           AND c.archivado     = 0
           AND c.id_usuario   != ?
           AND c.perfil_vark   IN (${placeholders})
           AND c.id_dimension  IN (${dimPlaceholders})
         ORDER BY prioridad ASC, c.fecha_creacion DESC
         LIMIT 12`,
        [criterios.perfil_exacto, id_usuario, ...todosPerfiles, ...criterios.dimensiones]
      );
      cursos_recomendados = cursos;
    }
    res.json({
      id_intento: Number(id_intento),
      perfil_vark,
      ...analisis,
      puntaje_global,
      nivel_global,
      cursos_recomendados,
    });

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