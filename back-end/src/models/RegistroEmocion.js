// ============================== MÓDULO REGISTRO EMOCION ==============================
import { db } from "../config/db.js";

export class RegistroEmocion {
    constructor({
        fecha_registro,
        id_emocion,
        id_usuario,
    }) {
        this.fecha_registro = fecha_registro;
        this.id_emocion = id_emocion;
        this.id_usuario = id_usuario;
    }

    async save() {
        return await db.query(
            `INSERT INTO Registro_Emocion (fecha_registro, id_emocion, id_usuario)
            VALUES (?, ?, ?)`,
            [this.fecha_registro, this.id_emocion, this.id_usuario]
        );
    }

    static async getAll() {
        const [rows] = await db.query(`
            SELECT 
                re.id_registro,
                re.fecha_registro,
                re.id_usuario,
                e.nombre_emocion,
                e.categoria
            FROM Registro_Emocion re
            LEFT JOIN Emocion e ON re.id_emocion = e.id_emocion
        `);
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query(
            "SELECT * FROM Registro_Emocion WHERE id_registro = ?",
            [id]
        );
        return rows[0];
    }

    static async getByUsuario(id_usuario) {
        const [rows] = await db.query(`
            SELECT 
                re.id_registro,
                re.fecha_registro,
                e.nombre_emocion,
                e.categoria
            FROM Registro_Emocion re
            LEFT JOIN Emocion e ON re.id_emocion = e.id_emocion
            WHERE re.id_usuario = ?
            ORDER BY re.fecha_registro DESC
        `, [id_usuario]);
        return rows;
    }

    static async getByFecha(id_usuario, fecha) {
        const [rows] = await db.query(
            "SELECT * FROM Registro_Emocion WHERE id_usuario = ? AND fecha_registro = ?",
            [id_usuario, fecha]
        );
        return rows[0];
    }
}