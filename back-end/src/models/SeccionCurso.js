// src/models/SeccionCurso.js
import { db } from "../config/db.js";

export class SeccionCurso {
    constructor({ titulo_seccion, descripcion_seccion = null, orden, id_curso }) {
        this.titulo_seccion = titulo_seccion;
        this.descripcion_seccion = descripcion_seccion;
        this.orden = orden;
        this.id_curso = id_curso;
    }

    async save() {
        return await db.query(
            `INSERT INTO Seccion_Curso (titulo_seccion, descripcion_seccion, orden, id_curso)
             VALUES (?, ?, ?, ?)`,
            [this.titulo_seccion, this.descripcion_seccion, this.orden, this.id_curso]
        );
    }

    static async getByCurso(id_curso) {
        const [rows] = await db.query(
            "SELECT * FROM Seccion_Curso WHERE id_curso = ? ORDER BY orden ASC",
            [id_curso]
        );
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query(
            "SELECT * FROM Seccion_Curso WHERE id_seccion = ?",
            [id]
        );
        return rows[0];
    }

    static async update(id, campos) {
        const keys = Object.keys(campos).map(k => `${k} = ?`).join(", ");
        const values = [...Object.values(campos), id];
        return await db.query(`UPDATE Seccion_Curso SET ${keys} WHERE id_seccion = ?`, values);
    }

    static async delete(id) {
        return await db.query("DELETE FROM Seccion_Curso WHERE id_seccion = ?", [id]);
    }

    static async getIdCursoPorSeccion(id_seccion) {
        const [[row]] = await db.query(
            "SELECT id_curso FROM Seccion_Curso WHERE id_seccion = ?",
            [id_seccion]
        );
        return row?.id_curso ?? null;
    }

    /* ── Recalcula total_contenidos contando desde la tabla Contenido ── */
    static async recalcularTotalContenidos(id_seccion) {
        await db.query(
            `UPDATE Seccion_Curso
             SET total_contenidos = (
                 SELECT COUNT(*) FROM Contenido WHERE id_seccion = ?
             )
             WHERE id_seccion = ?`,
            [id_seccion, id_seccion]
        );
    }
}