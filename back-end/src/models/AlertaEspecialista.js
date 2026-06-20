// ============================== MÓDULO ALERTA ESPECIALISTA ==============================
import { db } from "../config/db.js";

export class AlertaEspecialista {
    constructor({
        fecha_alerta,
        dias_consecutivos,
        vista = false,
        id_usuario,
    }) {
        this.fecha_alerta = fecha_alerta;
        this.dias_consecutivos = dias_consecutivos;
        this.vista = vista;
        this.id_usuario = id_usuario;
    }

    async save() {
        return await db.query(
            `INSERT INTO Alerta_Especialista (fecha_alerta, dias_consecutivos, vista, id_usuario)
             VALUES (?, ?, ?, ?)`,
            [this.fecha_alerta, this.dias_consecutivos, this.vista, this.id_usuario]
        );
    }

    static async getAll() {
        const [rows] = await db.query(`SELECT * FROM Alerta_Especialista`);
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query(
            `SELECT * FROM Alerta_Especialista WHERE id_alerta = ?`,
            [id]
        );
        return rows[0];
    }

    static async getByUsuario(id_usuario) {
        const [rows] = await db.query(
            `SELECT * FROM Alerta_Especialista 
             WHERE id_usuario = ? 
             ORDER BY fecha_alerta DESC`,
            [id_usuario]
        );
        return rows;
    }

    static async getNoVistas(id_usuario) {
        const [rows] = await db.query(
            `SELECT * FROM Alerta_Especialista 
             WHERE id_usuario = ? AND vista = FALSE 
             ORDER BY fecha_alerta DESC`,
            [id_usuario]
        );
        return rows;
    }

    static async marcarVista(id_alerta, id_usuario) {
        return await db.query(
            `UPDATE Alerta_Especialista 
             SET vista = TRUE 
             WHERE id_alerta = ? AND id_usuario = ?`,
            [id_alerta, id_usuario]
        );
    }

    static async existeAlertaReciente(id_usuario, dias = 14) {
        const [rows] = await db.query(
            `SELECT id_alerta FROM Alerta_Especialista
             WHERE id_usuario = ?
             AND fecha_alerta >= DATE_SUB(NOW(), INTERVAL ? DAY)
             LIMIT 1`,
            [id_usuario, dias]
        );
        return rows.length > 0;
    }
}