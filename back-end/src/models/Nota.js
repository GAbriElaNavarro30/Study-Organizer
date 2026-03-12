// ============================== MÓDULO NOTAS ===============================
import { db } from "../config/db.js";

export class Nota {
    constructor({
        titulo,
        contenido = null,
        color_fondo = '#ffffff',
        tipo_letra = 'Arial',
        tamano_letra = '16',
        id_usuario,
    }) {
        this.titulo = titulo;
        this.contenido = contenido;
        this.color_fondo = color_fondo;
        this.tipo_letra = tipo_letra;
        this.tamano_letra = tamano_letra;
        this.id_usuario = id_usuario;
    }

    async save() {
        const [result] = await db.query(
            `INSERT INTO Nota 
            (titulo, contenido, color_fondo, tipo_letra, tamano_letra, id_usuario)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                this.titulo,
                this.contenido,
                this.color_fondo,
                this.tipo_letra,
                this.tamano_letra,
                this.id_usuario,
            ]
        );
        return result;
    }

    static async getAll(id_usuario) {
        const [rows] = await db.query(
            `SELECT * FROM Nota WHERE id_usuario = ? 
             ORDER BY fecha_actualizacion DESC`,
            [id_usuario]
        );
        return rows;
    }

    static async getById(id_nota, id_usuario) {
        const [rows] = await db.query(
            `SELECT * FROM Nota WHERE id_nota = ? AND id_usuario = ?`,
            [id_nota, id_usuario]
        );
        return rows[0];
    }

    static async update(id_nota, id_usuario, campos) {
        const keys = Object.keys(campos);
        const values = Object.values(campos);
        const setClause = keys.map(k => `${k} = ?`).join(", ");
        values.push(id_nota, id_usuario);

        const [result] = await db.query(
            `UPDATE Nota SET ${setClause} WHERE id_nota = ? AND id_usuario = ?`,
            values
        );
        return result;
    }

    static async delete(id_nota, id_usuario) {
        const [result] = await db.query(
            `DELETE FROM Nota WHERE id_nota = ? AND id_usuario = ?`,
            [id_nota, id_usuario]
        );
        return result;
    }
}