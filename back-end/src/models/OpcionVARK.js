// Módulo de Estilos de Aprendiaje
import { db } from "../config/db.js";

export class OpcionVARK {
    
    static async getAll() {
        const [rows] = await db.query(
            `SELECT * FROM Opcion_VARK`
        );
        return rows;
    }

    static async getById(id_opcion) {
        const [rows] = await db.query(
            `SELECT * FROM Opcion_VARK WHERE id_opcion = ?`,
            [id_opcion]
        );
        return rows[0];
    }
 
    static async getByPregunta(id_pregunta) {
        const [rows] = await db.query(
            `SELECT * FROM Opcion_VARK WHERE id_pregunta = ?`,
            [id_pregunta]
        );
        return rows;
    }

}