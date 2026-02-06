import "../styles/olvidarc.css";
import { Link } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { useState } from "react";
import api from "../services/api";
import { CustomAlert } from "../components/CustomAlert";
import logo from "../assets/imagenes/logotipo-footer.png";
import { useNavigate } from "react-router-dom";
import { ModalConfirmarCancelar } from "../components/ModalConfirmarCancelar";
import { HeaderExtO } from "../components/HeaderExtO";

export function OlvidarC() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

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
    if (email.trim()) {
      setRutaDestino(ruta);
      setMostrarModal(true);
    } else {
      navigate(ruta);
    }
  };

  // ===== SUBMIT =====
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("El campo es obligatorio");
      return;
    }

    const correoRegex =
      /^(?!\.)(?!.*\.\.)([a-zA-Z0-9]+([._-]?[a-zA-Z0-9]+)*)@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

    if (!correoRegex.test(email)) {
      setError(
        "El correo electrónico no cumple con un formato válido y profesional"
      );
      return;
    }

    const parteUsuario = email.split("@")[0];
    if (parteUsuario.length > 64) {
      setError("El correo no debe superar 64 caracteres antes del @");
      return;
    }

    setError("");

    try {
      const response = await api.post("/usuarios/recuperar-contrasena", {
        correo_electronico: email,
      });

      setAlertData({
        type: "success",
        title: "Correo enviado",
        message: response.data.mensaje,
      });
      setMostrarAlert(true);
      setEmail("");

    } catch (err) {
      const status = err.response?.status;
      const mensaje = err.response?.data?.mensaje;

      if (status === 404) {
        setError(mensaje);
        return;
      }

      setAlertData({
        type: "error",
        title: "Error",
        message: mensaje || "Error al enviar el enlace de recuperación",
      });
      setMostrarAlert(true);
    }
  };

  return (
    <>
      {/* ===== HEADER ===== */}
      <HeaderExtO onAcceder={() => intentarSalir("/login")} />

      <div className="contenedor-olvidar">
        <form className="form-olvidar" onSubmit={handleSubmit}>
          {/* ===== VOLVER ===== */}
          <Link
            to="/"
            className="btn-volver"
            onClick={(e) => {
              e.preventDefault();
              intentarSalir("/");
            }}
          >
            <IoArrowBack />
          </Link>

          <h2>Recupera tu cuenta</h2>
          <hr className="linea-separadora-o" />

          <p>
            Ingresa tu correo electrónico y te enviaremos
            un enlace para recuperar tu cuenta.
          </p>

          <div className="campo-olvidar">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={error ? "input-error" : ""}
            />
            {error && <p className="mensaje-error">{error}</p>}
          </div>

          <button type="submit" className="btn-recuperar">
            Enviar enlace
          </button>
        </form>

        {/* ===== Custom Alert ===== */}
        {mostrarAlert && (
          <CustomAlert
            type={alertData.type}
            title={alertData.title}
            message={alertData.message}
            logo={logo}
            onClose={() => setMostrarAlert(false)}
          />
        )}

        {/* ===== Modal Confirmar Cancelar ===== */}
        <ModalConfirmarCancelar
          isOpen={mostrarModal}
          onConfirm={() => {
            setMostrarModal(false);
            navigate(rutaDestino);
          }}
          onCancel={() => setMostrarModal(false)}
        />
      </div>
    </>
  );
}
