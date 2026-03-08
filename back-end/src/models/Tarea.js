// ============================ MÓDULO DE TAREAS ==============================
import { db } from "../config/db.js";

export class Tarea {
    constructor({
        titulo,
        descripcion = null,
        fecha_tarea,
        hora_tarea,
        estado_tarea = "pendiente",
        recordatorio_activo = true,
        id_usuario,
    }) {
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.fecha_tarea = fecha_tarea;
        this.hora_tarea = hora_tarea;
        this.estado_tarea = estado_tarea;
        this.recordatorio_activo = recordatorio_activo;
        this.id_usuario = id_usuario;
    }

    async save() {
        const [result] = await db.query(
            `INSERT INTO Tarea 
            (titulo, descripcion, fecha_tarea, hora_tarea, estado_tarea, recordatorio_activo, id_usuario)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                this.titulo,
                this.descripcion,
                this.fecha_tarea,
                this.hora_tarea,
                this.estado_tarea,
                this.recordatorio_activo,
                this.id_usuario,
            ]
        );
        return result;
    }

    static async getAll(id_usuario) {
        const [rows] = await db.query(
            `SELECT * FROM Tarea WHERE id_usuario = ? ORDER BY fecha_tarea ASC, hora_tarea ASC`,
            [id_usuario]
        );
        return rows;
    }

    static async getById(id_tarea, id_usuario) {
        const [rows] = await db.query(
            `SELECT * FROM Tarea WHERE id_tarea = ? AND id_usuario = ?`,
            [id_tarea, id_usuario]
        );
        return rows[0];
    }

    static async update(id_tarea, id_usuario, campos) {
        const keys = Object.keys(campos);
        const values = Object.values(campos);

        const setClause = keys.map(k => `${k} = ?`).join(", ");
        values.push(id_tarea, id_usuario);

        const [result] = await db.query(
            `UPDATE Tarea SET ${setClause} WHERE id_tarea = ? AND id_usuario = ?`,
            values
        );
        return result;
    }

    static async delete(id_tarea, id_usuario) {
        const [result] = await db.query(
            `DELETE FROM Tarea WHERE id_tarea = ? AND id_usuario = ?`,
            [id_tarea, id_usuario]
        );
        return result;
    }

    static async updateEstado(id_tarea, estado_tarea) {
        const [result] = await db.query(
            `UPDATE Tarea SET estado_tarea = ? WHERE id_tarea = ?`,
            [estado_tarea, id_tarea]
        );
        return result;
    }
}