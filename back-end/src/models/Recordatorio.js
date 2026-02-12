import { db } from "../config/db.js";

export class Recordatorio {
    constructor({
        titulo,
        descripcion = null,
        fecha,
        hora,
        estado = "pendiente",
        enviado = false,
        fecha_envio_real = null,
        id_usuario,
    }) {
        // SOLO asignaciones
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.fecha = fecha;
        this.hora = hora;
        this.estado = estado;
        this.enviado = enviado;
        this.fecha_envio_real = fecha_envio_real;
        this.id_usuario = id_usuario;
    }

    // ======================= CREAR RECORDATORIO =======================
    async save() {
        return await db.query(
            `INSERT INTO Recordatorio
            (titulo, descripcion, fecha, hora, estado, enviado, fecha_envio_real, id_usuario)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                this.titulo,
                this.descripcion,
                this.fecha,
                this.hora,
                this.estado,
                this.enviado,
                this.fecha_envio_real,
                this.id_usuario,
            ]
        );
    }

    // ======================= OBTENER TODOS =======================
    static async getAll() {
        const [rows] = await db.query(`
            SELECT 
                r.id_recordatorio,
                r.titulo,
                r.descripcion,
                r.fecha,
                r.hora,
                r.estado,
                r.enviado,
                r.fecha_envio_real,
                r.created_at,
                u.nombre_usuario,
                u.correo_electronico
            FROM Recordatorio r
            INNER JOIN Usuario u ON r.id_usuario = u.id_usuario
            ORDER BY r.fecha, r.hora
        `);

        return rows;
    }

    // ======================= OBTENER POR USUARIO =======================
    static async getByUsuario(id_usuario) {
        const [rows] = await db.query(
            `SELECT * FROM Recordatorio 
             WHERE id_usuario = ?
             ORDER BY fecha, hora`,
            [id_usuario]
        );
        return rows;
    }

    // ======================= OBTENER POR ESTADO =======================
    static async getByEstado(id_usuario, estado) {
        const [rows] = await db.query(
            `SELECT * FROM Recordatorio 
             WHERE id_usuario = ? AND estado = ?
             ORDER BY fecha, hora`,
            [id_usuario, estado]
        );
        return rows;
    }

    // ======================= OBTENER UNO =======================
    static async getById(id_recordatorio) {
        const [rows] = await db.query(
            `SELECT * FROM Recordatorio WHERE id_recordatorio = ?`,
            [id_recordatorio]
        );
        return rows[0];
    }

    // ======================= ACTUALIZAR =======================
    static async update(id_recordatorio, data) {
        return await db.query(
            `UPDATE Recordatorio
             SET titulo = ?, descripcion = ?, fecha = ?, hora = ?, estado = ?
             WHERE id_recordatorio = ?`,
            [
                data.titulo,
                data.descripcion,
                data.fecha,
                data.hora,
                data.estado,
                id_recordatorio,
            ]
        );
    }

    // ======================= MARCAR COMO ENVIADO =======================
    static async marcarEnviado(id_recordatorio) {
        return await db.query(
            `UPDATE Recordatorio
             SET enviado = true, fecha_envio_real = NOW()
             WHERE id_recordatorio = ?`,
            [id_recordatorio]
        );
    }

    // ======================= ELIMINAR =======================
    static async delete(id_recordatorio) {
        return await db.query(
            `DELETE FROM Recordatorio WHERE id_recordatorio = ?`,
            [id_recordatorio]
        );
    }
}