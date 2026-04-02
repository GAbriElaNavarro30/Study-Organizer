// src/models/Contenido.js
import { db } from "../config/db.js";

export class Contenido {
    constructor({ titulo, contenido = null, orden, id_seccion }) {
        this.titulo     = titulo;
        this.contenido  = contenido;
        this.orden      = orden;
        this.id_seccion = id_seccion;
    }

    async save() {
        return await db.query(
            `INSERT INTO Contenido (titulo, contenido, orden, id_seccion)
             VALUES (?, ?, ?, ?)`,
            [this.titulo, this.contenido, this.orden, this.id_seccion]
        );
    }

    static async getBySeccion(id_seccion) {
        const [rows] = await db.query(
            "SELECT * FROM Contenido WHERE id_seccion = ? ORDER BY orden ASC",
            [id_seccion]
        );
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query(
            "SELECT * FROM Contenido WHERE id_contenido = ?",
            [id]
        );
        return rows[0];
    }

    static async update(id, campos) {
        const keys   = Object.keys(campos).map(k => `${k} = ?`).join(", ");
        const values = [...Object.values(campos), id];
        return await db.query(`UPDATE Contenido SET ${keys} WHERE id_contenido = ?`, values);
    }

    static async delete(id) {
        return await db.query("DELETE FROM Contenido WHERE id_contenido = ?", [id]);
    }
}