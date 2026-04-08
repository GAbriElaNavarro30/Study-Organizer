// src/models/RespuestaTestCurso.js
import { db } from "../config/db.js";

export class RespuestaTestCurso {
    constructor({ es_correcta, id_intento, id_test, id_opcion }) {
        this.es_correcta = es_correcta;
        this.id_intento = id_intento;
        this.id_test = id_test;
        this.id_opcion = id_opcion;
    }

    async save() {
        return await db.query(
            `INSERT INTO Respuesta_Test_Curso (es_correcta, id_intento, id_test, id_opcion)
             VALUES (?, ?, ?, ?)`,
            [this.es_correcta, this.id_intento, this.id_test, this.id_opcion]
        );
    }

    static async saveMany(id_intento, respuestas) {
        const values = respuestas.map(r => [r.es_correcta, id_intento, r.id_test, r.id_opcion]);
        return await db.query(
            `INSERT INTO Respuesta_Test_Curso (es_correcta, id_intento, id_test, id_opcion)
             VALUES ?`,
            [values]
        );
    }

    static async getByIntento(id_intento) {
        const [rows] = await db.query(
            `SELECT r.*, p.texto_pregunta, o.texto_opcion
             FROM Respuesta_Test_Curso r
             JOIN Pregunta_Test p ON r.id_test = p.id_test
             JOIN Opcion_Test o ON r.id_opcion = o.id_opcion
             WHERE r.id_intento = ?`,
            [id_intento]
        );
        return rows;
    }

    static async contarCorrectas(id_intento) {
        const [[{ correctas }]] = await db.query(
            "SELECT COUNT(*) AS correctas FROM Respuesta_Test_Curso WHERE id_intento = ? AND es_correcta = TRUE",
            [id_intento]
        );
        return correctas;
    }
}