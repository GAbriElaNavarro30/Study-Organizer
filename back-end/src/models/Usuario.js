// ============================== MÓDULO USUARIOS ===============================
import { db } from "../config/db.js";

export class Usuario {
    constructor({
        nombre,
        apellido,
        correo_electronico,
        correo_alternativo = null,
        contrasena,
        id_rol,
        telefono = null,
        fecha_nacimiento = null,
        genero = null,
        descripcion = null,
        foto_perfil = null,
        foto_portada = null,
    }) {
        this.nombre = nombre;
        this.apellido = apellido;
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
            (nombre, apellido, correo_electronico, correo_alternativo, contrasena, telefono, fecha_nacimiento, genero, descripcion, foto_perfil, foto_portada, id_rol)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                this.nombre,
                this.apellido,
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
                u.nombre,
                u.apellido,
                u.correo_electronico,
                u.correo_alternativo,
                u.telefono,
                u.genero,
                u.fecha_nacimiento,
                u.id_rol,
                r.tipo_rol AS rol
            FROM Usuario u
            LEFT JOIN Rol r ON u.id_rol = r.id_rol
        `);
        return rows;
    }

    static async search(q) {
        let sql = `
            SELECT u.id_usuario, u.nombre, u.apellido, u.correo_electronico,
                u.telefono, u.genero, u.fecha_nacimiento, u.id_rol,
                r.tipo_rol AS rol
            FROM Usuario u
            JOIN Rol r ON u.id_rol = r.id_rol
        `;
        const params = [];
        if (q) {
            sql += ` WHERE CAST(u.id_usuario AS CHAR) LIKE ? OR u.nombre LIKE ? OR u.apellido LIKE ?
                OR u.correo_electronico LIKE ? OR u.telefono LIKE ? OR u.genero LIKE ?
                OR DATE_FORMAT(u.fecha_nacimiento, '%d/%m/%Y') LIKE ? OR r.tipo_rol LIKE ?`;
            const like = `%${q}%`;
            params.push(like, like, like, like, like, like, like, like);
        }
        const [rows] = await db.query(sql, params);
        return rows;
    }

    static async update(id, data) {
        let query = `UPDATE Usuario SET nombre=?, apellido=?, correo_electronico=?, telefono=?, genero=?, fecha_nacimiento=?, id_rol=?`;
        const params = [data.nombre, data.apellido, data.correo_electronico, data.telefono, data.genero, data.fecha_nacimiento, data.id_rol];

        if (data.contrasena && data.contrasena.trim() !== "") {
            const salt = await bcrypt.genSalt(10);
            params.push(await bcrypt.hash(data.contrasena, salt));
            query += `, contrasena=?`;
        }
        query += ` WHERE id_usuario=?`;
        params.push(id);
        return await db.query(query, params);
    }

    static async delete(id) {
        const [resultado] = await db.query(
            "DELETE FROM Usuario WHERE id_usuario = ?",
            [id]
        );
        return resultado;
    }

    static async getById(id) {
        const [rows] = await db.query(
            "SELECT * FROM Usuario WHERE id_usuario = ?",
            [id]
        );
        return rows[0];
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