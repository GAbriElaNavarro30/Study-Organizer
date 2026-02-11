import "../styles/olvidarc.css";
import { Link } from "react-router-dom";
import { IoArrowBack, IoEye, IoEyeOff } from "react-icons/io5";
import { CustomAlert } from "../components/CustomAlert";
import logo from "../assets/imagenes/logotipo.png";
import { ModalConfirmarCancelar } from "../components/ModalConfirmarCancelar";
import { HeaderExtO } from "../components/HeaderExtO";
import { useRecuperarC } from "../hooks/useRecuperarC";

export function RecuperarC() {
  const {
    token,
    password,
    confirmPassword,
    error,
    isSubmitting,
    mostrarPassword,
    mostrarConfirmPassword,
    mostrarModal,
    alert,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handleSubmit,
    intentarSalir,
    confirmarSalida,
    cancelarSalida,
    toggleMostrarPassword,
    toggleMostrarConfirmPassword,
    cerrarAlert,
  } = useRecuperarC();

  // Si no hay token, mostrar mensaje de error
  if (!token) {
    return (
      <>
        <HeaderExtO onAcceder={() => window.location.href = "/login"} />
        <div className="recuperar-contrasena">
          <div className="form-recuperar">
            <h2>Enlace inválido</h2>
            <p className="mensaje-error">
              El enlace de recuperación es inválido o no se proporcionó.
            </p>
            <Link to="/login" className="btn-recuperar">
              Ir al inicio de sesión
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* ===== HEADER ===== */}
      <HeaderExtO onAcceder={() => intentarSalir("/login")} />

      <div className="recuperar-contrasena">
        <form className="form-recuperar" onSubmit={handleSubmit}>
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

          <h2>Restablecer contraseña</h2>
          <hr className="linea-separadora-rc" />

          <p className="texto-recuperar">
            Ingresa tu nueva contraseña y confírmala para recuperar el acceso a
            tu cuenta.
          </p>

          {/* ===== CAMPO: NUEVA CONTRASEÑA ===== */}
          <div className="campo-recuperar campo-password">
            <label>Nueva contraseña</label>
            <div className="input-password">
              <input
                type={mostrarPassword ? "text" : "password"}
                placeholder="Nueva contraseña"
                value={password}
                onChange={handlePasswordChange}
                disabled={isSubmitting}
              />
              <span
                className="icono-password"
                onClick={toggleMostrarPassword}
              >
                {mostrarPassword ? <IoEyeOff /> : <IoEye />}
              </span>
            </div>
          </div>

          {/* ===== CAMPO: CONFIRMAR CONTRASEÑA ===== */}
          <div className="campo-recuperar campo-password">
            <label>Confirmar contraseña</label>
            <div className="input-password">
              <input
                type={mostrarConfirmPassword ? "text" : "password"}
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                disabled={isSubmitting}
              />
              <span
                className="icono-password"
                onClick={toggleMostrarConfirmPassword}
              >
                {mostrarConfirmPassword ? <IoEyeOff /> : <IoEye />}
              </span>
            </div>
          </div>

          {/* ===== MENSAJE DE ERROR ===== */}
          {error && <p className="mensaje-error">{error}</p>}

          {/* ===== BOTÓN SUBMIT ===== */}
          <button
            type="submit"
            className="btn-recuperar"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>

        {/* ===== CUSTOM ALERT ===== */}
        {alert.visible && (
          <CustomAlert
            type={alert.type}
            title={alert.title}
            message={alert.message}
            logo={logo}
            onClose={cerrarAlert}
          />
        )}

        {/* ===== MODAL CONFIRMAR SALIR ===== */}
        <ModalConfirmarCancelar
          isOpen={mostrarModal}
          onConfirm={confirmarSalida}
          onCancel={cancelarSalida}
        />
      </div>
    </>
  );
}