// Módulo de Estilos de Aprendizaje
import { db } from "../config/db.js";

export class PreguntaEA {

    static async getAll() {
        const [rows] = await db.query(
            `SELECT * FROM Pregunta_EA`
        );
        return rows;
    }

    static async getById(id_pregunta) {
        const [rows] = await db.query(
            `SELECT * FROM Pregunta_EA WHERE id_pregunta = ?`,
            [id_pregunta]
        );
        return rows[0];
    }
 
    static async getWithOpciones(id_pregunta) {
        const [rows] = await db.query(
            `SELECT 
                p.id_pregunta,
                p.texto_pregunta,
                o.id_opcion,
                o.texto_opcion,
                o.categoria
             FROM Pregunta_EA p
             LEFT JOIN Opcion_VARK o ON o.id_pregunta = p.id_pregunta 
             WHERE p.id_pregunta = ?`,
            [id_pregunta]
        );
        return rows;
    }
 
    static async getAllWithOpciones() {
        const [rows] = await db.query(
            `SELECT 
                p.id_pregunta,
                p.texto_pregunta,
                o.id_opcion,
                o.texto_opcion,
                o.categoria
             FROM Pregunta_EA p
             LEFT JOIN Opcion_VARK o ON o.id_pregunta = p.id_pregunta
             ORDER BY p.id_pregunta, o.id_opcion`
        );
        return rows;
    }
}