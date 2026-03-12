// ===================== MÓDULO TELEGRAM DESTINATARIO ========================
import { db } from "../config/db.js";

export class TelegramDestinatario {
    constructor({
        chat_id,
        nombre = null,
        id_usuario,
    }) {
        this.chat_id = chat_id;
        this.nombre = nombre;
        this.id_usuario = id_usuario;
    }

    async save() {
        const [result] = await db.query(
            `INSERT INTO TelegramDestinatario 
            (chat_id, nombre, id_usuario)
            VALUES (?, ?, ?)`,
            [
                this.chat_id,
                this.nombre,
                this.id_usuario,
            ]
        );
        return result;
    }

    static async getAll(id_usuario) {
        const [rows] = await db.query(
            `SELECT * FROM TelegramDestinatario 
             WHERE id_usuario = ? 
             ORDER BY fecha_creacion DESC`,
            [id_usuario]
        );
        return rows;
    }

    static async getById(id_telegram_destinatario, id_usuario) {
        const [rows] = await db.query(
            `SELECT * FROM TelegramDestinatario 
             WHERE id_telegram_destinatario = ? AND id_usuario = ?`,
            [id_telegram_destinatario, id_usuario]
        );
        return rows[0];
    }

    static async getByChatId(chat_id, id_usuario) {
        const [rows] = await db.query(
            `SELECT * FROM TelegramDestinatario 
             WHERE chat_id = ? AND id_usuario = ?`,
            [chat_id, id_usuario]
        );
        return rows[0];
    }

    static async delete(id_telegram_destinatario, id_usuario) {
        const [result] = await db.query(
            `DELETE FROM TelegramDestinatario 
             WHERE id_telegram_destinatario = ? AND id_usuario = ?`,
            [id_telegram_destinatario, id_usuario]
        );
        return result;
    }
}