// src/models/Inscripcion.js
import { db } from "../config/db.js";

export class Inscripcion {
    constructor({ id_usuario, id_curso }) {
        this.id_usuario = id_usuario;
        this.id_curso = id_curso;
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
            `SELECT
            i.id_inscripcion, i.id_curso, i.fecha_inscripcion,
            c.titulo, c.descripcion, c.foto, c.perfil_vark,
            d.nombre_dimension,
            CONCAT(u.nombre, ' ', u.apellido) AS nombre_tutor,
            -- Total de contenidos del curso
            (SELECT COUNT(*) FROM Contenido co
             JOIN Seccion_Curso sc ON co.id_seccion = sc.id_seccion
             WHERE sc.id_curso = c.id_curso) AS total_contenidos,
            -- Contenidos vistos en el último intento
            COALESCE((
                SELECT COUNT(*) FROM Progreso p
                WHERE p.id_intento = (
                    SELECT ic.id_intento FROM Intento_Curso ic
                    WHERE ic.id_inscripcion = i.id_inscripcion
                    ORDER BY ic.fecha_inicio DESC LIMIT 1
                ) AND p.visto = 1
            ), 0) AS contenidos_vistos,
            -- Porcentaje
            COALESCE((
                SELECT ic2.completado FROM Intento_Curso ic2
                WHERE ic2.id_inscripcion = i.id_inscripcion
                ORDER BY ic2.fecha_inicio DESC LIMIT 1
            ), 0) AS completado
         FROM Inscripcion i
         JOIN Curso c ON i.id_curso = c.id_curso
         LEFT JOIN Dimension_Evaluar d ON c.id_dimension = d.id_dimension
         LEFT JOIN Usuario u ON c.id_usuario = u.id_usuario
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