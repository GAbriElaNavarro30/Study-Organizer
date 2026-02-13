import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

export function useLogin() {
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [errores, setErrores] = useState({ correo: "", password: "" });
  const [alert, setAlert] = useState({ 
    mostrar: false, 
    type: "", 
    title: "", 
    message: "" 
  });
  const [redirectPath, setRedirectPath] = useState("");
  
  const navigate = useNavigate();
  const { refrescarUsuario } = useContext(AuthContext); // Cambiado

  // ================== DETERMINAR RUTA SEGÚN ROL ==================
  const determinarRutaPorRol = (rol) => {
    if (rol === 2) return "/dashboard";
    if (rol === 1 || rol === 3) return "/home";
    return "/";
  };

  // ================== HANDLE SUBMIT ==================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Limpiar errores previos
    setErrores({ correo: "", password: "" });

    try {
      const res = await api.post("/usuarios/login", {
        correo_electronico: correo.trim().toLowerCase(),
        contrasena: password,
      });

      // 🔥 REFRESCAR USUARIO DESDE /me
      await refrescarUsuario();

      // Determinar ruta según rol
      const ruta = determinarRutaPorRol(res.data.usuario.rol);
      setRedirectPath(ruta);

      // Mostrar alerta de éxito
      setAlert({
        mostrar: true,
        type: "success",
        title: "Inicio de sesión exitoso",
        message: `Bienvenido, ${res.data.usuario.nombre}!`,
      });

    } catch (error) {
      // ============== MANEJO DE ERRORES DEL BACKEND ==============
      const erroresBackend = error.response?.data?.errors;

      if (erroresBackend && Array.isArray(erroresBackend)) {
        const nuevosErrores = { correo: "", password: "" };

        erroresBackend.forEach((err) => {
          if (err.path === "correo_electronico") {
            nuevosErrores.correo = err.message;
          } else if (err.path === "contrasena") {
            nuevosErrores.password = err.message;
          } else if (err.path === "general") {
            // Error general, lo mostramos en password por defecto
            nuevosErrores.password = err.message;
          }
        });

        setErrores(nuevosErrores);
      } else {
        // Error genérico (problema de red, servidor caído, etc.)
        setErrores({ 
          correo: "", 
          password: "Error al iniciar sesión. Intenta de nuevo." 
        });

        console.error("Error login completo:", error);
        console.error("Error response.data:", error.response?.data);
      }
    }
  };

  // ================== CERRAR ALERTA Y REDIRIGIR ==================
  const handleAlertClose = () => {
    setAlert({ ...alert, mostrar: false });
    if (redirectPath) navigate(redirectPath);
  };

  // ================== LIMPIAR ERROR AL ESCRIBIR ==================
  const handleCorreoChange = (e) => {
    setCorreo(e.target.value);
    if (errores.correo) {
      setErrores({ ...errores, correo: "" });
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errores.password) {
      setErrores({ ...errores, password: "" });
    }
  };

  // ================== EXPORTAR ==================
  return {
    mostrarPassword,
    setMostrarPassword,
    correo,
    setCorreo,
    password,
    setPassword,
    errores,
    alert,
    handleSubmit,
    handleAlertClose,
    handleCorreoChange,
    handlePasswordChange,
  };
}