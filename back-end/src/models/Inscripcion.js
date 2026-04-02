// src/models/Inscripcion.js
import { db } from "../config/db.js";

export class Inscripcion {
    constructor({ id_usuario, id_curso }) {
        this.id_usuario = id_usuario;
        this.id_curso   = id_curso;
    }

    async save() {
        return await db.query(
            `INSERT INTO Inscripcion (id_usuario, id_curso)
             VALUES (?, ?)`,
            [this.id_usuario, this.id_curso]
        );
    }

    static async getByUsuario(id_usuario) {
        const [rows] = await db.query(
            `SELECT i.*, c.titulo, c.descripcion, c.foto, c.perfil_vark
             FROM Inscripcion i
             JOIN Curso c ON i.id_curso = c.id_curso
             WHERE i.id_usuario = ?
             ORDER BY i.fecha_inscripcion DESC`,
            [id_usuario]
        );
        return rows;
    }

    static async getByCurso(id_curso) {
        const [rows] = await db.query(
            `SELECT i.*, u.nombre, u.apellido, u.correo_electronico
             FROM Inscripcion i
             JOIN Usuario u ON i.id_usuario = u.id_usuario
             WHERE i.id_curso = ?`,
            [id_curso]
        );
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query(
            "SELECT * FROM Inscripcion WHERE id_inscripcion = ?",
            [id]
        );
        return rows[0];
    }

    static async getByUsuarioYCurso(id_usuario, id_curso) {
        const [rows] = await db.query(
            "SELECT * FROM Inscripcion WHERE id_usuario = ? AND id_curso = ?",
            [id_usuario, id_curso]
        );
        return rows[0];
    }

    static async delete(id) {
        return await db.query("DELETE FROM Inscripcion WHERE id_inscripcion = ?", [id]);
    }
}