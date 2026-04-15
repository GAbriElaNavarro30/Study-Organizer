// ============================== MÓDULO FRASE ==============================
import { db } from "../config/db.js";

export class Frase {
    constructor({
        frase,
        categoria,
    }) {
        this.frase = frase;
        this.categoria = categoria;
    }

    async save() {
        return await db.query(
            `INSERT INTO Frase (frase, categoria)
            VALUES (?, ?)`,
            [this.frase, this.categoria]
        );
    }

    static async getAll() {
        const [rows] = await db.query(`SELECT * FROM Frase`);
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query(
            "SELECT * FROM Frase WHERE id_frase = ?",
            [id]
        );
        return rows[0];
    }

    static async getByCategoria(categoria) {
        const [rows] = await db.query(
            "SELECT * FROM Frase WHERE categoria = ?",
            [categoria]
        );
        return rows;
    }

    static async getRandom(categoria) {
        const [rows] = await db.query(
            "SELECT * FROM Frase WHERE categoria = ? ORDER BY RAND() LIMIT 1",
            [categoria]
        );
        return rows[0];
    }
}