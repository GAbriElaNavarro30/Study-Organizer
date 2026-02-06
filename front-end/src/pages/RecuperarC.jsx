import "../styles/olvidarc.css";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { IoArrowBack, IoEye, IoEyeOff } from "react-icons/io5";
import { useState } from "react";
import api from "../services/api";

export function RecuperarC() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token"); // token del correo

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);

  // Si no hay token, no mostrar el formulario
  if (!token) {
    return (
      <div className="recuperar-contrasena">
        <div className="form-recuperar">
          <h2>Enlace inválido</h2>
          <p className="mensaje-error">
            El enlace de recuperación es inválido o ha expirado.
          </p>
          <Link to="/" className="btn-recuperar">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMensaje("");

    if (!password || !confirmPassword) {
      setError("Todos los campos son obligatorios");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      const response = await api.post("/usuarios/resetear-contrasena", {
        token,
        nueva_contrasena: password,
      });

      setMensaje(response.data.mensaje);

      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.mensaje || "Error al restablecer la contraseña"
      );
    }
  };

  return (
    <div className="recuperar-contrasena">
      <form className="form-recuperar" onSubmit={handleSubmit}>
        <Link to="/" className="btn-volver">
          <IoArrowBack />
        </Link>

        <h2>Restablecer contraseña</h2>
        <hr className="linea-separadora-rc" />

        <p className="texto-recuperar">
          Ingresa tu nueva contraseña y confírmala para recuperar el acceso a tu cuenta.
        </p>

        <div className="campo-recuperar campo-password">
          <label>Nueva contraseña</label>
          <div className="input-password">
            <input
              type={mostrarPassword ? "text" : "password"}
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className="icono-password"
              onClick={() => setMostrarPassword(!mostrarPassword)}
            >
              {mostrarPassword ? <IoEyeOff /> : <IoEye />}
            </span>
          </div>
        </div>

        <div className="campo-recuperar campo-password">
          <label>Confirmar contraseña</label>
          <div className="input-password">
            <input
              type={mostrarConfirmPassword ? "text" : "password"}
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <span
              className="icono-password"
              onClick={() =>
                setMostrarConfirmPassword(!mostrarConfirmPassword)
              }
            >
              {mostrarConfirmPassword ? <IoEyeOff /> : <IoEye />}
            </span>
          </div>
        </div>

        {error && <p className="mensaje-error">{error}</p>}
        {mensaje && <p className="mensaje-exito">{mensaje}</p>}

        <button type="submit" className="btn-recuperar">
          Guardar cambios
        </button>
      </form>
    </div>
  );
}