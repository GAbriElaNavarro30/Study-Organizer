// model/Registro_Frase_Diaria.js
/*import { db } from "../config/db.js";

export class Registro_Frase_Diaria {
    constructor({ fecha_registro_frase, frase, id_usuario }) {
        this.fecha_registro_frase = fecha_registro_frase;
        this.frase = frase;
        this.id_usuario = id_usuario;
    }

    // Guarda o reemplaza el tip diario del usuario
    async save() {
        const [result] = await db.query(
            `INSERT INTO Registro_Frase_Diaria (fecha_registro_frase, frase, id_usuario)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE frase = VALUES(frase)`,
            [this.fecha_registro_frase, this.frase, this.id_usuario]
        );
        return result;
    }

    // Obtener el tip del día actual para un usuario
    static async getToday(id_usuario) {
        const [rows] = await db.query(
            `SELECT rfd.id_registro_frase, rfd.fecha_registro_frase, rfd.id_usuario,
                    f.id_frase, f.frase AS texto_frase, f.tipo
             FROM Registro_Frase_Diaria rfd
             JOIN Frase f ON f.id_frase = rfd.frase
             WHERE rfd.id_usuario = ? AND rfd.fecha_registro_frase = CURDATE()`,
            [id_usuario]
        );
        return rows[0] ?? null;
    }

    // Asignar (o reutilizar) el tip diario para hoy
    static async assignOrGetToday(id_usuario) {
        const existing = await Registro_Frase_Diaria.getToday(id_usuario);
        if (existing) return existing;

        const [frases] = await db.query(
            `SELECT id_frase FROM Frase
             WHERE tipo = 'Estudiante'
             ORDER BY RAND() LIMIT 1`
        );
        if (!frases.length) return null;

        const id_frase = frases[0].id_frase;
        const hoy = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

        const registro = new Registro_Frase_Diaria({
            fecha_registro_frase: hoy,
            frase: id_frase,
            id_usuario,
        });
        await registro.save();

        return Registro_Frase_Diaria.getToday(id_usuario);
    }

    // Historial de tips de un usuario
    static async getByUsuario(id_usuario) {
        const [rows] = await db.query(
            `SELECT rfd.id_registro_frase, rfd.fecha_registro_frase, rfd.id_usuario,
                    f.id_frase, f.frase AS texto_frase, f.tipo
             FROM Registro_Frase_Diaria rfd
             JOIN Frase f ON f.id_frase = rfd.frase
             WHERE rfd.id_usuario = ?
             ORDER BY rfd.fecha_registro_frase DESC`,
            [id_usuario]
        );
        return rows;
    }

    // Obtener un registro por su id_registro_frase
    static async getById(id_registro_frase) {
        const [rows] = await db.query(
            `SELECT rfd.id_registro_frase, rfd.fecha_registro_frase, rfd.id_usuario,
                    f.id_frase, f.frase AS texto_frase, f.tipo
             FROM Registro_Frase_Diaria rfd
             JOIN Frase f ON f.id_frase = rfd.frase
             WHERE rfd.id_registro_frase = ?`,
            [id_registro_frase]
        );
        return rows[0] ?? null;
    }

    // Todos los registros (para admin)
    static async getAll() {
        const [rows] = await db.query(
            `SELECT rfd.id_registro_frase, rfd.fecha_registro_frase, rfd.id_usuario,
                    f.id_frase, f.frase AS texto_frase, f.tipo
             FROM Registro_Frase_Diaria rfd
             JOIN Frase f ON f.id_frase = rfd.frase
             ORDER BY rfd.fecha_registro_frase DESC`
        );
        return rows;
    }

    // Eliminar el tip de hoy de un usuario (para regenerar)
    static async deleteTodayByUsuario(id_usuario) {
        const [result] = await db.query(
            `DELETE FROM Registro_Frase_Diaria
             WHERE id_usuario = ? AND fecha_registro_frase = CURDATE()`,
            [id_usuario]
        );
        return result.affectedRows > 0;
    }
}*/