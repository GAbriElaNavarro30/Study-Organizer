// ============================== MÓDULO EMOCIONES ==============================
import { db } from "../config/db.js";

export class Emocion {
    constructor({
        nombre_emocion,
        categoria,
        nivel = "medio",
        id_usuario = null,
    }) {
        this.nombre_emocion = nombre_emocion;
        this.categoria = categoria;
        this.nivel = nivel;
        this.id_usuario = id_usuario;
    }

    async save() {
        return await db.query(
            `INSERT INTO Emocion (nombre_emocion, categoria, nivel, id_usuario)
            VALUES (?, ?, ?, ?)`,
            [this.nombre_emocion, this.categoria, this.nivel, this.id_usuario]
        );
    }

    static async getAll() {
        const [rows] = await db.query(`SELECT * FROM Emocion`);
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query(
            "SELECT * FROM Emocion WHERE id_emocion = ?",
            [id]
        );
        return rows[0];
    }

    static async getByUsuario(id_usuario) {
        const [rows] = await db.query(
            "SELECT * FROM Emocion WHERE id_usuario = ? OR id_usuario IS NULL",
            [id_usuario]
        );
        return rows;
    }

    static async getByCategoria(categoria) {
        const [rows] = await db.query(
            "SELECT * FROM Emocion WHERE categoria = ?",
            [categoria]
        );
        return rows;
    }

    // NUEVO: filtrar por nivel (muy útil para alertas)
    static async getByNivel(nivel) {
        const [rows] = await db.query(
            "SELECT * FROM Emocion WHERE nivel = ?",
            [nivel]
        );
        return rows;
    }

    // NUEVO: combinar categoria + nivel (esto ya es pro)
    static async getByCategoriaYNivel(categoria, nivel) {
        const [rows] = await db.query(
            "SELECT * FROM Emocion WHERE categoria = ? AND nivel = ?",
            [categoria, nivel]
        );
        return rows;
    }
}