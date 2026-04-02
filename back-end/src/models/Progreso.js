// src/models/Progreso.js
import { db } from "../config/db.js";

export class Progreso {
    constructor({ id_intento, id_contenido, visto = false }) {
        this.id_intento   = id_intento;
        this.id_contenido = id_contenido;
        this.visto        = visto;
    }

    async save() {
        return await db.query(
            `INSERT INTO Progreso (id_intento, id_contenido, visto)
             VALUES (?, ?, ?)`,
            [this.id_intento, this.id_contenido, this.visto]
        );
    }

    static async getByIntento(id_intento) {
        const [rows] = await db.query(
            `SELECT p.*, c.titulo, c.orden
             FROM Progreso p
             JOIN Contenido c ON p.id_contenido = c.id_contenido
             WHERE p.id_intento = ?
             ORDER BY c.orden ASC`,
            [id_intento]
        );
        return rows;
    }

    static async getByIntentoYContenido(id_intento, id_contenido) {
        const [rows] = await db.query(
            "SELECT * FROM Progreso WHERE id_intento = ? AND id_contenido = ?",
            [id_intento, id_contenido]
        );
        return rows[0];
    }

    static async marcarVisto(id_intento, id_contenido) {
        return await db.query(
            `INSERT INTO Progreso (id_intento, id_contenido, visto, fecha_visto)
             VALUES (?, ?, TRUE, NOW())
             ON DUPLICATE KEY UPDATE visto = TRUE, fecha_visto = NOW()`,
            [id_intento, id_contenido]
        );
    }

    static async getPorcentajeCompletado(id_intento, id_curso) {
        const [[{ total }]] = await db.query(
            `SELECT COUNT(*) AS total
             FROM Contenido c
             JOIN Seccion_Curso s ON c.id_seccion = s.id_seccion
             WHERE s.id_curso = ?`,
            [id_curso]
        );
        const [[{ vistos }]] = await db.query(
            "SELECT COUNT(*) AS vistos FROM Progreso WHERE id_intento = ? AND visto = TRUE",
            [id_intento]
        );
        return total > 0 ? Math.round((vistos / total) * 100) : 0;
    }
}