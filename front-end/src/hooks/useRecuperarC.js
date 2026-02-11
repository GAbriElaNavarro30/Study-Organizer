import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";

export function useRecuperarC() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // ===== Obtener token de la URL =====
  const token = searchParams.get("token");

  // ===== Estados =====
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ===== Visibilidad de contraseñas =====
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);

  // ===== Modal confirmar salir =====
  const [mostrarModal, setMostrarModal] = useState(false);
  const [rutaDestino, setRutaDestino] = useState("/");

  // ===== Custom Alert =====
  const [alert, setAlert] = useState({
    visible: false,
    type: "success",
    title: "",
    message: "",
  });

  // ===== REGEX DE VALIDACIÓN =====
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$¡*])[A-Za-z\d@#$¡*]{6,}$/;

  // ===== INTENTO DE SALIDA =====
  const intentarSalir = (ruta) => {
    if (password || confirmPassword) {
      setRutaDestino(ruta);
      setMostrarModal(true);
    } else {
      navigate(ruta);
    }
  };

  // ===== CONFIRMAR SALIDA =====
  const confirmarSalida = () => {
    setMostrarModal(false);
    navigate(rutaDestino);
  };

  // ===== CANCELAR SALIDA =====
  const cancelarSalida = () => {
    setMostrarModal(false);
  };

  // ===== MANEJAR CAMBIOS EN INPUTS =====
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError("");
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (error) setError("");
  };

  // ===== CERRAR ALERT Y REDIRIGIR =====
  const cerrarAlert = () => {
    setAlert({ ...alert, visible: false });
    if (alert.type === "success") {
      navigate("/login");
    }
  };

  // ===== TOGGLE VISIBILIDAD =====
  const toggleMostrarPassword = () => {
    setMostrarPassword(!mostrarPassword);
  };

  const toggleMostrarConfirmPassword = () => {
    setMostrarConfirmPassword(!mostrarConfirmPassword);
  };

  // ===== SUBMIT =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // ===== VALIDACIÓN 1: CAMPOS OBLIGATORIOS =====
    if (!password || !password.trim()) {
      setError("La nueva contraseña es obligatoria");
      return;
    }

    if (!confirmPassword || !confirmPassword.trim()) {
      setError("Debes confirmar tu nueva contraseña");
      return;
    }

    // ===== VALIDACIÓN 2: FORMATO DE CONTRASEÑA =====
    if (!passwordRegex.test(password)) {
      setError(
        "La contraseña debe tener al menos 6 caracteres, incluir una mayúscula, una minúscula, un número y un carácter especial (@ # $ ¡ *)"
      );
      return;
    }

    // ===== VALIDACIÓN 3: LONGITUD MÁXIMA =====
    if (password.length > 128) {
      setError("La contraseña no puede superar 128 caracteres");
      return;
    }

    // ===== VALIDACIÓN 4: CONTRASEÑAS COINCIDEN =====
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    // ===== VALIDACIÓN 5: ESPACIOS EN BLANCO =====
    if (password.includes(" ")) {
      setError("La contraseña no puede contener espacios en blanco");
      return;
    }

    // ===== ENVIAR AL BACKEND =====
    setIsSubmitting(true);

    try {
      const response = await api.post("/usuarios/resetear-contrasena", {
        token,
        nueva_contrasena: password,
      });

      // ÉXITO
      setAlert({
        visible: true,
        type: "success",
        title: "¡Contraseña actualizada!",
        message:
          response.data.mensaje || "Tu contraseña se actualizó correctamente",
      });

      // Limpiar campos
      setPassword("");
      setConfirmPassword("");

    } catch (err) {
      const campo = err.response?.data?.campo;
      const mensaje = err.response?.data?.mensaje;

      // ===== ERROR DE TOKEN =====
      if (campo === "token") {
        setAlert({
          visible: true,
          type: "error",
          title: "Error",
          message: mensaje || "El enlace ha expirado. Por favor, solicita un nuevo enlace de recuperación.",
        });
        return;
      }

      // ===== ERROR DE VALIDACIÓN =====
      if (campo === "nueva_contrasena") {
        setError(mensaje || "Error al validar la contraseña");
        return;
      }

      // ===== ERROR GENÉRICO =====
      setAlert({
        visible: true,
        type: "error",
        title: "Error",
        message: mensaje || "Error al restablecer la contraseña",
      });

    } finally {
      setIsSubmitting(false);
    }
  };

  // ===== RETORNAR TODO =====
  return {
    // Token
    token,

    // Estados
    password,
    confirmPassword,
    error,
    isSubmitting,
    mostrarPassword,
    mostrarConfirmPassword,
    mostrarModal,
    alert,

    // Handlers
    handlePasswordChange,
    handleConfirmPasswordChange,
    handleSubmit,
    intentarSalir,
    confirmarSalida,
    cancelarSalida,
    toggleMostrarPassword,
    toggleMostrarConfirmPassword,
    cerrarAlert,
  };
}