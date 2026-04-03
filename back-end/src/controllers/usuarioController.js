import { Usuario } from "../models/Usuario.js";
import { db } from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cloudinary from "../config/cloudinary.js";
import { transporter } from "../config/mailer.js";

/* ====================================================
--------------- FUNCIONES DE VALIDACIÓN ---------------
=====================================================*/
function validarNombre(nombre) {
    const errores = [];
    if (!nombre || !nombre.trim()) {
        errores.push({ path: "nombre", message: "El nombre es obligatorio" });
    } else {
        const nombreRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ.\s]+$/;
        if (!nombreRegex.test(nombre)) {
            errores.push({ path: "nombre", message: "El nombre solo puede contener letras, espacios y acentos" });
        }
    }
    return errores;
}

function validarApellido(apellido) {
    const errores = [];
    if (!apellido || !apellido.trim()) {
        errores.push({ path: "apellido", message: "El apellido es obligatorio" });
    } else {
        const apellidoRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ.\s]+$/;
        if (!apellidoRegex.test(apellido)) {
            errores.push({ path: "apellido", message: "El apellido solo puede contener letras, espacios y acentos" });
        }
    }
    return errores;
}

async function validarCorreoElectronico(correo, idUsuarioActual = null) {
    const errores = [];
    if (!correo || correo.trim() === "") {
        errores.push({ path: "correo_electronico", message: "El correo electrónico es obligatorio" });
        return errores;
    }
    const correoRegex = /^(?!\.)(?!.*\.\.)([a-zA-Z0-9]+([._-]?[a-zA-Z0-9]+)*)@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    if (!correoRegex.test(correo)) {
        errores.push({ path: "correo_electronico", message: "El correo electrónico no cumple con un formato válido" });
        return errores;
    }
    const parteUsuario = correo.split("@")[0];
    if (parteUsuario.length > 64) {
        errores.push({ path: "correo_electronico", message: "El correo no debe superar 64 caracteres antes del @" });
        return errores;
    }
    let query = "SELECT id_usuario FROM Usuario WHERE correo_electronico = ?";
    const params = [correo];
    if (idUsuarioActual) { query += " AND id_usuario != ?"; params.push(idUsuarioActual); }
    const [resultado] = await db.query(query, params);
    if (resultado.length > 0) {
        errores.push({ path: "correo_electronico", message: "Este correo electrónico ya está registrado" });
    }
    return errores;
}

async function validarCorreoAlternativo(correoAlternativo, correo, idUsuarioActual = null) {
    const errores = [];
    if (!correoAlternativo || correoAlternativo.trim() === "") return errores;
    if (correoAlternativo.trim().toLowerCase() === correo.trim().toLowerCase()) {
        errores.push({ path: "correo_alternativo", message: "El correo alternativo no puede ser igual al correo principal" });
        return errores;
    }
    const correoRegex = /^(?!\.)(?!.*\.\.)([a-zA-Z0-9]+([._-]?[a-zA-Z0-9]+)*)@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    if (!correoRegex.test(correoAlternativo)) {
        errores.push({ path: "correo_alternativo", message: "El correo alternativo no cumple con un formato válido" });
        return errores;
    }
    const parteUsuario = correoAlternativo.split("@")[0];
    if (parteUsuario.length > 64) {
        errores.push({ path: "correo_alternativo", message: "El correo alternativo no debe superar 64 caracteres antes del @" });
    }
    return errores;
}

async function validarRol(id_rol) {
    const errores = [];
    if (!id_rol) {
        errores.push({ path: "id_rol", message: "El rol es obligatorio" });
    } else if (isNaN(id_rol)) {
        errores.push({ path: "id_rol", message: "El rol no es válido" });
    } else {
        const [rolExiste] = await db.query("SELECT id_rol FROM Rol WHERE id_rol = ?", [id_rol]);
        if (rolExiste.length === 0) {
            errores.push({ path: "id_rol", message: "El rol seleccionado no existe" });
        }
    }
    return errores;
}

async function validarTelefono(telefono, idUsuarioActual = null) {
    const errores = [];
    if (!telefono || telefono.trim() === "") {
        errores.push({ path: "telefono", message: "El teléfono es obligatorio" });
        return errores;
    }
    const telefonoRegex = /^[0-9]{10}$/;
    if (!telefonoRegex.test(telefono)) {
        errores.push({ path: "telefono", message: "El teléfono debe tener 10 dígitos numéricos" });
        return errores;
    }
    let query = "SELECT id_usuario FROM Usuario WHERE telefono = ?";
    const params = [telefono];
    if (idUsuarioActual) { query += " AND id_usuario != ?"; params.push(idUsuarioActual); }
    const [resultado] = await db.query(query, params);
    if (resultado.length > 0) {
        errores.push({ path: "telefono", message: "Este número de teléfono ya está registrado" });
    }
    return errores;
}

function validarGenero(genero) {
    const errores = [];
    if (!genero || !genero.trim()) {
        errores.push({ path: "genero", message: "El género es obligatorio" });
    } else {
        const generosValidos = ["mujer", "hombre", "otro"];
        if (!generosValidos.includes(genero)) {
            errores.push({ path: "genero", message: "El género seleccionado no es válido" });
        }
    }
    return errores;
}

function validarContrasena(contrasena) {
    const errores = [];
    if (!contrasena || contrasena.trim() === "") return errores;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$¡*])[A-Za-z\d@#$¡*]{6,}$/;
    if (!passwordRegex.test(contrasena)) {
        errores.push({ path: "contrasena", message: "La contraseña debe tener al menos 6 caracteres, incluir una mayúscula, una minúscula, un número y un carácter especial (@ # $ ¡ *)" });
    }
    return errores;
}

function validarFechaNacimiento(fechaNacimientoInput) {
    const errores = [];
    const hoy = new Date();
    if (!fechaNacimientoInput) {
        errores.push({ path: "fecha_nacimiento", message: "La fecha de nacimiento es obligatoria" });
    } else {
        const fechaNacimiento = new Date(fechaNacimientoInput);
        if (isNaN(fechaNacimiento.getTime())) {
            errores.push({ path: "fecha_nacimiento", message: "La fecha de nacimiento no es válida" });
        } else {
            if (fechaNacimiento >= hoy) {
                errores.push({ path: "fecha_nacimiento", message: "La fecha de nacimiento no puede ser hoy ni una fecha futura" });
            }
            const fechaMinima = new Date(hoy.getFullYear() - 13, hoy.getMonth(), hoy.getDate());
            if (fechaNacimiento > fechaMinima) {
                errores.push({ path: "fecha_nacimiento", message: "Debes tener al menos 13 años" });
            }
            const fechaMaxima = new Date(hoy.getFullYear() - 120, hoy.getMonth(), hoy.getDate());
            if (fechaNacimiento < fechaMaxima) {
                errores.push({ path: "fecha_nacimiento", message: "La edad no puede ser mayor a 120 años" });
            }
        }
    }
    return errores;
}

/* ====================================================
--------------------- CONTROLLERS ---------------------
=====================================================*/

// ============== VERIFICAR CORREO ==============
export const verificarCorreo = async (req, res) => {
    try {
        const { correo_electronico, id_usuario } = req.body;
        if (!correo_electronico) {
            return res.status(400).json({ disponible: false, message: "El correo es requerido" });
        }
        let query = "SELECT id_usuario FROM Usuario WHERE correo_electronico = ?";
        const params = [correo_electronico.trim().toLowerCase()];
        if (id_usuario) { query += " AND id_usuario != ?"; params.push(id_usuario); }
        const correoExiste = await db.query(query, params);
        if (correoExiste[0].length > 0) {
            return res.status(200).json({ disponible: false, message: "Este correo electrónico ya está registrado" });
        }
        res.status(200).json({ disponible: true, message: "Correo disponible" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ disponible: false, message: "Error al verificar el correo" });
    }
};

// ============== VERIFICAR TELÉFONO ==============
export const verificarTelefono = async (req, res) => {
    try {
        const { telefono, id_usuario } = req.body;
        if (!telefono) {
            return res.status(400).json({ disponible: false, message: "El teléfono es requerido" });
        }
        let query = "SELECT id_usuario FROM Usuario WHERE telefono = ?";
        const params = [telefono.trim()];
        if (id_usuario) { query += " AND id_usuario != ?"; params.push(id_usuario); }
        const telefonoExiste = await db.query(query, params);
        if (telefonoExiste[0].length > 0) {
            return res.status(200).json({ disponible: false, message: "Este número de teléfono ya está registrado" });
        }
        res.status(200).json({ disponible: true, message: "Teléfono disponible" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ disponible: false, message: "Error al verificar el teléfono" });
    }
};

// ============== CREAR USUARIO (REGISTRO) ==============
export const crearUsuario = async (req, res) => {
    try {
        const data = { ...req.body, id_rol: Number(req.body.id_rol) };
        const errores = [];
        errores.push(...validarNombre(data.nombre));
        errores.push(...validarApellido(data.apellido));
        errores.push(...await validarCorreoElectronico(data.correo_electronico));
        errores.push(...await validarRol(data.id_rol));
        errores.push(...await validarTelefono(data.telefono));
        errores.push(...validarGenero(data.genero));
        if (!data.contrasena || data.contrasena.trim() === "") {
            errores.push({ path: "contrasena", message: "La contraseña es obligatoria" });
        } else {
            errores.push(...validarContrasena(data.contrasena));
        }
        errores.push(...validarFechaNacimiento(data.fecha_nacimiento));
        if (errores.length > 0) return res.status(400).json({ errors: errores });
        const salt = await bcrypt.genSalt(10);
        data.contrasena = await bcrypt.hash(data.contrasena, salt);
        const usuario = new Usuario(data);
        await usuario.save();
        res.status(201).json({ mensaje: "Usuario creado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al crear el usuario", error: error.message });
    }
};

// ============== LOGIN ==============
export const login = async (req, res) => {
    const { correo_electronico, contrasena } = req.body;
    try {
        const errores = [];
        if (!correo_electronico || !correo_electronico.trim()) {
            errores.push({ path: "correo_electronico", message: "El correo electrónico es obligatorio" });
        }
        if (!contrasena || !contrasena.trim()) {
            errores.push({ path: "contrasena", message: "La contraseña es obligatoria" });
        }
        if (errores.length > 0) return res.status(400).json({ errors: errores });

        const correoRegex = /^(?!\.)(?!.*\.\.)([a-zA-Z0-9]+([._-]?[a-zA-Z0-9]+)*)@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
        if (!correoRegex.test(correo_electronico)) {
            return res.status(400).json({ errors: [{ path: "correo_electronico", message: "El correo electrónico no cumple con un formato válido" }] });
        }

        const result = await db.query("SELECT * FROM Usuario WHERE correo_electronico = ?", [correo_electronico.trim().toLowerCase()]);
        if (result[0].length === 0) {
            return res.status(404).json({ errors: [{ path: "correo_electronico", message: "Correo electrónico incorrecto, no está registrado" }] });
        }

        const usuario = result[0][0];
        const passwordValida = await bcrypt.compare(contrasena, usuario.contrasena);
        if (!passwordValida) {
            return res.status(401).json({ errors: [{ path: "contrasena", message: "Contraseña incorrecta" }] });
        }

        const token = jwt.sign({ id: usuario.id_usuario, id_rol: usuario.id_rol }, process.env.JWT_SECRET, { expiresIn: "8h" });
        const esProduccion = process.env.NODE_ENV === "production";
        res.cookie("token", token, {
            httpOnly: true,
            secure: esProduccion,
            sameSite: esProduccion ? "none" : "lax",
            maxAge: 2 * 60 * 60 * 1000,
            path: "/"
        });

        const fechaNacimiento = usuario.fecha_nacimiento
            ? { day: new Date(usuario.fecha_nacimiento).getDate(), month: new Date(usuario.fecha_nacimiento).getMonth() + 1, year: new Date(usuario.fecha_nacimiento).getFullYear() }
            : { day: "", month: "", year: "" };

        res.json({
            mensaje: "Inicio de sesión exitoso",
            usuario: {
                id: usuario.id_usuario,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                correo: usuario.correo_electronico,
                rol: usuario.id_rol,
                foto_perfil: usuario.foto_perfil || "/perfil-usuario.png",
                foto_portada: usuario.foto_portada || "/portada.jpg",
                telefono: usuario.telefono,
                descripcion: usuario.descripcion,
                genero: usuario.genero,
                fecha_nacimiento: fechaNacimiento,
            },
        });
    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ errors: [{ path: "general", message: "Error al iniciar sesión. Por favor, intenta de nuevo." }] });
    }
};

// ============== ME ==============
export const me = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT id_usuario, nombre, apellido, correo_electronico, correo_alternativo,
       id_rol, foto_perfil, foto_portada, telefono, contrasena, descripcion, genero, fecha_nacimiento
       FROM Usuario WHERE id_usuario = ?`,
            [req.usuario.id]
        );
        if (rows.length === 0) return res.status(401).json({ mensaje: "Usuario no válido" });

        const usuario = rows[0];
        const fechaNacimiento = usuario.fecha_nacimiento
            ? { day: new Date(usuario.fecha_nacimiento).getDate(), month: new Date(usuario.fecha_nacimiento).getMonth() + 1, year: new Date(usuario.fecha_nacimiento).getFullYear() }
            : { day: "", month: "", year: "" };

        res.json({
            usuario: {
                id: usuario.id_usuario,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                correo: usuario.correo_electronico,
                correo_alternativo: usuario.correo_alternativo || "",
                rol: usuario.id_rol,
                foto_perfil: usuario.foto_perfil || null,
                foto_portada: usuario.foto_portada || "/portada.jpg",
                telefono: usuario.telefono,
                genero: usuario.genero,
                contrasena: usuario.contrasena,
                descripcion: usuario.descripcion,
                fecha_nacimiento: fechaNacimiento,
            },
        });
    } catch (error) {
        console.error("Error en /me:", error);
        res.status(500).json({ mensaje: "Error al obtener datos del usuario" });
    }
};

// ============== LOGOUT ==============
export const logout = (req, res) => {
    const esProduccion = process.env.NODE_ENV === "production";
    res.clearCookie("token", {
        httpOnly: true,
        secure: esProduccion,
        sameSite: esProduccion ? "none" : "lax",
        path: "/"
    });
    res.json({ mensaje: "Sesión cerrada" });
};

// ============== OBTENER USUARIOS ==============
export const obtenerUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.getAll();
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener usuarios" });
    }
};

// ============== ALTA USUARIO (admin) ==============
export const altaUsuario = async (req, res) => {
    try {
        const data = { ...req.body, id_rol: Number(req.body.id_rol) };
        const errores = [];
        errores.push(...validarNombre(data.nombre));
        errores.push(...validarApellido(data.apellido));
        errores.push(...await validarCorreoElectronico(data.correo_electronico));
        errores.push(...await validarRol(data.id_rol));
        errores.push(...await validarTelefono(data.telefono));
        errores.push(...validarGenero(data.genero));
        if (!data.contrasena || data.contrasena.trim() === "") {
            errores.push({ path: "contrasena", message: "La contraseña es obligatoria" });
        } else {
            errores.push(...validarContrasena(data.contrasena));
        }
        errores.push(...validarFechaNacimiento(data.fecha_nacimiento));
        if (errores.length > 0) return res.status(400).json({ errors: errores });
        const salt = await bcrypt.genSalt(10);
        data.contrasena = await bcrypt.hash(data.contrasena, salt);
        const usuario = new Usuario(data);
        await usuario.save();
        res.status(201).json({ mensaje: "Usuario creado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al crear el usuario", error: error.message });
    }
};

// ============== EDITAR USUARIO ==============
export const editarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const data = { ...req.body, id_rol: Number(req.body.id_rol) };
        const errores = [];
        errores.push(...validarNombre(data.nombre));
        errores.push(...validarApellido(data.apellido));
        errores.push(...await validarCorreoElectronico(data.correo_electronico, id));
        errores.push(...await validarRol(data.id_rol));
        errores.push(...await validarTelefono(data.telefono, id));
        errores.push(...validarGenero(data.genero));
        errores.push(...validarFechaNacimiento(data.fecha_nacimiento));
        if (data.contrasena && data.contrasena.trim() !== "") {
            errores.push(...validarContrasena(data.contrasena));
        }
        if (errores.length > 0) return res.status(400).json({ errors: errores });

        let query = `UPDATE Usuario SET nombre=?, apellido=?, correo_electronico=?, telefono=?, genero=?, fecha_nacimiento=?, id_rol=?`;
        const params = [data.nombre, data.apellido, data.correo_electronico, data.telefono, data.genero, data.fecha_nacimiento, data.id_rol];

        if (data.contrasena && data.contrasena.trim() !== "") {
            const salt = await bcrypt.genSalt(10);
            params.push(await bcrypt.hash(data.contrasena, salt));
            query += `, contrasena=?`;
        }
        query += ` WHERE id_usuario=?`;
        params.push(id);
        await db.query(query, params);
        res.json({ mensaje: "Usuario actualizado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al actualizar usuario", error: error.message });
    }
};

// ============== BUSCAR USUARIOS ==============
export const buscarUsuarios = async (req, res) => {
    try {
        const { q } = req.query;
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
        res.json(rows);
    } catch (error) {
        console.error("Error al buscar usuarios:", error);
        res.status(500).json({ message: "Error al buscar usuarios" });
    }
};

// ============== ELIMINAR USUARIO ==============
export const eliminarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const [resultado] = await db.query("DELETE FROM Usuario WHERE id_usuario = ?", [id]);
        if (resultado.affectedRows === 0) return res.status(404).json({ message: "Usuario no encontrado" });
        res.status(200).json({ message: "Usuario eliminado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al eliminar el usuario", error: error.message });
    }
};

// ============== ACTUALIZAR PERFIL ==============
export const actualizarPerfil = async (req, res) => {
    try {
        let { nombre, apellido, correo, correo_alternativo, telefono, descripcion, fechaNacimiento, genero, password } = req.body;
        const errores = [];

        if (nombre) errores.push(...validarNombre(nombre));
        if (apellido) errores.push(...validarApellido(apellido));
        if (correo) errores.push(...await validarCorreoElectronico(correo, req.usuario.id));
        if (correo_alternativo !== undefined) errores.push(...await validarCorreoAlternativo(correo_alternativo, correo));
        if (telefono) errores.push(...await validarTelefono(telefono, req.usuario.id));
        if (genero) errores.push(...validarGenero(genero));
        if (password && password.trim() !== "") errores.push(...validarContrasena(password));

        if (fechaNacimiento) {
            if (typeof fechaNacimiento === "string") fechaNacimiento = JSON.parse(fechaNacimiento);
            if (fechaNacimiento.year && fechaNacimiento.month && fechaNacimiento.day) {
                const pad = (n) => String(n).padStart(2, "0");
                errores.push(...validarFechaNacimiento(`${fechaNacimiento.year}-${pad(fechaNacimiento.month)}-${pad(fechaNacimiento.day)}`));
            }
        }

        if (errores.length > 0) return res.status(400).json({ errors: errores });

        const campos = [], valores = [];
        if (nombre?.trim()) { campos.push("nombre = ?"); valores.push(nombre.trim()); }
        if (apellido?.trim()) { campos.push("apellido = ?"); valores.push(apellido.trim()); }
        if (correo?.trim()) { campos.push("correo_electronico = ?"); valores.push(correo.trim().toLowerCase()); }
        if (correo_alternativo !== undefined) {
            campos.push("correo_alternativo = ?");
            valores.push(correo_alternativo.trim() === "" ? null : correo_alternativo.trim().toLowerCase());
        }
        if (telefono?.trim()) { campos.push("telefono = ?"); valores.push(telefono.trim()); }
        if (descripcion !== undefined) { campos.push("descripcion = ?"); valores.push(descripcion); }
        if (genero) { campos.push("genero = ?"); valores.push(genero); }
        if (password?.trim()) {
            const salt = await bcrypt.genSalt(10);
            campos.push("contrasena = ?");
            valores.push(await bcrypt.hash(password, salt));
        }
        if (fechaNacimiento?.year && fechaNacimiento?.month && fechaNacimiento?.day) {
            const pad = (n) => String(n).padStart(2, "0");
            campos.push("fecha_nacimiento = ?");
            valores.push(`${fechaNacimiento.year}-${pad(fechaNacimiento.month)}-${pad(fechaNacimiento.day)}`);
        }

        const subirCloudinary = async (file) => {
            const base64 = file.buffer.toString("base64");
            const result = await cloudinary.uploader.upload(`data:${file.mimetype};base64,${base64}`, { folder: "fotos_usuarios" });
            return result.secure_url;
        };

        const fotosActualizadas = {};
        if (req.files?.foto_perfil?.length) {
            const url = await subirCloudinary(req.files.foto_perfil[0]);
            campos.push("foto_perfil = ?"); valores.push(url);
            fotosActualizadas.foto_perfil = url;
        }
        if (req.files?.foto_portada?.length) {
            const url = await subirCloudinary(req.files.foto_portada[0]);
            campos.push("foto_portada = ?"); valores.push(url);
            fotosActualizadas.foto_portada = url;
        }

        if (!campos.length) return res.status(400).json({ mensaje: "No hay datos para actualizar" });

        valores.push(req.usuario.id);
        await db.query(`UPDATE Usuario SET ${campos.join(", ")} WHERE id_usuario = ?`, valores);

        const [rows] = await db.query(`
      SELECT u.id_usuario AS id, u.nombre, u.apellido, u.correo_electronico AS correo,
             u.correo_alternativo, u.telefono, u.descripcion, u.genero, u.fecha_nacimiento,
             u.foto_perfil, u.foto_portada, u.id_rol AS rol, r.tipo_rol AS rol_texto
      FROM Usuario u JOIN Rol r ON u.id_rol = r.id_rol
      WHERE u.id_usuario = ?
    `, [req.usuario.id]);

        const usuario = rows[0];
        const fechaNacimientoNormalizada = usuario.fecha_nacimiento
            ? { day: new Date(usuario.fecha_nacimiento).getDate(), month: new Date(usuario.fecha_nacimiento).getMonth() + 1, year: new Date(usuario.fecha_nacimiento).getFullYear() }
            : { day: "", month: "", year: "" };

        res.json({
            mensaje: "Perfil actualizado correctamente",
            usuario: { ...usuario, correo_alternativo: usuario.correo_alternativo || "", fecha_nacimiento: fechaNacimientoNormalizada },
            fotos: fotosActualizadas
        });
    } catch (error) {
        console.error("ERROR actualizar perfil:", error);
        res.status(500).json({ mensaje: "Error al actualizar perfil" });
    }
};

// ============== RECUPERAR CONTRASEÑA ==============
export const recuperarContrasena = async (req, res) => {
    try {
        const { correo_electronico } = req.body;
        if (!correo_electronico?.trim()) return res.status(400).json({ mensaje: "El campo correo electrónico es obligatorio" });

        const correoRegex = /^(?!\.)(?!.*\.\.)([a-zA-Z0-9]+([._-]?[a-zA-Z0-9]+)*)@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
        if (!correoRegex.test(correo_electronico.trim())) return res.status(400).json({ mensaje: "El correo electrónico no cumple con un formato válido" });

        const correoNormalizado = correo_electronico.trim().toLowerCase();
        const [rows] = await db.query("SELECT id_usuario, nombre, apellido FROM Usuario WHERE correo_electronico = ?", [correoNormalizado]);
        if (rows.length === 0) return res.status(404).json({ mensaje: "El correo electrónico no está registrado en el sistema" });

        const usuario = rows[0];
        const token = jwt.sign({ id: usuario.id_usuario }, process.env.JWT_SECRET, { expiresIn: "15m" });
        const link = `${process.env.FRONTEND_URL}/#/recuperar-contrasena?token=${token}`;

        await transporter.sendMail({
            from: `"Soporte Study Organizer" <${process.env.MAIL_USER}>`,
            to: correoNormalizado,
            subject: "Solicitud de recuperación de contraseña",
            html: `
        <p>Estimado/a <strong>${usuario.nombre} ${usuario.apellido}</strong>,</p>
        <p>Hemos recibido una solicitud para restablecer la contraseña de su cuenta en <strong>Study Organizer</strong>.</p>
        <p>Para continuar, haga clic en el siguiente enlace:</p>
        <p><a href="${link}">${link}</a></p>
        <p>Este enlace tiene una vigencia de <strong>15 minutos</strong>.</p>
        <p>Si no realizó esta solicitud, puede ignorar este mensaje.</p>
        <p>Atentamente,<br/><strong>Equipo de Soporte - Study Organizer</strong></p>
      `,
        });

        res.json({ mensaje: "Se ha enviado un enlace de recuperación a tu correo" });
    } catch (error) {
        console.error("Error recuperar contraseña:", error);
        res.status(500).json({ mensaje: "Error al procesar la recuperación de contraseña" });
    }
};

// ============== RESETEAR CONTRASEÑA ==============
export const resetearContrasena = async (req, res) => {
    try {
        const { token, nueva_contrasena } = req.body;
        if (!token?.trim()) return res.status(400).json({ campo: "token", mensaje: "El token es obligatorio" });
        if (!nueva_contrasena?.trim()) return res.status(400).json({ campo: "nueva_contrasena", mensaje: "La nueva contraseña es obligatoria" });

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$¡*])[A-Za-z\d@#$¡*]{6,}$/;
        if (!passwordRegex.test(nueva_contrasena)) return res.status(400).json({ campo: "nueva_contrasena", mensaje: "La contraseña debe tener al menos 6 caracteres, incluir una mayúscula, una minúscula, un número y un carácter especial (@ # $ ¡ *)" });
        if (nueva_contrasena.length > 128) return res.status(400).json({ campo: "nueva_contrasena", mensaje: "La contraseña no puede superar 128 caracteres" });

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            if (error.name === "TokenExpiredError") return res.status(401).json({ campo: "token", mensaje: "El enlace ha expirado. Por favor, solicita un nuevo enlace." });
            return res.status(401).json({ campo: "token", mensaje: "El enlace es inválido o ha sido modificado." });
        }

        const [usuario] = await db.query("SELECT id_usuario FROM Usuario WHERE id_usuario = ?", [decoded.id]);
        if (usuario.length === 0) return res.status(404).json({ campo: "token", mensaje: "El usuario asociado a este enlace no existe." });

        const [usuarioActual] = await db.query("SELECT contrasena FROM Usuario WHERE id_usuario = ?", [decoded.id]);
        const esLaMisma = await bcrypt.compare(nueva_contrasena, usuarioActual[0].contrasena);
        if (esLaMisma) return res.status(400).json({ campo: "nueva_contrasena", mensaje: "La nueva contraseña no puede ser igual a la contraseña actual." });

        const salt = await bcrypt.genSalt(10);
        await db.query("UPDATE Usuario SET contrasena = ? WHERE id_usuario = ?", [await bcrypt.hash(nueva_contrasena, salt), decoded.id]);
        res.json({ mensaje: "Tu contraseña ha sido actualizada correctamente" });
    } catch (error) {
        console.error("Error resetear contraseña:", error);
        res.status(500).json({ campo: "general", mensaje: "Error al procesar la solicitud. Por favor, intenta de nuevo." });
    }
};

// ============== VERIFICAR CORREO ALTERNATIVO ==============
export const verificarCorreoAlternativo = async (req, res) => {
    try {
        const { correo_electronico } = req.body;
        if (!correo_electronico?.trim()) return res.status(400).json({ mensaje: "El correo electrónico es obligatorio" });

        const correoNormalizado = correo_electronico.trim().toLowerCase();
        const [rows] = await db.query("SELECT id_usuario, nombre, apellido, correo_alternativo FROM Usuario WHERE correo_electronico = ?", [correoNormalizado]);
        if (rows.length === 0) return res.status(404).json({ existe: false, mensaje: "El correo electrónico no está registrado en el sistema" });

        const usuario = rows[0];
        if (!usuario.correo_alternativo) {
            return res.status(200).json({ existe: true, tieneAlternativo: false, mensaje: "Lo sentimos, no cuentas con un correo electrónico alternativo." });
        }

        const partes = usuario.correo_alternativo.split("@");
        const correoEnmascarado = `${partes[0].substring(0, 3)}***@${partes[1]}`;
        return res.status(200).json({ existe: true, tieneAlternativo: true, correoEnmascarado, mensaje: `Tienes registrado el correo alternativo: ${correoEnmascarado}` });
    } catch (error) {
        console.error("Error al verificar correo alternativo:", error);
        res.status(500).json({ mensaje: "Error al verificar el correo alternativo" });
    }
};

// ============== RECUPERAR CON ALTERNATIVO ==============
export const recuperarConAlternativo = async (req, res) => {
    try {
        const { correo_electronico } = req.body;
        if (!correo_electronico?.trim()) return res.status(400).json({ mensaje: "El correo electrónico es obligatorio" });

        const correoNormalizado = correo_electronico.trim().toLowerCase();
        const [rows] = await db.query("SELECT id_usuario, nombre, apellido, correo_alternativo FROM Usuario WHERE correo_electronico = ?", [correoNormalizado]);
        if (rows.length === 0) return res.status(404).json({ mensaje: "El correo electrónico no está registrado en el sistema" });

        const usuario = rows[0];
        if (!usuario.correo_alternativo) return res.status(400).json({ mensaje: "Este usuario no tiene correo alternativo registrado" });

        const token = jwt.sign({ id: usuario.id_usuario }, process.env.JWT_SECRET, { expiresIn: "15m" });
        const link = `${process.env.FRONTEND_URL}/#/recuperar-contrasena?token=${token}`;

        await transporter.sendMail({
            from: `"Soporte Study Organizer" <${process.env.MAIL_USER}>`,
            to: usuario.correo_alternativo,
            subject: "Recuperación de contraseña - Correo alternativo",
            html: `
        <p>Estimado/a <strong>${usuario.nombre} ${usuario.apellido}</strong>,</p>
        <p>Hemos recibido una solicitud para restablecer la contraseña de su cuenta en <strong>Study Organizer</strong>.</p>
        <p>Este enlace fue enviado a su correo alternativo registrado:</p>
        <p><a href="${link}">${link}</a></p>
        <p>Este enlace tiene una vigencia de <strong>15 minutos</strong>.</p>
        <p>Si no realizó esta solicitud, puede ignorar este mensaje.</p>
        <p>Atentamente,<br/><strong>Equipo de Soporte - Study Organizer</strong></p>
      `,
        });

        res.json({ mensaje: "Se ha enviado un enlace de recuperación a tu correo alternativo" });
    } catch (error) {
        console.error("Error al enviar enlace alternativo:", error);
        res.status(500).json({ mensaje: "Error al enviar el enlace de recuperación" });
    }
};