// modelo para módulo de cursos
// src/models/Curso.js
import { db } from "../config/db.js";

export class Curso {
    constructor({
        titulo,
        descripcion = null,
        foto = null,
        perfil_vark = null,
        es_publicado = false,
        archivado = false,
        id_usuario,
        id_dimension = null,
    }) {
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.foto = foto;
        this.perfil_vark = perfil_vark;
        this.es_publicado = es_publicado;
        this.archivado = archivado;
        this.id_usuario = id_usuario;
        this.id_dimension = id_dimension;
    }

    async save() {
        return await db.query(
            `INSERT INTO Curso (titulo, descripcion, foto, perfil_vark, es_publicado, archivado, id_usuario, id_dimension)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                this.titulo,
                this.descripcion,
                this.foto,
                this.perfil_vark,
                this.es_publicado,
                this.archivado,
                this.id_usuario,
                this.id_dimension,
            ]
        );
    }

    static async getAll() {
        const [rows] = await db.query(`
            SELECT
                c.id_curso,
                c.titulo,
                c.descripcion,
                c.foto,
                c.perfil_vark,
                c.es_publicado,
                c.archivado,
                c.fecha_creacion,
                c.fecha_actualizacion,
                c.id_usuario,
                c.id_dimension,
                u.nombre AS nombre_tutor,
                u.apellido AS apellido_tutor,
                d.nombre_dimension
            FROM Curso c
            LEFT JOIN Usuario u ON c.id_usuario = u.id_usuario
            LEFT JOIN Dimension_Evaluar d ON c.id_dimension = d.id_dimension
        `);
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query(
            `SELECT
                c.*,
                u.nombre AS nombre_tutor,
                u.apellido AS apellido_tutor,
                d.nombre_dimension
            FROM Curso c
            LEFT JOIN Usuario u ON c.id_usuario = u.id_usuario
            LEFT JOIN Dimension_Evaluar d ON c.id_dimension = d.id_dimension
            WHERE c.id_curso = ?`,
            [id]
        );
        return rows[0];
    }

    static async getByUsuario(id_usuario) {
        const [rows] = await db.query(
            "SELECT * FROM Curso WHERE id_usuario = ? ORDER BY fecha_creacion DESC",
            [id_usuario]
        );
        return rows;
    }

    static async getPublicados() {
        const [rows] = await db.query(
            "SELECT * FROM Curso WHERE es_publicado = TRUE ORDER BY fecha_creacion DESC"
        );
        return rows;
    }

    static async update(id, campos) {
        const keys   = Object.keys(campos).map(k => `${k} = ?`).join(", ");
        const values = [...Object.values(campos), id];
        return await db.query(`UPDATE Curso SET ${keys} WHERE id_curso = ?`, values);
    }

    static async delete(id) {
        return await db.query("DELETE FROM Curso WHERE id_curso = ?", [id]);
    }
}