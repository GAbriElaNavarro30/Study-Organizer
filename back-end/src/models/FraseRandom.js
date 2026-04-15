// dashboard administrador
import { db } from "../config/db.js";

export class FraseRandom {
    constructor({ frase }) {
        this.frase = frase;
    }

    async save() {
        const [result] = await db.query(
            `INSERT INTO Frase_Random (frase) VALUES (?)`,
            [this.frase]
        );
        return result;
    }

    static async getById(id_frase) {
        const [rows] = await db.query(
            `SELECT id_frase, frase 
       FROM Frase_Random 
       WHERE id_frase = ?`,
            [id_frase]
        );
        return rows[0];
    }

    static async getRandom() {
        const [rows] = await db.query(
            `SELECT id_frase, frase 
       FROM Frase_Random 
       ORDER BY RAND() 
       LIMIT 1`
        );
        return rows[0];
    }

    static async countAll() {
        const [rows] = await db.query(
            `SELECT COUNT(*) as total FROM Frase_Random`
        );
        return rows[0].total;
    }

    static async getAll() {
        const [rows] = await db.query(
            `SELECT id_frase, frase 
       FROM Frase_Random 
       ORDER BY id_frase ASC`
        );
        return rows;
    }
}