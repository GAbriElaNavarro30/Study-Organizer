import { db } from "../config/db.js";

export class Nota {
    constructor({
        titulo,
        contenido = null,
        cloudinary_url,
        cloudinary_public_id,
        id_usuario,
    }) {
        this.titulo = titulo;
        this.contenido = contenido;
        this.cloudinary_url = cloudinary_url;
        this.cloudinary_public_id = cloudinary_public_id;
        this.id_usuario = id_usuario;
    }

    // =========================
    // Crear nota
    // =========================
    async save() {
        const [result] = await db.query(
            `INSERT INTO Nota 
            (titulo, contenido, cloudinary_url, cloudinary_public_id, id_usuario)
            VALUES (?, ?, ?, ?, ?)`,
            [
                this.titulo,
                this.contenido,
                this.cloudinary_url,
                this.cloudinary_public_id,
                this.id_usuario,
            ]
        );

        return result.insertId;
    }

    // =========================
    // Obtener notas por usuario
    // =========================
    static async getByUsuario(id_usuario) {
        const [rows] = await db.query(
            `SELECT 
                id_nota,
                titulo,
                created_at,
                updated_at
            FROM Nota
            WHERE id_usuario = ?
            ORDER BY updated_at DESC`,
            [id_usuario]
        );

        return rows;
    }

    // =========================
    // Obtener una nota por ID
    // =========================
    static async getById(id_nota, id_usuario) {
        const [rows] = await db.query(
            `SELECT *
             FROM Nota
             WHERE id_nota = ? AND id_usuario = ?`,
            [id_nota, id_usuario]
        );

        return rows[0];
    }

    // =========================
    // Actualizar nota
    // =========================
    static async update(id_nota, id_usuario, data) {
        const {
            titulo,
            contenido,
            cloudinary_url,
            cloudinary_public_id,
        } = data;

        const [result] = await db.query(
            `UPDATE Nota SET
                titulo = ?,
                contenido = ?,
                cloudinary_url = ?,
                cloudinary_public_id = ?
             WHERE id_nota = ? AND id_usuario = ?`,
            [
                titulo,
                contenido,
                cloudinary_url,
                cloudinary_public_id,
                id_nota,
                id_usuario,
            ]
        );

        return result.affectedRows;
    }

    // =========================
    // Eliminar nota
    // =========================
    static async delete(id_nota, id_usuario) {
        const [result] = await db.query(
            `DELETE FROM Nota
             WHERE id_nota = ? AND id_usuario = ?`,
            [id_nota, id_usuario]
        );

        return result.affectedRows;
    }
}
