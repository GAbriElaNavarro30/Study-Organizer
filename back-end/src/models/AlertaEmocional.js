// ============================== MÓDULO ALERTA EMOCIONAL ==============================
import { db } from "../config/db.js";

export class AlertaEmocional {
    constructor({
        fecha_alerta,
        tipo,
        mensaje,
        visto = false,
        id_usuario,
    }) {
        this.fecha_alerta = fecha_alerta;
        this.tipo = tipo;
        this.mensaje = mensaje;
        this.visto = visto;
        this.id_usuario = id_usuario;
    }

    async save() {
        return await db.query(
            `INSERT INTO Alerta_Emocional (fecha_alerta, tipo, mensaje, visto, id_usuario)
            VALUES (?, ?, ?, ?, ?)`,
            [this.fecha_alerta, this.tipo, this.mensaje, this.visto, this.id_usuario]
        );
    }

    static async getAll() {
        const [rows] = await db.query(`SELECT * FROM Alerta_Emocional`);
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query(
            "SELECT * FROM Alerta_Emocional WHERE id_alerta = ?",
            [id]
        );
        return rows[0];
    }

    static async getByUsuario(id_usuario) {
        const [rows] = await db.query(
            "SELECT * FROM Alerta_Emocional WHERE id_usuario = ? ORDER BY fecha_creacion DESC",
            [id_usuario]
        );
        return rows;
    }

    static async getNoVistas(id_usuario) {
        const [rows] = await db.query(
            "SELECT * FROM Alerta_Emocional WHERE id_usuario = ? AND visto = FALSE ORDER BY fecha_creacion DESC",
            [id_usuario]
        );
        return rows;
    }

    static async marcarVisto(id_alerta) {
        return await db.query(
            "UPDATE Alerta_Emocional SET visto = TRUE WHERE id_alerta = ?",
            [id_alerta]
        );
    }
}