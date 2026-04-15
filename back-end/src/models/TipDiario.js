// dashboard administrador
import { db } from "../config/db.js";

export class TipDiario {
  constructor({ fecha, frase_id, id_usuario }) {
    this.fecha = fecha;
    this.frase_id = frase_id;
    this.id_usuario = id_usuario;
  }

  async save() {
    return await db.query(
      `INSERT INTO tip_diario (fecha, frase_id, id_usuario)
       VALUES (?, ?, ?)`,
      [this.fecha, this.frase_id, this.id_usuario]
    );
  }

  // 🔹 Obtener tip de un usuario en una fecha
  static async getByFecha(fecha, id_usuario) {
    const [rows] = await db.query(
      `SELECT td.fecha, f.frase
       FROM tip_diario td
       JOIN Frase_Random f ON td.frase_id = f.id_frase
       WHERE td.fecha = ? AND td.id_usuario = ?`,
      [fecha, id_usuario]
    );
    return rows[0];
  }

  // 🔹 Obtener historial de tips del usuario
  static async getAll(id_usuario) {
    const [rows] = await db.query(
      `SELECT td.fecha, f.frase
       FROM tip_diario td
       JOIN Frase_Random f ON td.frase_id = f.id_frase
       WHERE td.id_usuario = ?
       ORDER BY td.fecha DESC`,
      [id_usuario]
    );
    return rows;
  }
}