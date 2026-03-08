import { db } from "../config/db.js";

export class Rol {
  constructor({ tipo_rol }) {
    if (!tipo_rol || tipo_rol.trim().length < 3) {
      throw new Error("El tipo de usuario es obligatorio");
    }

    this.tipo_rol = tipo_rol;
  }

  async save() {
    await db.query(
      "INSERT INTO Rol (tipo_rol) VALUES (?)",
      [this.tipo_rol]
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
