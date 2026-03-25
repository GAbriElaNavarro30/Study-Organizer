import { db } from "../config/db.js";
 
export class RespuestasTestVARK {
    /*constructor({ id_intento, id_opcion }) {
        this.id_intento = id_intento;
        this.id_opcion  = id_opcion;
    }

    async save() {
        const [result] = await db.query(
            `INSERT INTO Respuestas_Test_VARK (id_intento, id_opcion)
             VALUES (?, ?)`,
            [this.id_intento, this.id_opcion]
        );
        return result;
    }*/
 
    // Guardar múltiples respuestas de un intento en una sola query (más eficiente)
    static async saveMany(id_intento, ids_opciones) {
        const valores = ids_opciones.map(id_opcion => [id_intento, id_opcion]);
        const [result] = await db.query(
            `INSERT INTO Respuestas_Test_VARK (id_intento, id_opcion) VALUES ?`,
            [valores]
        );
        return result;
    }
 
    static async getByIntento(id_intento) {
        const [rows] = await db.query(
            `SELECT 
                r.id_respuesta_test_vark,
                r.id_intento,
                r.id_opcion,
                o.texto_opcion,
                o.categoria,
                o.id_pregunta
             FROM Respuestas_Test_VARK r
             INNER JOIN Opcion_VARK o ON o.id_opcion = r.id_opcion
             WHERE r.id_intento = ?`,
            [id_intento]
        );
        return rows;
    }
 
    // Contar respuestas por categoría para calcular el resultado
    static async contarPorCategoria(id_intento) {
        const [rows] = await db.query(
            `SELECT 
                o.categoria,
                COUNT(*) AS total
             FROM Respuestas_Test_VARK r
             INNER JOIN Opcion_VARK o ON o.id_opcion = r.id_opcion
             WHERE r.id_intento = ?
             GROUP BY o.categoria`,
            [id_intento]
        );
        return rows;
    }
 
    /*static async deleteByIntento(id_intento) {
        const [result] = await db.query(
            `DELETE FROM Respuestas_Test_VARK WHERE id_intento = ?`,
            [id_intento]
        );
        return result;
    }*/
}