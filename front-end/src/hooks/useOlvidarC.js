import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export function useOlvidarC() {
  const navigate = useNavigate();

  // ===== Estados =====
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enviado, setEnviado] = useState(false);

  // ===== Modal confirmar salir =====
  const [mostrarModal, setMostrarModal] = useState(false);
  const [rutaDestino, setRutaDestino] = useState("/");

  // ===== Custom Alert =====
  const [mostrarAlert, setMostrarAlert] = useState(false);
  const [alertData, setAlertData] = useState({
    type: "success",
    title: "",
    message: "",
  });

  // ===== INTENTO DE SALIDA (VOLVER / ACCEDER) =====
  const intentarSalir = (ruta) => {
    if (email.trim() && !enviado) {
      setRutaDestino(ruta);
      setMostrarModal(true);
    } else {
      navigate(ruta);
    }
  };

  // ===== LIMPIAR ERROR AL ESCRIBIR =====
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  // ===== CERRAR MODAL Y NAVEGAR =====
  const confirmarSalida = () => {
    setMostrarModal(false);
    navigate(rutaDestino);
  };

  const cancelarSalida = () => {
    setMostrarModal(false);
  };

  // ===== CERRAR ALERT =====
  const cerrarAlert = () => {
    setMostrarAlert(false);
    if (alertData.type === "success") {
      setEnviado(true); // Mostrar opción de reenvío
    }
  };

  // ===== SUBMIT =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // ===== VALIDACIÓN 1: CAMPO OBLIGATORIO =====
    if (!email.trim()) {
      setError("El correo electrónico es obligatorio");
      return;
    }

    // ===== VALIDACIÓN 2: FORMATO DE CORREO =====
    const correoRegex =
      /^(?!\.)(?!.*\.\.)([a-zA-Z0-9]+([._-]?[a-zA-Z0-9]+)*)@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

    if (!correoRegex.test(email.trim())) {
      setError("El correo electrónico no cumple con un formato válido");
      return;
    }

    // ===== VALIDACIÓN 3: LONGITUD ANTES DEL @ =====
    const parteUsuario = email.split("@")[0];
    if (parteUsuario.length > 64) {
      setError("El correo no debe superar 64 caracteres antes del @");
      return;
    }

    // ===== VALIDACIÓN 4: LONGITUD TOTAL =====
    if (email.trim().length > 254) {
      setError("El correo electrónico es demasiado largo");
      return;
    }

    // ===== NORMALIZAR Y ENVIAR =====
    setIsSubmitting(true);

    try {
      const response = await api.post("/usuarios/recuperar-contrasena", {
        correo_electronico: email.trim().toLowerCase(),
      });

      // ✅ ÉXITO
      setAlertData({
        type: "success",
        title: "Correo enviado",
        message: response.data.mensaje,
      });
      setMostrarAlert(true);
      //setEmail(""); // Limpiar campo

    } catch (err) {
      const status = err.response?.status;
      const mensaje = err.response?.data?.mensaje;

      // ===== ERROR 404: CORREO NO REGISTRADO =====
      if (status === 404) {
        setError(mensaje || "El correo electrónico no está registrado");
        return;
      }

      // ===== ERROR 400: VALIDACIÓN =====
      if (status === 400) {
        setError(mensaje || "Datos inválidos");
        return;
      }

      // ===== ERROR GENÉRICO =====
      setAlertData({
        type: "error",
        title: "Error",
        message: mensaje || "Error al enviar el enlace de recuperación",
      });
      setMostrarAlert(true);

    } finally {
      setIsSubmitting(false);
    }
  };

  // ===== RETORNAR TODO LO NECESARIO =====
  return {
    // Estados
    email,
    error,
    isSubmitting,
    mostrarModal,
    mostrarAlert,
    alertData,
    enviado,

    // Handlers
    handleEmailChange,
    handleSubmit,
    intentarSalir,
    confirmarSalida,
    cancelarSalida,
    cerrarAlert,
  };
} 