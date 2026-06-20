// Módulo de Estilos de Aprendizaje
import { db } from "../config/db.js";

export class PerfilVARK {

    static async getAll() {
        const [rows] = await db.query(
            `SELECT * FROM Perfil_VARK`
        );
        return rows;
    }

    static async getById(perfil_dominante) {
        const [rows] = await db.query(
            `SELECT * FROM Perfil_VARK WHERE perfil_dominante = ?`,
            [perfil_dominante]
        );
        return rows[0];
    }
} 