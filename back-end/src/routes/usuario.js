import { Router } from "express";
import { Usuario } from "../models/Usuario.js";
import { Rol } from "../models/Rol.js";
import { db } from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { verificarToken } from "../middlewares/auth.js";
import cloudinary from "../config/cloudinary.js";
import multer from "multer";
import { transporter } from "../config/mailer.js";
import PDFDocument from "pdfkit";

// Multer: almacenamiento en memoria (no en disco)
const storage = multer.memoryStorage();
const upload = multer({ storage });
const router = Router();

/* ====================================================
--------------- FUNCIONES COMPARTIDAS -----------------
=====================================================*/
// nombre
function validarNombreUsuario(nombre) {
  const errores = [];

  if (!nombre || !nombre.trim()) {
    errores.push({
      path: "nombre_usuario",
      message: "El nombre es obligatorio",
    });
  } else {
    const nombreRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ.\s]+$/;
    if (!nombreRegex.test(nombre)) {
      errores.push({
        path: "nombre_usuario",
        message: "El nombre solo puede contener letras, espacios y acentos",
      });
    }
  }

  return errores;
}

// correo
async function validarCorreoElectronico(correo, db) {
  const errores = [];

  if (!correo || !correo.trim()) {
    errores.push({
      path: "correo_electronico",
      message: "El correo electrónico es obligatorio",
    });
  } else {
    // Formato de correo
    const correoRegex = /^(?!\.)(?!.*\.\.)([a-zA-Z0-9]+([._-]?[a-zA-Z0-9]+)*)@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

    if (!correoRegex.test(correo)) {
      errores.push({
        path: "correo_electronico",
        message: "El correo electrónico no cumple con un formato válido",
      });
    } else {
      // Longitud antes del @ (máx 64)
      const parteUsuario = correo.split("@")[0];
      if (parteUsuario.length > 64) {
        errores.push({
          path: "correo_electronico",
          message: "El correo no debe superar 64 caracteres antes del @",
        });
      } else {
        // Unicidad en BD
        const correoExiste = await db.query(
          "SELECT id_usuario FROM Usuario WHERE correo_electronico = ?",
          [correo]
        );

        if (correoExiste[0].length > 0) {
          errores.push({
            path: "correo_electronico",
            message: "Este correo electrónico ya está registrado",
          });
        }
      }
    }
  }

  return errores; // devuelve un arreglo de errores, aunque sea vacío
}

// rol
async function validarRol(id_rol, db) {
  const errores = [];

  if (!id_rol) {
    errores.push({
      path: "id_rol",
      message: "El rol es obligatorio",
    });
  } else if (isNaN(id_rol)) {
    errores.push({
      path: "id_rol",
      message: "El rol no es válido",
    });
  } else {
    // Verificar que el rol exista en la base de datos
    const rolExiste = await db.query(
      "SELECT id_rol FROM Rol WHERE id_rol = ?",
      [id_rol]
    );

    if (rolExiste[0].length === 0) {
      errores.push({
        path: "id_rol",
        message: "El rol seleccionado no existe",
      });
    }
  }

  return errores;
}

// telefono
async function validarTelefono(telefono, db) {
  const errores = [];

  if (!telefono || !telefono.trim()) {
    errores.push({
      path: "telefono",
      message: "El teléfono es obligatorio",
    });
  } else {
    // Formato: exactamente 10 dígitos
    const telefonoRegex = /^[0-9]{10}$/;
    if (!telefonoRegex.test(telefono)) {
      errores.push({
        path: "telefono",
        message: "El teléfono debe tener 10 dígitos numéricos",
      });
    } else {
      // Verificar unicidad en la base de datos
      const telefonoExiste = await db.query(
        "SELECT id_usuario FROM Usuario WHERE telefono = ?",
        [telefono]
      );

      if (telefonoExiste[0].length > 0) {
        errores.push({
          path: "telefono",
          message: "Este número de teléfono ya está registrado",
        });
      }
    }
  }

  return errores;
}

// género
function validarGenero(genero) {
  const errores = [];

  if (!genero || !genero.trim()) {
    errores.push({
      path: "genero",
      message: "El género es obligatorio",
    });
  } else {
    const generosValidos = ["mujer", "hombre", "Otro"]; // ajusta según tu sistema

    if (!generosValidos.includes(genero)) {
      errores.push({
        path: "genero",
        message: "El género seleccionado no es válido",
      });
    }
  }

  return errores; // devuelve un arreglo de errores (vacío si todo está bien)
}

// contraseña
function validarContrasena(contrasena) {
  const errores = [];

  if (!contrasena || !contrasena.trim()) {
    errores.push({
      path: "contrasena",
      message: "La contraseña es obligatoria",
    });
  } else {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$¡*])[A-Za-z\d@#$¡*]{6,}$/;

    if (!passwordRegex.test(contrasena)) {
      errores.push({
        path: "contrasena",
        message:
          "La contraseña debe tener al menos 6 caracteres, incluir una mayúscula, una minúscula, un número y un carácter especial (@ # $ ¡ *)",
      });
    }
  }

  return errores; // devuelve un arreglo de errores (vacío si está bien)
}

// fecha de nacimiento
function validarFechaNacimiento(fechaNacimientoInput) {
  const errores = [];
  const hoy = new Date();

  if (!fechaNacimientoInput) {
    errores.push({
      path: "fecha_nacimiento",
      message: "La fecha de nacimiento es obligatoria",
    });
  } else {
    const fechaNacimiento = new Date(fechaNacimientoInput);

    // Fecha inválida
    if (isNaN(fechaNacimiento.getTime())) {
      errores.push({
        path: "fecha_nacimiento",
        message: "La fecha de nacimiento no es válida",
      });
    } else {
      // No hoy ni futura
      if (fechaNacimiento >= hoy) {
        errores.push({
          path: "fecha_nacimiento",
          message: "La fecha de nacimiento no puede ser hoy ni una fecha futura",
        });
      }

      // Edad mínima
      const edadMinima = 13;
      const fechaMinima = new Date(
        hoy.getFullYear() - edadMinima,
        hoy.getMonth(),
        hoy.getDate()
      );
      if (fechaNacimiento > fechaMinima) {
        errores.push({
          path: "fecha_nacimiento",
          message: `Debes tener al menos ${edadMinima} años`,
        });
      }

      // Edad máxima
      const edadMaxima = 120;
      const fechaMaxima = new Date(
        hoy.getFullYear() - edadMaxima,
        hoy.getMonth(),
        hoy.getDate()
      );
      if (fechaNacimiento < fechaMaxima) {
        errores.push({
          path: "fecha_nacimiento",
          message: `La edad no puede ser mayor a ${edadMaxima} años`,
        });
      }
    }
  }

  return errores;
}

/* ====================================================
--------------------- ENDPOINTS -----------------------
=====================================================*/

// ============== VERIFICAR DISPONIBILIDAD DE CORREO ==============
router.post("/verificar-correo", async (req, res) => {
  try {
    const { correo_electronico } = req.body;

    if (!correo_electronico) {
      return res.status(400).json({ 
        disponible: false, 
        message: "El correo es requerido" 
      });
    }

    const correoExiste = await db.query(
      "SELECT id_usuario FROM Usuario WHERE correo_electronico = ?",
      [correo_electronico.trim().toLowerCase()]
    );

    if (correoExiste[0].length > 0) {
      return res.status(200).json({ 
        disponible: false, 
        message: "Este correo electrónico ya está registrado" 
      });
    }

    res.status(200).json({ 
      disponible: true, 
      message: "Correo disponible" 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      disponible: false, 
      message: "Error al verificar el correo" 
    });
  }
});

// ============== VERIFICAR DISPONIBILIDAD DE TELÉFONO ==============
router.post("/verificar-telefono", async (req, res) => {
  try {
    const { telefono } = req.body;

    if (!telefono) {
      return res.status(400).json({ 
        disponible: false, 
        message: "El teléfono es requerido" 
      });
    }

    const telefonoExiste = await db.query(
      "SELECT id_usuario FROM Usuario WHERE telefono = ?",
      [telefono.trim()]
    );

    if (telefonoExiste[0].length > 0) {
      return res.status(200).json({ 
        disponible: false, 
        message: "Este número de teléfono ya está registrado" 
      });
    }

    res.status(200).json({ 
      disponible: true, 
      message: "Teléfono disponible" 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      disponible: false, 
      message: "Error al verificar el teléfono" 
    });
  }
});


/* ====================================================
-------------------------- ROLES ----------------------
=====================================================*/
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
router.post("/crear-usuario", async (req, res) => {
  try {
    const data = { ...req.body, id_rol: Number(req.body.id_rol) };
    const errores = [];

    errores.push(...validarNombreUsuario(data.nombre_usuario));
    errores.push(...await validarCorreoElectronico(data.correo_electronico, db));
    errores.push(...await validarRol(data.id_rol, db));
    errores.push(...await validarTelefono(data.telefono, db));
    errores.push(...validarGenero(data.genero));
    errores.push(...validarContrasena(data.contrasena));
    errores.push(...validarFechaNacimiento(data.fecha_nacimiento));

    if (errores.length > 0) {
      return res.status(400).json({ errors: errores });
    }

    // =============== HASHEAR CONTRASEÑA ===============
    const salt = await bcrypt.genSalt(10);
    data.contrasena = await bcrypt.hash(data.contrasena, salt);

    // =============== GUARDAR USUARIO BD ===============
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
        descripcion: usuario.descripcion,
        genero: usuario.genero,
        fecha_nacimiento: usuario.fecha_nacimiento
          ? {
            day: new Date(usuario.fecha_nacimiento).getDate(),
            month: new Date(usuario.fecha_nacimiento).getMonth() + 1,
            year: new Date(usuario.fecha_nacimiento).getFullYear(),
          }
          : { day: "", month: "", year: "" },
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
      `SELECT 
        id_usuario,
        nombre_usuario,
        correo_electronico,
        id_rol,
        foto_perfil,
        foto_portada,
        telefono,
        contrasena,
        descripcion,
        genero,
        fecha_nacimiento
      FROM Usuario 
      WHERE id_usuario = ?`,
      [req.usuario.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ mensaje: "Usuario no válido" });
    }

    const usuario = rows[0];

    // ===== FOTOS PREDETERMINADAS =====
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

    // ===== 🔥 NORMALIZAR FECHA =====
    const fechaNacimiento = usuario.fecha_nacimiento
      ? {
        day: new Date(usuario.fecha_nacimiento).getDate(),
        month: new Date(usuario.fecha_nacimiento).getMonth() + 1,
        year: new Date(usuario.fecha_nacimiento).getFullYear(),
      }
      : { day: "", month: "", year: "" };

    res.json({
      usuario: {
        id: usuario.id_usuario,
        nombre: usuario.nombre_usuario,
        correo: usuario.correo_electronico,
        rol: usuario.id_rol,
        foto_perfil: fotoPerfilUrl,
        foto_portada: fotoPortadaUrl,
        telefono: usuario.telefono,
        genero: usuario.genero,
        contrasena: usuario.contrasena,
        descripcion: usuario.descripcion,
        fecha_nacimiento: fechaNacimiento, // ✅ FORMATO CORRECTO
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

    errores.push(...validarNombreUsuario(data.nombre_usuario));
    errores.push(...await validarCorreoElectronico(data.correo_electronico, db));
    errores.push(...await validarRol(data.id_rol, db));
    errores.push(...await validarTelefono(data.telefono, db));
    errores.push(...validarGenero(data.genero));
    errores.push(...validarContrasena(data.contrasena));
    errores.push(...validarFechaNacimiento(data.fecha_nacimiento));

    if (errores.length > 0) {
      return res.status(400).json({ errors: errores });
    }

    // =============== HASHEAR CONTRASEÑA ===============
    const salt = await bcrypt.genSalt(10);
    data.contrasena = await bcrypt.hash(data.contrasena, salt);

    // =============== GUARDAR USUARIO BD ===============
    const usuario = new Usuario(data);
    await usuario.save();

    res.status(201).json({ mensaje: "Usuario creado correctamente" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear el usuario", error: error.message });
  }
});

// eliminar usuario
router.delete("/eliminar-usuario/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [resultado] = await db.query(
      "DELETE FROM Usuario WHERE id_usuario = ?",
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        message: "Usuario no encontrado"
      });
    }

    res.status(200).json({
      message: "Usuario eliminado correctamente"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al eliminar el usuario",
      error: error.message
    });
  }
});

// actualziar usuario
router.put("/editar-usuario/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const data = {
      ...req.body,
      id_rol: Number(req.body.id_rol),
    };

    const errores = [];

    // ================== VALIDAR DUPLICADOS ==================

    const correoExiste = await db.query(
      `SELECT id_usuario FROM Usuario 
       WHERE correo_electronico = ? AND id_usuario != ?`,
      [data.correo_electronico, id]
    );

    if (correoExiste[0].length > 0) {
      errores.push({
        path: "correo",
        message: "Este correo electrónico ya está registrado",
      });
    }

    const telefonoExiste = await db.query(
      `SELECT id_usuario FROM Usuario 
       WHERE telefono = ? AND id_usuario != ?`,
      [data.telefono, id]
    );

    if (telefonoExiste[0].length > 0) {
      errores.push({
        path: "telefono",
        message: "Este número de teléfono ya está registrado",
      });
    }

    if (errores.length > 0) {
      return res.status(400).json({ errors: errores });
    }

    // ================== UPDATE DINÁMICO ==================

    let query = `
      UPDATE Usuario SET
        nombre_usuario = ?,
        correo_electronico = ?,
        telefono = ?,
        genero = ?,
        fecha_nacimiento = ?,
        id_rol = ?
    `;

    const params = [
      data.nombre_usuario,
      data.correo_electronico,
      data.telefono,
      data.genero,
      data.fecha_nacimiento,
      data.id_rol,
    ];

    // 👉 SOLO si viene contraseña
    if (data.contrasena) {
      query += `, contrasena = ?`;
      params.push(data.contrasena); // ya viene hasheada
    }

    query += ` WHERE id_usuario = ?`;
    params.push(id);

    await db.query(query, params);

    res.json({ mensaje: "Usuario actualizado correctamente" });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al actualizar usuario",
      error: error.message,
    });
  }
});

// buscar informcion usuarios
router.get("/buscar-informacion", async (req, res) => {
  try {
    const { q } = req.query;

    let sql = `
      SELECT 
        u.id_usuario,
        u.nombre_usuario,
        u.correo_electronico,
        u.telefono,
        u.genero,
        u.fecha_nacimiento,
        r.tipo_usuario AS rol
      FROM Usuario u
      JOIN Rol r ON u.id_rol = r.id_rol
    `;

    const params = [];

    if (q) {
      sql += `
        WHERE 
          CAST(u.id_usuario AS CHAR) LIKE ?
          OR u.nombre_usuario LIKE ?
          OR u.correo_electronico LIKE ?
          OR u.telefono LIKE ?
          OR u.genero LIKE ?
          OR r.tipo_usuario LIKE ?
      `;

      const like = `%${q}%`;
      params.push(like, like, like, like, like, like);
    }

    const [rows] = await db.query(sql, params);

    res.json(rows);

  } catch (error) {
    console.error("Error al buscar usuarios:", error);
    res.status(500).json({
      message: "Error al buscar usuarios",
    });
  }
});

// exportar PDF
router.get("/exportar-pdf", async (req, res) => {
  try {
    // Traer todos los usuarios
    const [usuarios] = await db.query(`
      SELECT 
        u.id_usuario,
        u.nombre_usuario,
        u.correo_electronico,
        u.telefono,
        u.genero,
        u.fecha_nacimiento,
        r.tipo_usuario AS rol
      FROM Usuario u
      JOIN Rol r ON u.id_rol = r.id_rol
      ORDER BY u.id_usuario ASC
    `);

    const doc = new PDFDocument({ margin: 30, size: "A4" });

    const filename = "usuarios.pdf";
    res.setHeader("Content-disposition", "attachment; filename=" + filename);
    res.setHeader("Content-type", "application/pdf");

    doc.pipe(res);

    doc.fontSize(20).text("Usuarios", { align: "center" });
    doc.moveDown();

    // Tabla simple
    usuarios.forEach((u, i) => {
      doc
        .fontSize(12)
        .text(`${i + 1}. ID: ${u.id_usuario} | Nombre: ${u.nombre_usuario} | Correo: ${u.correo_electronico} | Rol: ${u.rol} | Tel: ${u.telefono} | Género: ${u.genero} | Nacimiento: ${u.fecha_nacimiento}`);
      doc.moveDown(0.5);
    });

    doc.end();

  } catch (error) {
    console.error("Error al generar PDF:", error);
    res.status(500).json({ message: "Error al generar PDF" });
  }
});

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
      let {
        nombre,
        correo,
        telefono,
        descripcion,
        fechaNacimiento,
        genero,
        password
      } = req.body;

      // Si fechaNacimiento viene como string desde FormData
      if (typeof fechaNacimiento === "string") {
        fechaNacimiento = JSON.parse(fechaNacimiento);
      }

      const campos = [];
      const valores = [];

      // ===== CAMPOS NORMALES =====
      if (nombre) {
        campos.push("nombre_usuario = ?");
        valores.push(nombre);
      }

      if (correo) {
        campos.push("correo_electronico = ?");
        valores.push(correo);
      }

      if (telefono) {
        campos.push("telefono = ?");
        valores.push(telefono);
      }

      if (descripcion !== undefined) {
        campos.push("descripcion = ?");
        valores.push(descripcion);
      }

      if (genero) {
        campos.push("genero = ?");
        valores.push(genero);
      }

      if (password) {
        const hashed = await bcrypt.hash(password, 10);
        campos.push("contrasena = ?");
        valores.push(hashed);
      }

      if (fechaNacimiento?.year && fechaNacimiento?.month && fechaNacimiento?.day) {
        // Guardar como YYYY-MM-DD
        campos.push("fecha_nacimiento = ?");
        valores.push(`${fechaNacimiento.year}-${fechaNacimiento.month}-${fechaNacimiento.day}`);
      }

      // ===== CLOUDINARY (solo sube) =====
      const subirArchivoCloudinary = async (file) => {
        const base64 = file.buffer.toString("base64");
        const dataUri = `data:${file.mimetype};base64,${base64}`;

        const result = await cloudinary.uploader.upload(dataUri, {
          folder: "fotos_usuarios"
        });

        return result.secure_url;
      };

      const fotosActualizadas = {};

      if (req.files?.foto_perfil?.length) {
        const url = await subirArchivoCloudinary(req.files.foto_perfil[0]);
        campos.push("foto_perfil = ?");
        valores.push(url);
        fotosActualizadas.foto_perfil = url;
      }

      if (req.files?.foto_portada?.length) {
        const url = await subirArchivoCloudinary(req.files.foto_portada[0]);
        campos.push("foto_portada = ?");
        valores.push(url);
        fotosActualizadas.foto_portada = url;
      }

      if (!campos.length) {
        return res.status(400).json({ mensaje: "No hay datos para actualizar" });
      }

      // ===== UPDATE =====
      valores.push(req.usuario.id);
      const sql = `UPDATE Usuario SET ${campos.join(", ")} WHERE id_usuario = ?`;
      await db.query(sql, valores);

      // ===== OBTENER USUARIO ACTUALIZADO =====
      const [rows] = await db.query(`
        SELECT 
          u.id_usuario AS id,
          u.nombre_usuario AS nombre,
          u.correo_electronico AS correo,
          u.telefono,
          u.descripcion,
          u.genero,
          u.fecha_nacimiento,
          u.foto_perfil,
          u.foto_portada,
          u.id_rol AS rol,
          r.tipo_usuario
        FROM Usuario u
        JOIN Rol r ON u.id_rol = r.id_rol
        WHERE u.id_usuario = ?
      `, [req.usuario.id]);

      const usuario = rows[0];

      // ===== NORMALIZAR FECHA =====
      const fechaNacimientoNormalizada = usuario.fecha_nacimiento
        ? {
          day: new Date(usuario.fecha_nacimiento).getDate(),
          month: new Date(usuario.fecha_nacimiento).getMonth() + 1,
          year: new Date(usuario.fecha_nacimiento).getFullYear(),
        }
        : { day: "", month: "", year: "" };

      res.json({
        mensaje: "Perfil actualizado correctamente",
        usuario: {
          ...usuario,
          fecha_nacimiento: fechaNacimientoNormalizada,
        },
        fotos: fotosActualizadas
      });

    } catch (error) {
      console.error("ERROR actualizar perfil:", error);
      res.status(500).json({ mensaje: "Error al actualizar perfil" });
    }
  }
);




export default router;