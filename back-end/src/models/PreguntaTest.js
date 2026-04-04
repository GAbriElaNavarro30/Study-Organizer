// src/models/PreguntaTest.js
import { db } from "../config/db.js";

export class PreguntaTest {
    constructor({ texto_pregunta, id_seccion }) {
        this.texto_pregunta = texto_pregunta;
        this.id_seccion = id_seccion;
    }

    async save() {
        return await db.query(
            `INSERT INTO Pregunta_Test (texto_pregunta, id_seccion)
             VALUES (?, ?)`,
            [this.texto_pregunta, this.id_seccion]
        );
    }

    static async getBySeccion(id_seccion) {
        const [rows] = await db.query(
            "SELECT * FROM Pregunta_Test WHERE id_seccion = ?",
            [id_seccion]
        );
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query(
            "SELECT * FROM Pregunta_Test WHERE id_test = ?",
            [id]
        );
        return rows[0];
    }

    static async getBySeccionConOpciones(id_seccion) {
        const [preguntas] = await db.query(
            "SELECT * FROM Pregunta_Test WHERE id_seccion = ?",
            [id_seccion]
        );
        for (const p of preguntas) {
            const [opciones] = await db.query(
                "SELECT * FROM Opcion_Test WHERE id_test = ?",
                [p.id_test]
            );
            p.opciones = opciones;
        }
        return preguntas;
    }

    static async update(id, campos) {
        const keys = Object.keys(campos).map(k => `${k} = ?`).join(", ");
        const values = [...Object.values(campos), id];
        return await db.query(`UPDATE Pregunta_Test SET ${keys} WHERE id_test = ?`, values);
    }

    static async delete(id) {
        return await db.query("DELETE FROM Pregunta_Test WHERE id_test = ?", [id]);
    }


    static async getByCursoConOpciones(id_curso) {
        const [preguntas] = await db.query(
            `SELECT pt.*, sc.id_seccion
         FROM Pregunta_Test pt
         JOIN Seccion_Curso sc ON pt.id_seccion = sc.id_seccion
         WHERE sc.id_curso = ?`,
            [id_curso]
        );

        if (preguntas.length === 0) return [];

        const ids = preguntas.map(p => p.id_test);
        const [opciones] = await db.query(
            `SELECT * FROM Opcion_Test WHERE id_test IN (${ids.map(() => "?").join(",")})`,
            ids
        );

        for (const p of preguntas) {
            p.opciones = opciones.filter(o => o.id_test === p.id_test);
        }

        return preguntas;
    }
}

