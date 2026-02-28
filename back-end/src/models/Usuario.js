import { db } from "../config/db.js";

export class Usuario {
    constructor({
        nombre_usuario,
        correo_electronico,
        correo_alternativo,
        contrasena,
        id_rol,
        telefono = null,
        fecha_nacimiento = null,
        genero = null,
        descripcion = null,
        foto_perfil = null,
        foto_portada = null,
    }) {
        // SOLO asignaciones
        this.nombre_usuario = nombre_usuario;
        this.correo_electronico = correo_electronico;
        this.correo_alternativo = correo_alternativo;
        this.contrasena = contrasena;
        this.id_rol = id_rol;
        this.telefono = telefono;
        this.fecha_nacimiento = fecha_nacimiento;
        this.genero = genero;
        this.descripcion = descripcion;
        this.foto_perfil = foto_perfil;
        this.foto_portada = foto_portada;
    }

    async save() {
        return await db.query(
            `INSERT INTO Usuario 
            (nombre_usuario, correo_electronico, correo_alternativo, contrasena, telefono, fecha_nacimiento, genero, descripcion, foto_perfil, foto_portada, id_rol)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                this.nombre_usuario,
                this.correo_electronico,
                this.correo_alternativo,
                this.contrasena,
                this.telefono,
                this.fecha_nacimiento,
                this.genero,
                this.descripcion,
                this.foto_perfil,
                this.foto_portada,
                this.id_rol,
            ]
        );
    }

    static async getAll() {
        const [rows] = await db.query(`
    SELECT 
      u.id_usuario,
      u.nombre_usuario,
      u.correo_electronico,
      u.correo_alternativo,
      u.telefono,
      u.genero,
      u.fecha_nacimiento,
      u.id_rol,  
      r.tipo_usuario AS rol
    FROM Usuario u
    LEFT JOIN Rol r ON u.id_rol = r.id_rol
  `);

        return rows;
    }

    static async getByCorreo(correo) {
        const [rows] = await db.query(
            "SELECT * FROM Usuario WHERE correo_electronico = ?",
            [correo]
        );
        return rows[0];
    }

    static async getByCorreoAlternativo(correo_alternativo) {
        const [rows] = await db.query(
            "SELECT * FROM Usuario WHERE correo_alternativo = ?",
            [correo_alternativo]
        );
        return rows[0];
    }

    static async getByTelefono(telefono) {
        const [rows] = await db.query(
            "SELECT * FROM Usuario WHERE telefono = ?",
            [telefono]
        );
        return rows[0];
    }
}