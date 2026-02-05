import { db } from "../config/db.js";

export class Rol {
  constructor({ tipo_usuario }) {
    if (!tipo_usuario || tipo_usuario.trim().length < 3) {
      throw new Error("El tipo de usuario es obligatorio");
    }

    this.tipo_usuario = tipo_usuario;
  }

  async save() {
    await db.query(
      "INSERT INTO Rol (tipo_usuario) VALUES (?)",
      [this.tipo_usuario]
    );
  }

  static async getAll() {
    const [rows] = await db.query("SELECT * FROM Rol");
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.query(
      "SELECT * FROM Rol WHERE id_rol = ?",
      [id]
    );
    return rows[0];
  }
}
