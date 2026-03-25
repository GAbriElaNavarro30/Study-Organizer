import { db } from "../config/db.js";

export class IntentoTest {
    constructor({ tipo_test, id_usuario }) {
        this.tipo_test   = tipo_test;   // 'estilos_aprendizaje' | 'metodos_estudio'
        this.id_usuario  = id_usuario;
    }
 
    async save() {
        const [result] = await db.query(
            `INSERT INTO Intento_Test (tipo_test, id_usuario)
             VALUES (?, ?)`,
            [this.tipo_test, this.id_usuario]
        );
        return result;
    }
 
    static async getAll() {
        const [rows] = await db.query(
            `SELECT 
                it.id_intento,
                it.fecha_intento,
                it.tipo_test,
                it.id_usuario,
                CONCAT(u.nombre, ' ', u.apellido) AS nombre_usuario
             FROM Intento_Test it
             INNER JOIN Usuario u ON u.id_usuario = it.id_usuario
             ORDER BY it.fecha_intento DESC`
        );
        return rows;
    }
 
    static async getById(id_intento) {
        const [rows] = await db.query(
            `SELECT * FROM Intento_Test WHERE id_intento = ?`,
            [id_intento]
        );
        return rows[0];
    }
 
    // Obtener todos los intentos de un usuario
    static async getByUsuario(id_usuario) {
        const [rows] = await db.query(
            `SELECT * FROM Intento_Test
             WHERE id_usuario = ?
             ORDER BY fecha_intento DESC`,
            [id_usuario]
        );
        return rows;
    }
 
    // Obtener el último intento de un usuario para un tipo de test
    static async getUltimoByUsuario(id_usuario, tipo_test) {
        const [rows] = await db.query(
            `SELECT * FROM Intento_Test
             WHERE id_usuario = ? AND tipo_test = ?
             ORDER BY fecha_intento DESC
             LIMIT 1`,
            [id_usuario, tipo_test]
        );
        return rows[0];
    }
 
    /*static async delete(id_intento) {
        const [result] = await db.query(
            `DELETE FROM Intento_Test WHERE id_intento = ?`,
            [id_intento]
        );
        return result;
    }*/
}