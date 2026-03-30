// metodos estudio
import { db } from "../config/db.js";

export class PreguntaME {
    constructor({ texto_pregunta, es_negativa = false, id_dimension }) {
        this.texto_pregunta = texto_pregunta;
        this.es_negativa    = es_negativa;
        this.id_dimension   = id_dimension;
    }

    async save() {
        return await db.query(
            "INSERT INTO Pregunta_ME (texto_pregunta, es_negativa, id_dimension) VALUES (?, ?, ?)",
            [this.texto_pregunta, this.es_negativa, this.id_dimension]
        );
    }

    static async getAll() {
        const [rows] = await db.query(
            "SELECT * FROM Pregunta_ME ORDER BY id_dimension, id_pregunta"
        );
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query(
            "SELECT * FROM Pregunta_ME WHERE id_pregunta = ?",
            [id]
        );
        return rows[0];
    }

    static async getAllWithOpciones() {
        const [rows] = await db.query(`
            SELECT
                p.id_pregunta,
                p.texto_pregunta,
                p.es_negativa,
                p.id_dimension,
                d.nombre_dimension,
                o.id_opcion,
                o.texto_opcion,
                o.categoria,
                o.valor
            FROM Pregunta_ME p
            JOIN Dimension_Evaluar d ON p.id_dimension = d.id_dimension
            CROSS JOIN Opcion_Likert o
            ORDER BY p.id_dimension, p.id_pregunta, o.valor
        `);
        return rows;
    }
}