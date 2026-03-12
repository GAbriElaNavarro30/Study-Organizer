// ========================= MÓDULO NOTA COMPARTIDA ==========================
import { db } from "../config/db.js";

export class NotaCompartida {
    constructor({
        medio,
        id_correo_destinatario = null,
        id_telegram_destinatario = null,
        id_nota,
    }) {
        this.medio = medio;
        this.id_correo_destinatario = id_correo_destinatario;
        this.id_telegram_destinatario = id_telegram_destinatario;
        this.id_nota = id_nota;
    }

    async save() {
        const [result] = await db.query(
            `INSERT INTO NotaCompartida 
            (medio, id_correo_destinatario, id_telegram_destinatario, id_nota)
            VALUES (?, ?, ?, ?)`,
            [
                this.medio,
                this.id_correo_destinatario,
                this.id_telegram_destinatario,
                this.id_nota,
            ]
        );
        return result;
    }

    static async getByNota(id_nota) {
        const [rows] = await db.query(
            `SELECT 
                nc.*,
                cd.correo_electronico,
                cd.nombre AS nombre_correo,
                td.chat_id,
                td.nombre AS nombre_telegram
             FROM NotaCompartida nc
             LEFT JOIN CorreoDestinatario cd ON nc.id_correo_destinatario = cd.id_correo_destinatario
             LEFT JOIN TelegramDestinatario td ON nc.id_telegram_destinatario = td.id_telegram_destinatario
             WHERE nc.id_nota = ?
             ORDER BY nc.fecha_envio DESC`,
            [id_nota]
        );
        return rows;
    }

    static async getById(id_nota_compartida) {
        const [rows] = await db.query(
            `SELECT * FROM NotaCompartida WHERE id_nota_compartida = ?`,
            [id_nota_compartida]
        );
        return rows[0];
    }

    static async deleteByNota(id_nota) {
        const [result] = await db.query(
            `DELETE FROM NotaCompartida WHERE id_nota = ?`,
            [id_nota]
        );
        return result;
    }
}