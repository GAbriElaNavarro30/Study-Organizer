import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

  // ===== Modal confirmar salir =====
  const [mostrarModal, setMostrarModal] = useState(false);
  const [rutaDestino, setRutaDestino] = useState("/olvidar-contrasena");

  // ===== INTENTO DE SALIDA =====
  const intentarSalir = (ruta) => {
    // Si no tiene alternativo, salir directo sin modal
    if (resultado && !resultado.tieneAlternativo) {
      navigate(ruta);
      return;
    }

    // Si ya se envió, salir directo sin modal
    if (enviado) {
      navigate(ruta);
      return;
    }

    // Si tiene alternativo pero no ha enviado, mostrar modal
    if (resultado?.tieneAlternativo || correo.trim()) {
      setRutaDestino(ruta);
      setMostrarModal(true);
    } else {
      navigate(ruta);
    }
  };



  const confirmarSalida = () => {
    setMostrarModal(false);
    // Si la ruta destino es login, navegar al login
    // Si no, reiniciar para volver al paso 1
    if (rutaDestino === "/login") {
      navigate("/login");
    } else {
      reiniciar();
    }
  };

  const cancelarSalida = () => {
    setMostrarModal(false);
  };

  // ===== HANDLERS =====
  const handleCorreoChange = (e) => {
    setCorreo(e.target.value);
    if (errorCorreo) setErrorCorreo("");
  };

  const handleVerificar = async (e) => {
    e.preventDefault();

    const correoLimpio = correo.trim();
    if (!correoLimpio) {
      setErrorCorreo("El correo electrónico es obligatorio");
      return;
    }

    const correoRegex = /^(?!\.)(?!.*\.\.)([a-zA-Z0-9]+([._-]?[a-zA-Z0-9]+)*)@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    if (!correoRegex.test(correoLimpio)) {
      setErrorCorreo("El correo electrónico no tiene un formato válido");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:3000/usuarios/verificar-correo-alternativo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo_electronico: correoLimpio }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorCorreo(data.mensaje || "Correo no encontrado");
        return;
      }

      setResultado(data);

    } catch (error) {
      setErrorCorreo("Error de conexión. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnviarAlternativo = async () => {
    setEnviando(true);
    try {
      const res = await fetch("http://localhost:3000/usuarios/recuperar-con-alternativo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo_electronico: correo.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setAlertData({
          type: "success",
          title: "¡Enlace enviado!",
          message: "Se ha enviado el enlace de recuperación a tu correo alternativo. Revisa tu bandeja de entrada."
        });
      } else {
        setAlertData({
          type: "error",
          title: "Error",
          message: data.mensaje || "No se pudo enviar el enlace."
        });
      }
      setMostrarAlert(true);

    } catch (error) {
      setAlertData({
        type: "error",
        title: "Error",
        message: "Error de conexión. Intenta de nuevo."
      });
      setMostrarAlert(true);
    } finally {
      setEnviando(false);
    }
  };

  const cerrarAlert = () => {
    setMostrarAlert(false);
    if (alertData.type === "success") {
      setEnviado(true); // En lugar de navegar directo
    }
  };

  const reiniciar = () => {
    setCorreo("");
    setErrorCorreo("");
    setResultado(null);
  };

  return {
    correo,
    errorCorreo,
    isSubmitting,
    resultado,
    enviando,
    enviado,
    mostrarAlert,
    alertData,
    mostrarModal,
    handleCorreoChange,
    handleVerificar,
    handleEnviarAlternativo,
    cerrarAlert,
    reiniciar,
    intentarSalir,
    confirmarSalida,
    cancelarSalida,
  };
}