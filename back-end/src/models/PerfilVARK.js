// estilos de aprendizaje - perfiles VARK
import { db } from "../config/db.js";

export class PerfilVARK {

    // todos los perfiles
    static async getAll() {
        const [rows] = await db.query(
            `SELECT * FROM Perfil_VARK`
        );
        return rows;
    }

    // un perfil específico
    static async getById(perfil_dominante) {
        const [rows] = await db.query(
            `SELECT * FROM Perfil_VARK WHERE perfil_dominante = ?`,
            [perfil_dominante]
        );
        return rows[0];
    }
}