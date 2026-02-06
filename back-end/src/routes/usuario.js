import { Router } from "express";
import { Usuario } from "../models/Usuario.js";
import { Rol } from "../models/Rol.js";
import { db } from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { verificarToken } from "../middlewares/auth.js";
import cloudinary from "../config/cloudinary.js"; // Asegúrate de la ruta correcta
import multer from "multer";
import fs from "fs/promises"; // Solo si quieres usar archivos temporales (opcional)

// Multer: almacenamiento en memoria (no en disco)
const storage = multer.memoryStorage();
const upload = multer({ storage });
const router = Router();

/* ====================================================
-------------------------- ROLES ----------------------
=====================================================*/
//== obtener roles == 
router.get("/obtener-roles", async (req, res) => {
  try {
    const roles = await Rol.getAll();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener roles" });
  }
});

/* =======================================================
------------------------- REGISTRO -----------------------
========================================================*/
// obtener usuarios
router.get("/obtener-usuarios", async (req, res) => {
  try {
    const usuarios = await Usuario.getAll();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener usuarios" });
  }
});

// registrar usuario
router.post("/crear-usuario", async (req, res) => {
  try {
    const data = { ...req.body, id_rol: Number(req.body.id_rol) };
    const errores = [];

    const correoExiste = await db.query(
      "SELECT id_usuario FROM Usuario WHERE correo_electronico = ?",
      [data.correo_electronico]
    );
    if (correoExiste[0].length > 0) {
      errores.push({
        path: "correo_electronico",
        message: "Este correo electrónico ya está registrado"
      });
    }

    const telefonoExiste = await db.query(
      "SELECT id_usuario FROM Usuario WHERE telefono = ?",
      [data.telefono]
    );
    if (telefonoExiste[0].length > 0) {
      errores.push({
        path: "telefono",
        message: "Este número de teléfono ya está registrado"
      });
    }

    if (errores.length > 0) {
      return res.status(400).json({ errors: errores });
    }

    const usuario = new Usuario(data);
    await usuario.save();

    res.status(201).json({ mensaje: "Usuario creado correctamente" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear el usuario", error: error.message });
  }
});


/* =======================================================
------------------------- LOGIN --------------------------
========================================================*/
router.post("/login", async (req, res) => {
  const { correo_electronico, contrasena } = req.body;

  try {
    // Verificar que se enviaron los datos
    if (!correo_electronico || !contrasena) {
      return res.status(400).json({ mensaje: "Datos incompletos" });
    }

    // Buscar usuario por correo
    const result = await db.query(
      "SELECT * FROM Usuario WHERE correo_electronico = ?",
      [correo_electronico]
    );

    if (result[0].length === 0) {
      // Usuario no encontrado
      return res.status(401).json({ mensaje: "No encontrado" });
    }

    const usuario = result[0][0];

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!passwordValida) {
      // Contraseña incorrecta
      return res.status(401).json({ mensaje: "Contraseña incorrecta" });
    }

    // Crear token JWT
    const token = jwt.sign(
      { id: usuario.id_usuario, id_rol: usuario.id_rol },
      "TU_SECRETO_SUPER_SEGURO",
      { expiresIn: "2h" }
    );

    // COOKIE HttpOnly
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // true cuando uses HTTPS
      sameSite: "lax",
      maxAge: 2 * 60 * 60 * 1000
    });

    // Responder con usuario y token
    res.json({
      usuario: {
        id: usuario.id_usuario,
        nombre: usuario.nombre_usuario,
        correo: usuario.correo_electronico,
        rol: usuario.id_rol
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error en el login" });
  }
});

/* =======================================================
------------------------- Sesiones -----------------------
========================================================*/
router.get("/me", verificarToken, async (req, res) => {
  const [rows] = await db.query(
    "SELECT id_usuario, nombre_usuario, correo_electronico, id_rol, foto_perfil, telefono, contrasena FROM Usuario WHERE id_usuario = ?",
    [req.usuario.id]
  );

  if (rows.length === 0) {
    return res.status(401).json({ mensaje: "Usuario no válido" });
  }

  const usuario = rows[0];

  res.json({
    usuario: {
      id: usuario.id_usuario,
      nombre: usuario.nombre_usuario,
      correo: usuario.correo_electronico,
      rol: usuario.id_rol,
      foto_perfil: usuario.foto_perfil,
      telefono: usuario.telefono,
      contrasena: usuario.contrasena,
    }
  });
});


router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // true solo en https
  });

  res.json({ mensaje: "Sesión cerrada" });
});

/* =======================================================
---------------------- Perfil Usuario --------------------
========================================================*/
// Subir foto de perfil
// PUT /api/usuario
router.put(
  "/actualizar-perfil",
  verificarToken,
  upload.fields([
    { name: "foto_perfil", maxCount: 1 },
    { name: "foto_portada", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const {
        nombre,
        correo,
        telefono,
        descripcion,
        fechaNacimiento,
        genero,
        password
      } = req.body;

      const campos = [];
      const valores = [];

      // ===== CAMPOS NORMALES =====
      if (nombre) campos.push("nombre_usuario = ?"), valores.push(nombre);
      if (correo) campos.push("correo_electronico = ?"), valores.push(correo);
      if (telefono) campos.push("telefono = ?"), valores.push(telefono);
      if (descripcion) campos.push("descripcion = ?"), valores.push(descripcion);
      if (genero) campos.push("genero = ?"), valores.push(genero);

      if (password) {
        const hashed = await bcrypt.hash(password, 10);
        campos.push("contrasena = ?");
        valores.push(hashed);
      }

      if (fechaNacimiento && fechaNacimiento.year && fechaNacimiento.month && fechaNacimiento.day) {
        campos.push("fecha_nacimiento = ?");
        valores.push(`${fechaNacimiento.year}-${fechaNacimiento.month}-${fechaNacimiento.day}`);
      }

      // ===== FOTOS (CLOUDINARY) =====
      const subirArchivoCloudinary = async (file) => {
        const base64 = file.buffer.toString("base64");
        const dataUri = `data:${file.mimetype};base64,${base64}`;
        const result = await cloudinary.uploader.upload(dataUri, {
          folder: "fotos_usuarios",
          resource_type: "image"
        });
        return result.secure_url;
      };

      // Solo sube si hay archivos nuevos
      if (req.files?.foto_perfil?.length > 0) {
        const file = req.files.foto_perfil[0];
        const urlPerfil = await subirArchivoCloudinary(file);
        campos.push("foto_perfil = ?");
        valores.push(urlPerfil);
      }

      if (req.files?.foto_portada?.length > 0) {
        const file = req.files.foto_portada[0];
        const urlPortada = await subirArchivoCloudinary(file);
        campos.push("foto_portada = ?");
        valores.push(urlPortada);
      }

      if (campos.length === 0) {
        return res.status(400).json({ mensaje: "No hay datos para actualizar" });
      }

      // id_usuario del token
      valores.push(req.usuario.id);

      const sql = `UPDATE Usuario SET ${campos.join(", ")} WHERE id_usuario = ?`;
      await db.query(sql, valores);

      res.json({ mensaje: "Perfil actualizado correctamente" });
    } catch (error) {
      console.error("ERROR actualizar perfil:", error);
      res.status(500).json({ mensaje: "Error al actualizar perfil" });
    }
  }
);




export default router;