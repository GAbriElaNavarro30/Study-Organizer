// model/Frase_Diaria.js
import { db } from "../config/db.js";

export class Frase_Diaria {
    constructor({ fecha, frase, id_usuario }) {
        this.fecha = fecha;
        this.frase = frase;
        this.id_usuario = id_usuario;
    }

    // Guarda o reemplaza el tip diario del usuario
    async save() {
        const [result] = await db.query(
            `INSERT INTO Frase_Diaria (fecha, frase, id_usuario)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE frase = VALUES(frase)`,
            [this.fecha, this.frase, this.id_usuario]
        );
        return result;
    }

    // Obtener el tip del día actual para un usuario
    static async getToday(id_usuario) {
        const [rows] = await db.query(
            `SELECT fd.id_tip, fd.fecha, fd.frase, fd.id_usuario,
                    f.frase AS texto_frase, f.tipo
             FROM Frase_Diaria fd
             JOIN Frase f ON f.id_frase = fd.frase
             WHERE fd.id_usuario = ? AND fd.fecha = CURDATE()`,
            [id_usuario]
        );
        return rows[0] ?? null;
    }

    // Asignar (o reutilizar) el tip diario para hoy
    // Retorna la frase existente o asigna una nueva aleatoria
    static async assignOrGetToday(id_usuario) {
        // ¿Ya tiene tip hoy?
        const existing = await Frase_Diaria.getToday(id_usuario);
        if (existing) return existing;

        // Obtener una frase aleatoria para estudiante
        const [frases] = await db.query(
            `SELECT id_frase FROM Frase
             WHERE tipo = 'Estudiante'
             ORDER BY RAND() LIMIT 1`
        );
        if (!frases.length) return null;

        const id_frase = frases[0].id_frase;
        const hoy = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

        const tip = new Frase_Diaria({
            fecha: hoy,
            frase: id_frase,
            id_usuario,
        });
        await tip.save();

        return Frase_Diaria.getToday(id_usuario);
    }

    // Historial de tips de un usuario
    static async getByUsuario(id_usuario) {
        const [rows] = await db.query(
            `SELECT fd.id_tip, fd.fecha, fd.frase AS id_frase,
                    f.frase AS texto_frase, f.tipo
             FROM Frase_Diaria fd
             JOIN Frase f ON f.id_frase = fd.frase
             WHERE fd.id_usuario = ?
             ORDER BY fd.fecha DESC`,
            [id_usuario]
        );
        return rows;
    }

    // Obtener un registro por su id_tip
    static async getById(id_tip) {
        const [rows] = await db.query(
            `SELECT fd.id_tip, fd.fecha, fd.id_usuario,
                    f.id_frase, f.frase AS texto_frase, f.tipo
             FROM Frase_Diaria fd
             JOIN Frase f ON f.id_frase = fd.frase
             WHERE fd.id_tip = ?`,
            [id_tip]
        );
        return rows[0] ?? null;
    }

    // Todos los tips (para admin)
    static async getAll() {
        const [rows] = await db.query(
            `SELECT fd.id_tip, fd.fecha, fd.id_usuario,
                    f.id_frase, f.frase AS texto_frase, f.tipo
             FROM Frase_Diaria fd
             JOIN Frase f ON f.id_frase = fd.frase
             ORDER BY fd.fecha DESC`
        );
        return rows;
    }

    // Eliminar tip de hoy de un usuario (para regenerar)
    static async deleteTodayByUsuario(id_usuario) {
        const [result] = await db.query(
            `DELETE FROM Frase_Diaria
             WHERE id_usuario = ? AND fecha = CURDATE()`,
            [id_usuario]
        );
        return result.affectedRows > 0;
    }
}