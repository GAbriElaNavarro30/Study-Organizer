import { Router } from "express";
import { Usuario } from "../models/Usuario.js";
import { Rol } from "../models/Rol.js";
import { db } from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { verificarToken } from "../middlewares/auth.js";
import cloudinary from "../config/cloudinary.js"; // Asegúrate de la ruta correcta
import multer from "multer";
import { transporter } from "../config/mailer.js";

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
------------------- Recuperar Contraseña -----------------
========================================================*/
router.post("/recuperar-contrasena", async (req, res) => {
  try {
    const { correo_electronico } = req.body;

    if (!correo_electronico || !correo_electronico.trim()) {
      return res.status(400).json({
        mensaje: "El campo correo electrónico es obligatorio",
      });
    }

    const [rows] = await db.query(
      "SELECT id_usuario, nombre_usuario FROM Usuario WHERE correo_electronico = ?",
      [correo_electronico]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        mensaje: "El correo electrónico no está registrado en el sistema",
      });
    }

    const usuario = rows[0];

    // TOKEN DE RECUPERACIÓN (15 min)
    const token = jwt.sign(
      { id: usuario.id_usuario },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // LINK
    const link = `${process.env.FRONTEND_URL}/#/recuperar-contrasena?token=${token}`;

    // ENVÍO DE CORREO
    await transporter.sendMail({
      from: `"Soporte Study Organizer" <${process.env.EMAIL_USER}>`,
      to: correo_electronico,
      subject: "Solicitud de recuperación de contraseña",
      html: `
        <p>Estimado/a <strong>${usuario.nombre_usuario}</strong>,</p>

        <p>
          Hemos recibido una solicitud para restablecer la contraseña
          asociada a su cuenta en <strong>Study Organizer</strong>.
        </p>

        <p>
          Para continuar con el proceso, por favor haga clic en el siguiente enlace:
        </p>

        <p>
          <a href="${link}">${link}</a>
        </p>

        <p>
          Por motivos de seguridad, este enlace tendrá una vigencia de
          <strong>15 minutos</strong>.
        </p>

        <p>
          Si usted no realizó esta solicitud, puede ignorar este mensaje.
          No se realizará ningún cambio en su cuenta.
        </p>

        <p>
          Atentamente,<br />
          <strong>Equipo de Soporte<br />
          Study Organizer</strong>
        </p>
      `,
    });

    res.json({
      mensaje: "Se ha enviado un enlace de recuperación a tu correo",
    });

  } catch (error) {
    console.error("Error recuperar contraseña:", error);
    res.status(500).json({
      mensaje: "Error al procesar la recuperación de contraseña",
    });
  }
});

router.post("/resetear-contrasena", async (req, res) => {
  try {
    const { token, nueva_contrasena } = req.body;

    // Validación básica
    if (!token || !nueva_contrasena) {
      return res.status(400).json({
        mensaje: "Datos incompletos",
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Hashear nueva contraseña
    const hashed = await bcrypt.hash(nueva_contrasena, 10);

    // Actualizar contraseña
    await db.query(
      "UPDATE Usuario SET contrasena = ? WHERE id_usuario = ?",
      [hashed, decoded.id]
    );

    res.json({
      mensaje: "Contraseña actualizada correctamente",
    });

  } catch (error) {
    console.error("Error resetear contraseña:", error);

    // 🔹 Token expirado
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        mensaje:
          "El token ha expirado. Vuelva a solicitar un token de recuperación.",
      });
    }

    // 🔹 Token inválido
    return res.status(401).json({
      mensaje: "El token es inválido.",
    });
  }
});

/* =======================================================
------------------------- LOGIN --------------------------
========================================================*/
router.post("/login", async (req, res) => {
  const { correo_electronico, contrasena } = req.body;

  try {
    if (!correo_electronico || !contrasena) {
      return res.status(400).json({ mensaje: "Datos incompletos" });
    }

    const result = await db.query(
      "SELECT * FROM Usuario WHERE correo_electronico = ?",
      [correo_electronico]
    );

    if (result[0].length === 0) {
      return res.status(401).json({ mensaje: "No encontrado" });
    }

    const usuario = result[0][0];

    const passwordValida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!passwordValida) {
      return res.status(401).json({ mensaje: "Contraseña incorrecta" });
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: usuario.id_usuario, id_rol: usuario.id_rol },
      "TU_SECRETO_SUPER_SEGURO",
      { expiresIn: "2h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // true solo en HTTPS
      sameSite: "lax",
      maxAge: 2 * 60 * 60 * 1000
    });

    // ===== FOTO PREDETERMINADA =====
    // ===== FOTO PREDETERMINADA =====
    const FOTO_PREDETERMINADA = "/perfil-usuario.png";
    const PORTADA_PREDETERMINADA = "/portada.jpg";

    const fotoPerfilUrl =
      usuario.foto_perfil && usuario.foto_perfil !== "null" && usuario.foto_perfil !== ""
        ? usuario.foto_perfil
        : FOTO_PREDETERMINADA;

    const fotoPortadaUrl =
      usuario.foto_portada && usuario.foto_portada !== "null" && usuario.foto_portada !== ""
        ? usuario.foto_portada
        : PORTADA_PREDETERMINADA;

    // ===== RESPUESTA =====
    res.json({
      usuario: {
        id: usuario.id_usuario,
        nombre: usuario.nombre_usuario,
        correo: usuario.correo_electronico,
        rol: usuario.id_rol,
        foto_perfil: fotoPerfilUrl,
        foto_portada: fotoPortadaUrl,
        telefono: usuario.telefono,
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
  try {
    const [rows] = await db.query(
      "SELECT id_usuario, nombre_usuario, correo_electronico, id_rol, foto_perfil, foto_portada, telefono, contrasena FROM Usuario WHERE id_usuario = ?",
      [req.usuario.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ mensaje: "Usuario no válido" });
    }

    const usuario = rows[0];

    // ===== FOTO PREDETERMINADA =====
    const FOTO_PREDETERMINADA = "/perfil-usuario.png";
    const PORTADA_PREDETERMINADA = "/portada.jpg";

    const fotoPerfilUrl =
      usuario.foto_perfil && usuario.foto_perfil !== "null" && usuario.foto_perfil !== ""
        ? usuario.foto_perfil
        : FOTO_PREDETERMINADA;

    const fotoPortadaUrl =
      usuario.foto_portada && usuario.foto_portada !== "null" && usuario.foto_portada !== ""
        ? usuario.foto_portada
        : PORTADA_PREDETERMINADA;

    res.json({
      usuario: {
        id: usuario.id_usuario,
        nombre: usuario.nombre_usuario,
        correo: usuario.correo_electronico,
        rol: usuario.id_rol,
        foto_perfil: fotoPerfilUrl,
        foto_portada: fotoPortadaUrl,
        telefono: usuario.telefono,
        contrasena: usuario.contrasena,
      },
    });
  } catch (error) {
    console.error("Error en /me:", error);
    res.status(500).json({ mensaje: "Error al obtener datos del usuario" });
  }
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
------------------------ CRUD Admin ----------------------
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

// alta usuario 
router.post("/alta-usuario", async (req, res) => {
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

// actualziar usuario
// eliminar usuario
// buscar informcion usuarios


/* =======================================================
---------------------- Perfil Usuario --------------------
========================================================*/
// Actualizar info usuario
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
      if (nombre) { campos.push("nombre_usuario = ?"); valores.push(nombre); }
      if (correo) { campos.push("correo_electronico = ?"); valores.push(correo); }
      if (telefono) { campos.push("telefono = ?"); valores.push(telefono); }
      if (descripcion) { campos.push("descripcion = ?"); valores.push(descripcion); }
      if (genero) { campos.push("genero = ?"); valores.push(genero); }

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

      const fotosActualizadas = {};

      if (req.files?.foto_perfil?.length > 0) {
        const file = req.files.foto_perfil[0];
        const urlPerfil = await subirArchivoCloudinary(file);
        campos.push("foto_perfil = ?");
        valores.push(urlPerfil);
        fotosActualizadas.foto_perfil = urlPerfil;
      }

      if (req.files?.foto_portada?.length > 0) {
        const file = req.files.foto_portada[0];
        const urlPortada = await subirArchivoCloudinary(file);
        campos.push("foto_portada = ?");
        valores.push(urlPortada);
        fotosActualizadas.foto_portada = urlPortada;
      }

      if (campos.length === 0) {
        return res.status(400).json({ mensaje: "No hay datos para actualizar" });
      }

      // id_usuario del token
      valores.push(req.usuario.id);

      const sql = `UPDATE Usuario SET ${campos.join(", ")} WHERE id_usuario = ?`;
      await db.query(sql, valores);

      // Devuelve mensaje y URLs nuevas si hay
      res.json({
        mensaje: "Perfil actualizado correctamente",
        fotos: fotosActualizadas
      });

    } catch (error) {
      console.error("ERROR actualizar perfil:", error);
      res.status(500).json({ mensaje: "Error al actualizar perfil" });
    }
  }
);

export default router;