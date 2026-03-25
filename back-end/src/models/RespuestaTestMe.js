// metodos de estudio
import { db } from "../config/db.js";

export class RespuestaTestMe {
    constructor({ id_intento, id_pregunta, id_opcion }) {
        this.id_intento  = id_intento;
        this.id_pregunta = id_pregunta;
        this.id_opcion   = id_opcion;
    }

    async save() {
        return await db.query(
            "INSERT INTO Respuesta_Test_Me (id_intento, id_pregunta, id_opcion) VALUES (?, ?, ?)",
            [this.id_intento, this.id_pregunta, this.id_opcion]
        );
    }

    static async saveMany(id_intento, respuestas) {
        const valores = respuestas.map(r => [id_intento, r.id_pregunta, r.id_opcion]);
        return await db.query(
            "INSERT INTO Respuesta_Test_Me (id_intento, id_pregunta, id_opcion) VALUES ?",
            [valores]
        );
    }

    static async getByIntento(id_intento) {
        const [rows] = await db.query(`
            SELECT
                rm.id_respuesta,
                rm.id_pregunta,
                rm.id_opcion,
                p.es_negativa,
                p.id_dimension,
                o.categoria,
                o.valor
            FROM Respuesta_Test_Me rm
            JOIN Pregunta_ME p   ON rm.id_pregunta = p.id_pregunta
            JOIN Opcion_Likert o ON rm.id_opcion   = o.id_opcion
            WHERE rm.id_intento = ?
            ORDER BY p.id_dimension, p.id_pregunta
        `, [id_intento]);
        return rows;
    }
}