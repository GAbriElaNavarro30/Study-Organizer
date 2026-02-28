import "../styles/olvidarc.css";
import { Link } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { CustomAlert } from "../components/CustomAlert";
import logo from "../assets/imagenes/logotipo-footer.png";
import { ModalConfirmarCancelar } from "../components/ModalConfirmarCancelar";
import { HeaderExtO } from "../components/HeaderExtO";
import { useOlvidarC } from "../hooks/useOlvidarC";

export function OlvidarC() {
  const {
    email,
    error,
    isSubmitting,
    mostrarModal,
    mostrarAlert,
    alertData,
    enviado,
    handleEmailChange,
    handleSubmit,
    intentarSalir,
    confirmarSalida,
    cancelarSalida,
    cerrarAlert,
  } = useOlvidarC();

  return (
    <>
      <HeaderExtO onAcceder={() => intentarSalir("/login")} />

      <div className="contenedor-olvidar">
        <form className="form-olvidar" onSubmit={handleSubmit}>
          <Link
            to="/login"
            className="btn-volver"
            onClick={(e) => {
              e.preventDefault();
              intentarSalir("/login");
            }}
          >
            <IoArrowBack />
          </Link>

          <h2>Recupera tu cuenta</h2>
          <hr className="linea-separadora-o" />

          {/* ===== VISTA SEGÚN ESTADO ===== */}
          {enviado ? (
            <>
              <p className="texto-confirmacion">
                Se ha enviado el enlace de recuperación a tu correo electrónico,
                revisa tu bandeja de entrada.
              </p>

              <p className="texto-reenviar">
                ¿No recibiste el enlace?{" "}
                <button
                  type="button"
                  className="link-reenviar"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Reenviando..." : "Reenviar"}
                </button>
              </p>
            </>
          ) : (
            <>
              <p>
                Ingresa tu correo electrónico y te enviaremos un enlace para
                recuperar tu cuenta.
              </p>

              <div className="campo-olvidar">
                <label htmlFor="email">Correo electrónico</label>
                <input
                  type="email"
                  id="email"
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={handleEmailChange}
                  className={error ? "input-error" : ""}
                  disabled={isSubmitting}
                />
                {error && <p className="mensaje-error">{error}</p>}
              </div>

              <button
                type="submit"
                className="btn-recuperar"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enviando..." : "Enviar enlace"}
              </button>

              <div className="link-alternativo-wrapper">
                <Link to="/correo-alternativo" className="link-alternativo">
                  Usar otro método de recuperación
                </Link>
              </div>
            </>
          )}
        </form>

        {mostrarAlert && (
          <CustomAlert
            type={alertData.type}
            title={alertData.title}
            message={alertData.message}
            logo={logo}
            onClose={cerrarAlert}
          />
        )}

        <ModalConfirmarCancelar
          isOpen={mostrarModal}
          onConfirm={confirmarSalida}
          onCancel={cancelarSalida}
        />
      </div>
    </>
  );
}