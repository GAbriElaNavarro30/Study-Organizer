// =========================== MÓDULO DE RECORDATORIOS ===========================
import { db } from "../config/db.js";

export class Recordatorio {
    constructor({
        tipo,
        fecha_envio,
        hora_envio,
        enviado = false,
        id_tarea,
    }) {
        this.tipo = tipo;
        this.fecha_envio = fecha_envio;
        this.hora_envio = hora_envio;
        this.enviado = enviado;
        this.id_tarea = id_tarea;
    }

    async save() {
        const [result] = await db.query(
            `INSERT INTO Recordatorio (tipo, fecha_envio, hora_envio, enviado, id_tarea)
            VALUES (?, ?, ?, ?, ?)`,
            [
                this.tipo,
                this.fecha_envio,
                this.hora_envio,
                this.enviado,
                this.id_tarea,
            ]
        );
        return result;
    }

    static async getByTarea(id_tarea) {
        const [rows] = await db.query(
            `SELECT * FROM Recordatorio WHERE id_tarea = ?`,
            [id_tarea]
        );
        return rows;
    }

    static async getById(id_recordatorio) {
        const [rows] = await db.query(
            `SELECT * FROM Recordatorio WHERE id_recordatorio = ?`,
            [id_recordatorio]
        );
        return rows[0];
    }

    static async marcarEnviado(id_recordatorio) {
        const [result] = await db.query(
            `UPDATE Recordatorio SET enviado = TRUE WHERE id_recordatorio = ?`,
            [id_recordatorio]
        );
        return result;
    }

    static async deleteByTarea(id_tarea) {
        const [result] = await db.query(
            `DELETE FROM Recordatorio WHERE id_tarea = ?`,
            [id_tarea]
        );
        return result;
    }

    static async getPendientes(fechaHora) {
        const [rows] = await db.query(
            `SELECT r.*, t.id_usuario, u.correo_electronico, u.nombre, u.apellido
             FROM Recordatorio r
             JOIN Tarea t ON r.id_tarea = t.id_tarea
             JOIN Usuario u ON t.id_usuario = u.id_usuario
             WHERE CONCAT(r.fecha_envio, ' ', r.hora_envio) = ?
             AND r.enviado = FALSE
             AND t.recordatorio_activo = TRUE`,
            [fechaHora]
        );
        return rows;
    }
}