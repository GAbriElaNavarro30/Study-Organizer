// ============================== MÓDULO EMOCIONES ==============================
// model/Emocion.js
import { db } from "../config/db.js";

export class Emocion {
    constructor({ nombre_emocion, categoria, fecha_creacion = null, id_usuario = null }) {
        this.nombre_emocion = nombre_emocion;
        this.categoria = categoria;
        this.fecha_creacion = fecha_creacion;
        this.id_usuario = id_usuario;
    }

    async save() {
        const [result] = await db.query(
            `INSERT INTO Emocion (nombre_emocion, categoria, fecha_creacion, id_usuario)
             VALUES (?, ?, ?, ?)`,
            [this.nombre_emocion, this.categoria, this.fecha_creacion, this.id_usuario]
        );
        return result;
    }

    static async getAll() {
        const [rows] = await db.query(`SELECT * FROM Emocion`);
        return rows;
    }

    static async getById(id_emocion) {
        const [rows] = await db.query(
            `SELECT * FROM Emocion WHERE id_emocion = ?`,
            [id_emocion]
        );
        return rows[0] ?? null;
    }

    static async getByUsuario(id_usuario) {
        const [rows] = await db.query(
            `SELECT * FROM Emocion WHERE id_usuario = ? OR id_usuario IS NULL`,
            [id_usuario]
        );
        return rows;
    }

    static async getByCategoria(categoria) {
        const [rows] = await db.query(
            `SELECT * FROM Emocion WHERE categoria = ?`,
            [categoria]
        );
        return rows;
    }
}