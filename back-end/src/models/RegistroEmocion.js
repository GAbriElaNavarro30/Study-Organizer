// model/Registro_Emocion.js
import { db } from "../config/db.js";

export class RegistroEmocion {
    constructor({ nivel = "medio", fecha_registro, frase_dia = null, id_emocion, id_usuario }) {
        this.nivel = nivel;
        this.fecha_registro = fecha_registro;
        this.frase_dia = frase_dia;
        this.id_emocion = id_emocion;
        this.id_usuario = id_usuario;
    }

    async save() {
        const [result] = await db.query(
            `INSERT INTO Registro_Emocion (nivel, fecha_registro, frase_dia, id_emocion, id_usuario)
             VALUES (?, ?, ?, ?, ?)`,
            [this.nivel, this.fecha_registro, this.frase_dia, this.id_emocion, this.id_usuario]
        );
        return result;
    }

    static async getAll() {
        const [rows] = await db.query(`
            SELECT 
                re.id_registro,
                re.nivel,
                re.fecha_registro,
                re.frase_dia,
                re.id_usuario,
                e.nombre_emocion,
                e.categoria
            FROM Registro_Emocion re
            LEFT JOIN Emocion e ON re.id_emocion = e.id_emocion
        `);
        return rows;
    }

    static async getById(id_registro) {
        const [rows] = await db.query(
            `SELECT * FROM Registro_Emocion WHERE id_registro = ?`,
            [id_registro]
        );
        return rows[0] ?? null;
    }

    static async getByUsuario(id_usuario) {
        const [rows] = await db.query(`
            SELECT 
                re.id_registro,
                re.nivel,
                re.fecha_registro,
                re.frase_dia,
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
            `SELECT * FROM Registro_Emocion 
             WHERE id_usuario = ? AND DATE(fecha_registro) = ?`,
            [id_usuario, fecha]
        );
        return rows[0] ?? null;
    }
}