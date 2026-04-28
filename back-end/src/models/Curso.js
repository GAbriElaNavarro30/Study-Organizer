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
        era_publicado = false,
        id_usuario,
        id_dimension = null,
    }) {
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.foto = foto;
        this.perfil_vark = perfil_vark;
        this.es_publicado = es_publicado;
        this.archivado = archivado;
        this.era_publicado = era_publicado;
        this.id_usuario = id_usuario;
        this.id_dimension = id_dimension;
    }

    async save() {
        return await db.query(
            `INSERT INTO Curso (titulo, descripcion, foto, perfil_vark, es_publicado, archivado, era_publicado, id_usuario, id_dimension)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                this.titulo, this.descripcion, this.foto, this.perfil_vark,
                this.es_publicado, this.archivado, this.era_publicado,
                this.id_usuario, this.id_dimension,
            ]
        );
    }

    static async getAll() {
        const [rows] = await db.query(`
            SELECT c.id_curso, c.titulo, c.descripcion, c.foto, c.perfil_vark,
                   c.es_publicado, c.archivado, c.era_publicado,
                   c.fecha_creacion, c.fecha_actualizacion, c.id_usuario, c.id_dimension,
                   u.nombre AS nombre_tutor, u.apellido AS apellido_tutor,
                   d.nombre_dimension
            FROM Curso c
            LEFT JOIN Usuario u ON c.id_usuario = u.id_usuario
            LEFT JOIN Dimension_Evaluar d ON c.id_dimension = d.id_dimension
        `);
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query(
            `SELECT c.*, u.nombre AS nombre_tutor, u.apellido AS apellido_tutor, d.nombre_dimension
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
            `SELECT c.id_curso, c.titulo, c.descripcion, c.foto,
                    c.perfil_vark, c.es_publicado, c.archivado,
                    c.fecha_creacion, c.fecha_actualizacion,
                    d.nombre_dimension,
                    (SELECT COUNT(*) FROM Seccion_Curso sc WHERE sc.id_curso = c.id_curso) AS total_secciones,
                    (SELECT COUNT(*) FROM Inscripcion i WHERE i.id_curso = c.id_curso) AS total_estudiantes
             FROM Curso c
             LEFT JOIN Dimension_Evaluar d ON c.id_dimension = d.id_dimension
             WHERE c.id_usuario = ?
             ORDER BY c.fecha_creacion DESC`,
            [id_usuario]
        );
        return rows;
    }

    static async getPublicados() {
        const [rows] = await db.query(
            `SELECT * FROM Curso WHERE es_publicado = TRUE AND archivado = FALSE ORDER BY fecha_creacion DESC`
        );
        return rows;
    }

    static async update(id, campos) {
        const keys = Object.keys(campos).map(k => `${k} = ?`).join(", ");
        const values = [...Object.values(campos), id];
        return await db.query(`UPDATE Curso SET ${keys} WHERE id_curso = ?`, values);
    }

    static async delete(id) {
        return await db.query("DELETE FROM Curso WHERE id_curso = ?", [id]);
    }

    static async getCursoCompleto(id_curso) {
        const [cursoRows] = await db.query(
            `SELECT c.*, u.nombre AS nombre_tutor, u.apellido AS apellido_tutor, d.nombre_dimension
             FROM Curso c
             LEFT JOIN Usuario u ON c.id_usuario = u.id_usuario
             LEFT JOIN Dimension_Evaluar d ON c.id_dimension = d.id_dimension
             WHERE c.id_curso = ?`,
            [id_curso]
        );
        if (!cursoRows[0]) return null;
        const curso = cursoRows[0];

        const [secciones] = await db.query(
            `SELECT * FROM Seccion_Curso WHERE id_curso = ? ORDER BY orden ASC`,
            [id_curso]
        );
        for (const seccion of secciones) {
            const [contenidos] = await db.query(
                `SELECT * FROM Contenido WHERE id_seccion = ? ORDER BY orden ASC`,
                [seccion.id_seccion]
            );
            seccion.contenidos = contenidos;
            const [preguntas] = await db.query(
                `SELECT * FROM Pregunta_Test WHERE id_seccion = ?`,
                [seccion.id_seccion]
            );
            for (const pregunta of preguntas) {
                const [opciones] = await db.query(
                    `SELECT * FROM Opcion_Test WHERE id_test = ?`,
                    [pregunta.id_test]
                );
                pregunta.opciones = opciones;
            }
            seccion.preguntas = preguntas;
        }
        curso.secciones = secciones;

        const [[{ total_estudiantes }]] = await db.query(
            "SELECT COUNT(*) AS total_estudiantes FROM Inscripcion WHERE id_curso = ?",
            [id_curso]
        );
        curso.total_estudiantes = total_estudiantes;
        return curso;
    }

    static async tieneInscritos(id_curso) {
        const [[{ total }]] = await db.query(
            "SELECT COUNT(*) AS total FROM Inscripcion WHERE id_curso = ?",
            [id_curso]
        );
        return total > 0;
    }

    static async getRecomendadosPorPerfil(id_usuario, perfil, limit = 20) {
        const letras = perfil.toUpperCase().split("").filter(l => ["V", "A", "R", "K"].includes(l));
        if (letras.length === 0) return [];
        const placeholders = letras.map(() => "perfil_vark LIKE ?").join(" OR ");
        const likeParams = letras.map(l => `%${l}%`);
        const [rows] = await db.query(
            `SELECT c.id_curso, c.titulo, c.descripcion, c.foto,
                    c.perfil_vark, c.fecha_creacion,
                    d.nombre_dimension,
                    CONCAT_WS(' ', u.nombre, u.apellido) AS nombre_tutor,
                    (SELECT COUNT(*) FROM Seccion_Curso sc WHERE sc.id_curso = c.id_curso) AS total_secciones
             FROM Curso c
             LEFT JOIN Dimension_Evaluar d ON c.id_dimension = d.id_dimension
             LEFT JOIN Usuario u ON c.id_usuario = u.id_usuario
             WHERE c.es_publicado = 1 AND c.archivado = 0 AND c.id_usuario != ?
               AND (${placeholders})
             ORDER BY CASE WHEN c.perfil_vark = ? THEN 0 ELSE 1 END, c.fecha_creacion DESC
             LIMIT ?`,
            [id_usuario, ...likeParams, perfil.toUpperCase(), limit]
        );
        return rows;
    }

    static async getPorDimensionYPerfil(perfil, dimensionIds = [], limit = 12) {
        const letras = perfil.toUpperCase().split("").filter(l => ["V", "A", "R", "K"].includes(l));
        if (letras.length === 0) return [];
        let dimFilter = "";
        let dimParams = [];
        if (dimensionIds.length > 0) {
            dimFilter = `AND c.id_dimension IN (${dimensionIds.map(() => "?").join(",")})`;
            dimParams = dimensionIds;
        }
        const [rows] = await db.query(
            `SELECT c.id_curso, c.titulo, c.descripcion, c.foto,
                    c.perfil_vark, c.fecha_creacion,
                    d.nombre_dimension, d.id_dimension,
                    CONCAT_WS(' ', u.nombre, u.apellido) AS nombre_tutor,
                    (SELECT COUNT(*) FROM Seccion_Curso sc WHERE sc.id_curso = c.id_curso) AS total_secciones
             FROM Curso c
             LEFT JOIN Dimension_Evaluar d ON c.id_dimension = d.id_dimension
             LEFT JOIN Usuario u ON c.id_usuario = u.id_usuario
             WHERE c.es_publicado = 1 AND c.archivado = 0 AND c.perfil_vark = ?
               ${dimFilter}
             ORDER BY c.fecha_creacion DESC
             LIMIT ?`,
            [perfil.toUpperCase(), ...dimParams, limit]
        );
        return rows;
    }

    /* ─────────────────────────────────────────────────────────
       getCursosEstudiante
       Usa SUM(sc.total_contenidos) en lugar del subquery lento.
       Devuelve contenidos_vistos, total_contenidos, completado
       para que el hook pueda calcular porcentaje = vistos/total.
    ───────────────────────────────────────────────────────── */
    static async getCursosEstudiante(id_usuario) {
        const [rows] = await db.query(
            `SELECT
                c.id_curso, c.titulo, c.descripcion, c.foto,
                c.perfil_vark, c.archivado,
                d.nombre_dimension,
                CONCAT_WS(' ', u.nombre, u.apellido) AS nombre_tutor,
                (SELECT COUNT(*) FROM Seccion_Curso sc WHERE sc.id_curso = c.id_curso) AS total_secciones,
                i.fecha_inscripcion,
                COALESCE(
                    (SELECT COUNT(DISTINCT p.id_contenido)
                     FROM Progreso p
                     JOIN Intento_Curso it2 ON p.id_intento = it2.id_intento
                     WHERE it2.id_inscripcion = i.id_inscripcion
                       AND p.visto = 1
                       AND it2.id_intento = (
                           SELECT it3.id_intento FROM Intento_Curso it3
                           WHERE it3.id_inscripcion = i.id_inscripcion
                           ORDER BY it3.fecha_inicio DESC LIMIT 1
                       )),
                    0
                ) AS contenidos_vistos,
                COALESCE(
                    (SELECT SUM(sc2.total_contenidos)
                     FROM Seccion_Curso sc2
                     WHERE sc2.id_curso = c.id_curso),
                    0
                ) AS total_contenidos,
                COALESCE(
                    (SELECT it4.completado FROM Intento_Curso it4
                     WHERE it4.id_inscripcion = i.id_inscripcion
                     ORDER BY it4.fecha_inicio DESC LIMIT 1),
                    0
                ) AS completado
             FROM Inscripcion i
             JOIN Curso c ON i.id_curso = c.id_curso
             LEFT JOIN Dimension_Evaluar d ON c.id_dimension = d.id_dimension
             LEFT JOIN Usuario u ON c.id_usuario = u.id_usuario
             WHERE i.id_usuario = ?
               AND c.archivado = 0
             ORDER BY i.fecha_inscripcion DESC`,
            [id_usuario]
        );
        return rows;
    }

    /* ─────────────────────────────────────────────────────────
       getCursosEstudianteArchivados — misma lógica, archivado = 1
    ───────────────────────────────────────────────────────── */
    static async getCursosEstudianteArchivados(id_usuario) {
        const [rows] = await db.query(
            `SELECT
                c.id_curso, c.titulo, c.descripcion, c.foto,
                c.perfil_vark, c.archivado,
                d.nombre_dimension,
                CONCAT_WS(' ', u.nombre, u.apellido) AS nombre_tutor,
                i.fecha_inscripcion,
                COALESCE(
                    (SELECT COUNT(DISTINCT p.id_contenido)
                     FROM Progreso p
                     JOIN Intento_Curso it2 ON p.id_intento = it2.id_intento
                     WHERE it2.id_inscripcion = i.id_inscripcion
                       AND p.visto = 1),
                    0
                ) AS contenidos_vistos,
                COALESCE(
                    (SELECT SUM(sc2.total_contenidos)
                     FROM Seccion_Curso sc2
                     WHERE sc2.id_curso = c.id_curso),
                    0
                ) AS total_contenidos,
                COALESCE(
                    (SELECT it4.completado FROM Intento_Curso it4
                     WHERE it4.id_inscripcion = i.id_inscripcion
                     ORDER BY it4.fecha_inicio DESC LIMIT 1),
                    0
                ) AS completado
             FROM Inscripcion i
             JOIN Curso c ON i.id_curso = c.id_curso
             LEFT JOIN Dimension_Evaluar d ON c.id_dimension = d.id_dimension
             LEFT JOIN Usuario u ON c.id_usuario = u.id_usuario
             WHERE i.id_usuario = ?
               AND c.archivado = 1
             ORDER BY i.fecha_inscripcion DESC`,
            [id_usuario]
        );
        return rows;
    }

    static async getCursoParaEstudiante(id_curso) {
        const [rows] = await db.query(
            `SELECT c.*, d.nombre_dimension,
                    u.nombre AS nombre_tutor, u.apellido AS apellido_tutor,
                    u.foto_perfil AS foto_tutor, u.descripcion AS descripcion_tutor,
                    u.correo_electronico AS correo_tutor, u.telefono AS telefono_tutor
             FROM Curso c
             LEFT JOIN Dimension_Evaluar d ON c.id_dimension = d.id_dimension
             LEFT JOIN Usuario u ON c.id_usuario = u.id_usuario
             WHERE c.id_curso = ?`,
            [id_curso]
        );
        return rows[0];
    }
} 