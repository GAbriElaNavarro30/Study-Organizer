// src/models/ResultadoCurso.js
import { db } from "../config/db.js";

export class ResultadoCurso {
    constructor({ total_preguntas, respuestas_correctas, porcentaje, id_intento }) {
        this.total_preguntas      = total_preguntas;
        this.respuestas_correctas = respuestas_correctas;
        this.porcentaje           = porcentaje;
        this.id_intento           = id_intento;
    }

    async save() {
        return await db.query(
            `INSERT INTO Resultado_Curso (total_preguntas, respuestas_correctas, porcentaje, id_intento)
             VALUES (?, ?, ?, ?)`,
            [
                this.total_preguntas,
                this.respuestas_correctas,
                this.porcentaje,
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
}