// src/models/OpcionTest.js
import { db } from "../config/db.js";

export class OpcionTest {
    constructor({ texto_opcion, es_correcta = false, id_test }) {
        this.texto_opcion = texto_opcion;
        this.es_correcta = es_correcta;
        this.id_test = id_test;
    }

    async save() {
        return await db.query(
            `INSERT INTO Opcion_Test (texto_opcion, es_correcta, id_test)
             VALUES (?, ?, ?)`,
            [this.texto_opcion, this.es_correcta, this.id_test]
        );
    }

    static async getByPregunta(id_test) {
        const [rows] = await db.query(
            "SELECT * FROM Opcion_Test WHERE id_test = ?",
            [id_test]
        );
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query(
            "SELECT * FROM Opcion_Test WHERE id_opcion = ?",
            [id]
        );
        return rows[0];
    }

    static async update(id, campos) {
        const keys = Object.keys(campos).map(k => `${k} = ?`).join(", ");
        const values = [...Object.values(campos), id];
        return await db.query(`UPDATE Opcion_Test SET ${keys} WHERE id_opcion = ?`, values);
    }

    static async delete(id) {
        return await db.query("DELETE FROM Opcion_Test WHERE id_opcion = ?", [id]);
    }

    static async deleteByPregunta(id_test) {
        return await db.query("DELETE FROM Opcion_Test WHERE id_test = ?", [id_test]);
    }
}