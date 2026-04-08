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
                (SELECT COUNT(*) FROM Contenido co
                 JOIN Seccion_Curso sc ON co.id_seccion = sc.id_seccion
                 WHERE sc.id_curso = c.id_curso) AS total_contenidos,
                COALESCE((
                    SELECT COUNT(*) FROM Progreso p
                    WHERE p.id_intento = (
                        SELECT ic.id_intento FROM Intento_Curso ic
                        WHERE ic.id_inscripcion = i.id_inscripcion
                        ORDER BY ic.fecha_inicio DESC LIMIT 1
                    ) AND p.visto = 1
                ), 0) AS contenidos_vistos,
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

    // ========== MÉTODOS NUEVOS ==========

    static async getProgresoEstudiante(id_usuario, id_curso) {
        const inscripcion = await this.getByUsuarioYCurso(id_usuario, id_curso);
        if (!inscripcion) return null;
        
        const [[{ total }]] = await db.query(
            `SELECT COUNT(*) AS total
             FROM Contenido c
             JOIN Seccion_Curso s ON c.id_seccion = s.id_seccion
             WHERE s.id_curso = ?`,
            [id_curso]
        );
        
        const [intentoRows] = await db.query(
            "SELECT * FROM Intento_Curso WHERE id_inscripcion = ? ORDER BY numero_intento DESC LIMIT 1",
            [inscripcion.id_inscripcion]
        );
        const intento = intentoRows[0];
        
        if (!intento) {
            return { total, vistos: 0, porcentaje: 0, completado: false, contenidos_vistos: [] };
        }
        
        const [progresoRows] = await db.query(
            `SELECT p.*, c.titulo, c.orden
             FROM Progreso p
             JOIN Contenido c ON p.id_contenido = c.id_contenido
             WHERE p.id_intento = ?
             ORDER BY c.orden ASC`,
            [intento.id_intento]
        );
        
        const vistos = progresoRows.filter(p => p.visto).length;
        const pct = total > 0 ? Math.round((vistos / total) * 100) : 0;
        
        return {
            id_intento: intento.id_intento,
            total,
            vistos,
            porcentaje: pct,
            completado: intento.completado,
            contenidos_vistos: progresoRows.filter(p => p.visto).map(p => p.id_contenido)
        };
    }

    static async getUltimoResultado(id_usuario, id_curso) {
        const [[row]] = await db.query(
            `SELECT rc.total_preguntas, rc.respuestas_correctas, rc.porcentaje,
                    it.fecha_inicio AS fecha, it.numero_intento
             FROM Resultado_Curso rc
             JOIN Intento_Curso it ON rc.id_intento = it.id_intento
             JOIN Inscripcion i ON it.id_inscripcion = i.id_inscripcion
             WHERE i.id_usuario = ? AND i.id_curso = ?
             ORDER BY rc.id_resultado DESC
             LIMIT 1`,
            [id_usuario, id_curso]
        );
        
        return row || null;
    }

    static async getEstudiantesConDatos(id_curso) {
        const [rows] = await db.query(
            `SELECT
                u.id_usuario, u.nombre, u.apellido,
                u.correo_electronico, u.telefono, u.foto_perfil,
                i.fecha_inscripcion
             FROM Inscripcion i
             INNER JOIN Usuario u ON i.id_usuario = u.id_usuario
             WHERE i.id_curso = ?
             ORDER BY i.fecha_inscripcion DESC`,
            [id_curso]
        );
        
        return rows;
    }
}