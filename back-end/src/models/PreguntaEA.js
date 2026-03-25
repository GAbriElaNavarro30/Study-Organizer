// estilos de aprendizaje - preguntas
import { db } from "../config/db.js";
 
export class PreguntaEA {
    /*constructor({ texto_pregunta }) {
        this.texto_pregunta = texto_pregunta;
    }
 
    async save() {
        const [result] = await db.query(
            `INSERT INTO Pregunta_EA (texto_pregunta) VALUES (?)`,
            [this.texto_pregunta]
        );
        return result;
    }*/
 
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
 
    // Obtener pregunta con todas sus opciones VARK
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
 
    // Obtener todas las preguntas con sus opciones (para mostrar el test completo)
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
 
    /*static async delete(id_pregunta) {
        const [result] = await db.query(
            `DELETE FROM Pregunta_EA WHERE id_pregunta = ?`,
            [id_pregunta]
        );
        return result;
    }*/
}