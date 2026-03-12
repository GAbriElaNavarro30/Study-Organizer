// ====================== MÓDULO CORREO DESTINATARIO =========================
import { db } from "../config/db.js";

export class CorreoDestinatario {
    constructor({
        correo_electronico,
        nombre = null,
        id_usuario,
    }) {
        this.correo_electronico = correo_electronico;
        this.nombre = nombre;
        this.id_usuario = id_usuario;
    }

    async save() {
        const [result] = await db.query(
            `INSERT INTO CorreoDestinatario 
            (correo_electronico, nombre, id_usuario)
            VALUES (?, ?, ?)`,
            [
                this.correo_electronico,
                this.nombre,
                this.id_usuario,
            ]
        );
        return result;
    }

    static async getAll(id_usuario) {
        const [rows] = await db.query(
            `SELECT * FROM CorreoDestinatario 
             WHERE id_usuario = ? 
             ORDER BY fecha_creacion DESC`,
            [id_usuario]
        );
        return rows;
    }

    static async getById(id_correo_destinatario, id_usuario) {
        const [rows] = await db.query(
            `SELECT * FROM CorreoDestinatario 
             WHERE id_correo_destinatario = ? AND id_usuario = ?`,
            [id_correo_destinatario, id_usuario]
        );
        return rows[0];
    }

    static async getByCorreo(correo_electronico, id_usuario) {
        const [rows] = await db.query(
            `SELECT * FROM CorreoDestinatario 
             WHERE correo_electronico = ? AND id_usuario = ?`,
            [correo_electronico, id_usuario]
        );
        return rows[0];
    }

    static async delete(id_correo_destinatario, id_usuario) {
        const [result] = await db.query(
            `DELETE FROM CorreoDestinatario 
             WHERE id_correo_destinatario = ? AND id_usuario = ?`,
            [id_correo_destinatario, id_usuario]
        );
        return result;
    }
}