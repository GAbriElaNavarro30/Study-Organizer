// estilos de aprendiaje
import { db } from "../config/db.js";
 
export class OpcionVARK {
    
    // todas las opciones
    static async getAll() {
        const [rows] = await db.query(
            `SELECT * FROM Opcion_VARK`
        );
        return rows;
    }
 
    // una opcion por medio de su id
    static async getById(id_opcion) {
        const [rows] = await db.query(
            `SELECT * FROM Opcion_VARK WHERE id_opcion = ?`,
            [id_opcion]
        );
        return rows[0];
    }
 
    // opciones por pregunta = 4 opciones x pregunta
    static async getByPregunta(id_pregunta) {
        const [rows] = await db.query(
            `SELECT * FROM Opcion_VARK WHERE id_pregunta = ?`,
            [id_pregunta]
        );
        return rows;
    }

}