// metodos estudio
import { db } from "../config/db.js";

export class OpcionLikert {
    constructor({ categoria, valor }) {
        this.categoria = categoria;
        this.valor = valor;
    }

    async save() {
        return await db.query(
            "INSERT INTO Opcion_Likert (categoria, valor) VALUES (?, ?)",
            [this.categoria, this.valor]
        );
    }

    static async getAll() {
        const [rows] = await db.query(
            "SELECT * FROM Opcion_Likert ORDER BY valor"
        );
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query(
            "SELECT * FROM Opcion_Likert WHERE id_opcion = ?",
            [id]
        );
        return rows[0];
    }
}