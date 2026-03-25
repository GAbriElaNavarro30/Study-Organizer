// estilos de aprendiaje
import { db } from "../config/db.js";
 
export class OpcionVARK {
    /*constructor({ texto_opcion, categoria, id_pregunta }) {
        this.texto_opcion = texto_opcion;
        this.categoria   = categoria;   // 'V' | 'A' | 'R' | 'K'
        this.id_pregunta = id_pregunta;
    }

    async save() {
        const [result] = await db.query(
            `INSERT INTO Opcion_VARK (texto_opcion, categoria, id_pregunta)
             VALUES (?, ?, ?)`,
            [this.texto_opcion, this.categoria, this.id_pregunta]
        );
        return result;
    }*/
 
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
 
    /*static async delete(id_opcion) {
        const [result] = await db.query(
            `DELETE FROM Opcion_VARK WHERE id_opcion = ?`,
            [id_opcion]
        );
        return result;
    }*/
}