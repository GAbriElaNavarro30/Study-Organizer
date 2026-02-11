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
    handleEmailChange,
    handleSubmit,
    intentarSalir,
    confirmarSalida,
    cancelarSalida,
    cerrarAlert,
  } = useOlvidarC();

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
        </form>

        {/* ===== Custom Alert ===== */}
        {mostrarAlert && (
          <CustomAlert
            type={alertData.type}
            title={alertData.title}
            message={alertData.message}
            logo={logo}
            onClose={cerrarAlert}
          />
        )}

        {/* ===== Modal Confirmar Cancelar ===== */}
        <ModalConfirmarCancelar
          isOpen={mostrarModal}
          onConfirm={confirmarSalida}
          onCancel={cancelarSalida}
        />
      </div>
    </>
  );
}