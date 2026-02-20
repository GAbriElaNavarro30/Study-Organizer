import { db } from "../config/db.js";

export class Frase {
  constructor({ texto, id = null }) {
    this.id = id;
    this.texto = texto;
  }

  // Guardar frase nueva
  async save() {
    const [result] = await db.query(
      `INSERT INTO frases (texto) VALUES (?)`,
      [this.texto]
    );
    this.id = result.insertId;
    return result;
  }

  // Obtener todas las frases
  static async getAll() {
    const [rows] = await db.query(`SELECT * FROM frases`);
    return rows;
  }

  // Obtener frase por ID
  static async getById(id) {
    const [rows] = await db.query(`SELECT * FROM frases WHERE id = ?`, [id]);
    return rows[0];
  }

  // Actualizar texto de la frase
  async update() {
    if (!this.id) throw new Error("El ID de la frase es requerido");
    return await db.query(
      `UPDATE frases SET texto = ? WHERE id = ?`,
      [this.texto, this.id]
    );
  }

  // Eliminar frase
  async delete() {
    if (!this.id) throw new Error("El ID de la frase es requerido");
    return await db.query(`DELETE FROM frases WHERE id = ?`, [this.id]);
  }
}