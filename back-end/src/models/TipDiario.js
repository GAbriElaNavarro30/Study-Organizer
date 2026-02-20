import { db } from "../config/db.js";

export class TipDiario {
  constructor({ fecha, frase_id }) {
    this.fecha = fecha;
    this.frase_id = frase_id;
  }

  // Guardar tip del día
  async save() {
    return await db.query(
      `INSERT INTO tip_diario (fecha, frase_id) VALUES (?, ?)`,
      [this.fecha, this.frase_id]
    );
  }

  // Obtener tip del día por fecha
  static async getByFecha(fecha) {
    const [rows] = await db.query(
      `SELECT td.fecha, f.texto 
       FROM tip_diario td
       JOIN frases f ON td.frase_id = f.id
       WHERE td.fecha = ?`,
      [fecha]
    );
    return rows[0];
  }

  // Obtener todos los tips diarios
  static async getAll() {
    const [rows] = await db.query(
      `SELECT td.fecha, f.texto 
       FROM tip_diario td
       JOIN frases f ON td.frase_id = f.id
       ORDER BY td.fecha DESC`
    );
    return rows;
  }
}