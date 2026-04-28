// src/models/IntentoCurso.js
import { db } from "../config/db.js";

export class IntentoCurso {
    constructor({ numero_intento, id_inscripcion }) {
        this.numero_intento = numero_intento;
        this.id_inscripcion = id_inscripcion;
    }
 
    async save() {
        return await db.query(
            `INSERT INTO Intento_Curso (numero_intento, id_inscripcion)
             VALUES (?, ?)`,
            [this.numero_intento, this.id_inscripcion]
        );
    }

    static async getByInscripcion(id_inscripcion) {
        const [rows] = await db.query(
            "SELECT * FROM Intento_Curso WHERE id_inscripcion = ? ORDER BY numero_intento DESC",
            [id_inscripcion]
        );
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query(
            "SELECT * FROM Intento_Curso WHERE id_intento = ?",
            [id]
        );
        return rows[0];
    }

    static async getUltimoPorInscripcion(id_inscripcion) {
        const [rows] = await db.query(
            "SELECT * FROM Intento_Curso WHERE id_inscripcion = ? ORDER BY numero_intento DESC LIMIT 1",
            [id_inscripcion]
        );
        return rows[0];
    }

    static async completar(id) {
        return await db.query(
            "UPDATE Intento_Curso SET completado = TRUE, fecha_fin = NOW() WHERE id_intento = ?",
            [id]
        );
    }

    static async delete(id) {
        return await db.query("DELETE FROM Intento_Curso WHERE id_intento = ?", [id]);
    }
}