import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export function useCorreoAlternativo() {
  const navigate = useNavigate();
  const [enviado, setEnviado] = useState(false);
  const [correo, setCorreo] = useState("");
  const [errorCorreo, setErrorCorreo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [mostrarAlert, setMostrarAlert] = useState(false);
  const [alertData, setAlertData] = useState({ type: "", title: "", message: "" });
  const [mostrarModal, setMostrarModal] = useState(false);
  const [rutaDestino, setRutaDestino] = useState("/olvidar-contrasena");

  const intentarSalir = (ruta) => {
    if (resultado && !resultado.tieneAlternativo) { navigate(ruta); return; }
    if (enviado) { navigate(ruta); return; }
    if (resultado?.tieneAlternativo || correo.trim()) {
      setRutaDestino(ruta);
      setMostrarModal(true);
    } else {
      navigate(ruta);
    }
  };

  const confirmarSalida = () => {
    setMostrarModal(false);
    if (rutaDestino === "/login") { navigate("/login"); } else { reiniciar(); }
  };

  const cancelarSalida = () => setMostrarModal(false);

  const handleCorreoChange = (e) => {
    setCorreo(e.target.value);
    if (errorCorreo) setErrorCorreo("");
  };

  // ================== VERIFICAR CORREO ALTERNATIVO ==================
  const handleVerificar = async (e) => {
    e.preventDefault();
    const correoLimpio = correo.trim();
    if (!correoLimpio) { setErrorCorreo("El correo electrónico es obligatorio"); return; }
    const correoRegex = /^(?!\.)(?!.*\.\.)([a-zA-Z0-9]+([._-]?[a-zA-Z0-9]+)*)@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    if (!correoRegex.test(correoLimpio)) { setErrorCorreo("El correo electrónico no tiene un formato válido"); return; }

    setIsSubmitting(true);
    try {
      // ✅ api.post en lugar de fetch hardcodeado
      const { data } = await api.post("/usuarios/verificar-correo-alternativo", {
        correo_electronico: correoLimpio,
      });
      setResultado(data);
    } catch (err) {
      const mensaje = err.response?.data?.mensaje;
      setErrorCorreo(mensaje || "Correo no encontrado");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ================== ENVIAR ENLACE AL ALTERNATIVO ==================
  const handleEnviarAlternativo = async () => {
    setEnviando(true);
    try {
      // ✅ api.post en lugar de fetch hardcodeado
      await api.post("/usuarios/recuperar-con-alternativo", {
        correo_electronico: correo.trim(),
      });
      setAlertData({
        type: "success",
        title: "¡Enlace enviado!",
        message: "Se ha enviado el enlace de recuperación a tu correo alternativo. Revisa tu bandeja de entrada."
      });
      setMostrarAlert(true);
    } catch (err) {
      const mensaje = err.response?.data?.mensaje;
      setAlertData({
        type: "error",
        title: "Error",
        message: mensaje || "No se pudo enviar el enlace."
      });
      setMostrarAlert(true);
    } finally {
      setEnviando(false);
    }
  };

  const cerrarAlert = () => {
    setMostrarAlert(false);
    if (alertData.type === "success") setEnviado(true);
  };

  const reiniciar = () => {
    setCorreo("");
    setErrorCorreo("");
    setResultado(null);
  };

  return {
    correo, errorCorreo, isSubmitting, resultado,
    enviando, enviado, mostrarAlert, alertData, mostrarModal,
    handleCorreoChange, handleVerificar, handleEnviarAlternativo,
    cerrarAlert, reiniciar, intentarSalir, confirmarSalida, cancelarSalida,
  };
}