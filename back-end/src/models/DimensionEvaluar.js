// metodos de estudio
import { db } from "../config/db.js";

export class DimensionEvaluar {
    constructor({ nombre_dimension }) {
        this.nombre_dimension = nombre_dimension;
    }

    async save() {
        return await db.query(
            "INSERT INTO Dimension_Evaluar (nombre_dimension) VALUES (?)",
            [this.nombre_dimension]
        );
    }

    static async getAll() {
        const [rows] = await db.query(
            "SELECT id_dimension, nombre_dimension FROM Dimension_Evaluar ORDER BY id_dimension"
        );
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query(
            "SELECT * FROM Dimension_Evaluar WHERE id_dimension = ?",
            [id]
        );
        return rows[0];
    }
}