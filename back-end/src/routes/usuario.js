import { Router } from "express";
import { Usuario } from "../models/Usuario.js";
import { Rol } from "../models/Rol.js";
import { db } from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { verificarToken } from "../middlewares/auth.js";

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

    // 🍪 COOKIE HttpOnly
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
    "SELECT id_usuario, nombre_usuario, correo_electronico, id_rol FROM Usuario WHERE id_usuario = ?",
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
      rol: usuario.id_rol
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


export default router;