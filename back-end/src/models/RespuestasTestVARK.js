import { db } from "../config/db.js";

export class RespuestasTestVARK {
 
    // Guardar todas respuestas de todas las preguntas de un intento en una sola consulta
    static async saveMany(id_intento, ids_opciones) {
        const valores = ids_opciones.map(id_opcion => [id_intento, id_opcion]);
        const [result] = await db.query(
            `INSERT INTO Respuestas_Test_VARK (id_intento, id_opcion) VALUES ?`,
            [valores]
        );
        return result;
    }

    // ver respuestar de un intento
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
 
}