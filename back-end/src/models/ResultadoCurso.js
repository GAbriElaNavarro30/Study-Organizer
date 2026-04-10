// src/models/ResultadoCurso.js
import { db } from "../config/db.js";

export class ResultadoCurso {
    constructor({ total_preguntas, respuestas_correctas, porcentaje, nivel, id_intento }) {
        this.total_preguntas = total_preguntas;
        this.respuestas_correctas = respuestas_correctas;
        this.porcentaje = porcentaje;
        this.nivel = nivel;                // ← agregado
        this.id_intento = id_intento;
    }

    async save() {
        return await db.query(
            `INSERT INTO Resultado_Curso (total_preguntas, respuestas_correctas, porcentaje, nivel, id_intento)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
               total_preguntas      = VALUES(total_preguntas),
               respuestas_correctas = VALUES(respuestas_correctas),
               porcentaje           = VALUES(porcentaje),
               nivel                = VALUES(nivel)`,
            [
                this.total_preguntas,
                this.respuestas_correctas,
                this.porcentaje,
                this.nivel,                // ← agregado
                this.id_intento,
            ]
        );
    }

    static async getByIntento(id_intento) {
        const [rows] = await db.query(
            "SELECT * FROM Resultado_Curso WHERE id_intento = ?",
            [id_intento]
        );
        return rows[0];
    }

    static async getByUsuario(id_usuario) {
        const [rows] = await db.query(
            `SELECT
                rc.*,
                c.titulo AS titulo_curso,
                ic.numero_intento,
                ic.fecha_fin
             FROM Resultado_Curso rc
             JOIN Intento_Curso ic ON rc.id_intento = ic.id_intento
             JOIN Inscripcion i ON ic.id_inscripcion = i.id_inscripcion
             JOIN Curso c ON i.id_curso = c.id_curso
             WHERE i.id_usuario = ?
             ORDER BY rc.fecha_resultado DESC`,
            [id_usuario]
        );
        return rows;
    }

    static async getByCurso(id_curso) {
        const [rows] = await db.query(
            `SELECT
                rc.*,
                u.nombre,
                u.apellido,
                ic.numero_intento
             FROM Resultado_Curso rc
             JOIN Intento_Curso ic ON rc.id_intento = ic.id_intento
             JOIN Inscripcion i ON ic.id_inscripcion = i.id_inscripcion
             JOIN Usuario u ON i.id_usuario = u.id_usuario
             WHERE i.id_curso = ?
             ORDER BY rc.fecha_resultado DESC`,
            [id_curso]
        );
        return rows;
    }

    static async getResultadosPorCurso(id_curso) {
        const [rows] = await db.query(
            `SELECT
                u.id_usuario,
                u.nombre, u.apellido, u.foto_perfil,
                rc.total_preguntas, rc.respuestas_correctas,
                rc.porcentaje AS puntaje,
                rc.nivel,
                it.fecha_inicio AS fecha
             FROM Resultado_Curso rc
             JOIN Intento_Curso it ON rc.id_intento = it.id_intento
             JOIN Inscripcion i ON it.id_inscripcion = i.id_inscripcion
             JOIN Usuario u ON i.id_usuario = u.id_usuario
             WHERE i.id_curso = ?
               AND rc.id_resultado = (
                   SELECT rc2.id_resultado
                   FROM Resultado_Curso rc2
                   JOIN Intento_Curso it2 ON rc2.id_intento = it2.id_intento
                   JOIN Inscripcion i2 ON it2.id_inscripcion = i2.id_inscripcion
                   WHERE i2.id_curso = ?
                     AND i2.id_usuario = u.id_usuario
                   ORDER BY rc2.id_resultado DESC
                   LIMIT 1
               )
             ORDER BY rc.porcentaje DESC`,
            [id_curso, id_curso]
        );
        return rows;
    }

    static async getHistorialEstudiante(id_curso, id_usuario) {
        const [rows] = await db.query(
            `SELECT
                rc.porcentaje AS puntaje,
                rc.nivel,
                it.fecha_inicio AS fecha,
                TIMESTAMPDIFF(MINUTE, it.fecha_inicio, it.fecha_fin) AS duracion_minutos
             FROM Resultado_Curso rc
             JOIN Intento_Curso it ON rc.id_intento = it.id_intento
             JOIN Inscripcion i ON it.id_inscripcion = i.id_inscripcion
             WHERE i.id_curso = ? AND i.id_usuario = ?
             ORDER BY it.fecha_inicio ASC`,
            [id_curso, id_usuario]
        );
        return rows;
    }
}