import { Router } from "express";
import { verificarToken } from "../middlewares/auth.js";
import multer from "multer";
import {
  verificarCorreo, verificarTelefono,
  crearUsuario, login, me, logout,
  obtenerUsuarios, altaUsuario, editarUsuario,
  buscarUsuarios, eliminarUsuario, actualizarPerfil,
  recuperarContrasena, resetearContrasena,
  verificarCorreoAlternativo, recuperarConAlternativo,
  registrosDashboard
} from "../controllers/usuarioController.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });
const router = Router();

// Verificaciones
router.post("/verificar-correo", verificarCorreo);
router.post("/verificar-telefono", verificarTelefono);

// Registro y Autenticación
router.post("/crear-usuario", crearUsuario);
router.post("/login", login);
router.get("/me", verificarToken, me);
router.post("/logout", logout);

// CRUD Admin
router.get("/obtener-usuarios", obtenerUsuarios);
router.post("/alta-usuario", altaUsuario);
router.put("/editar-usuario/:id", editarUsuario);
router.get("/buscar-informacion", buscarUsuarios);
router.delete("/eliminar-usuario/:id", eliminarUsuario);

// Perfil
router.put("/actualizar-perfil", verificarToken,
  upload.fields([{ name: "foto_perfil", maxCount: 1 }, { name: "foto_portada", maxCount: 1 }]),
  actualizarPerfil
);

// Recuperar contraseña
router.post("/recuperar-contrasena", recuperarContrasena);
router.post("/resetear-contrasena", resetearContrasena);
router.post("/verificar-correo-alternativo", verificarCorreoAlternativo);
router.post("/recuperar-con-alternativo", recuperarConAlternativo);

// dashboard del administrador
router.get("/registros-dashboard", verificarToken, registrosDashboard);

export default router;