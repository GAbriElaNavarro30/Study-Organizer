import "../styles/login.css";
import logoLogin from "../assets/imagenes/logotipo-footer.png";
import logo from "../assets/imagenes/logotipo.png";
import { Link } from "react-router-dom";
import { IoArrowBack, IoEye, IoEyeOff } from "react-icons/io5";
import { CustomAlert } from "../components/CustomAlert";
import { useLogin } from "../hooks/useLogin";

export function Login() {
  const {
    mostrarPassword,
    setMostrarPassword,
    correo,
    password,
    errores,
    alert,
    handleSubmit,
    handleAlertClose,
    handleCorreoChange,
    handlePasswordChange,
  } = useLogin();
 
  return (
    <div className="contenedor-login">
      <div className="logo-login">
        <img src={logoLogin} alt="Logotipo" className="logotipo-login" />
        <p className="eslogan-login">Organiza tu estudio, cuida tu bienestar</p>
      </div>

      <div className="contenedor-formulario-login">
        <form className="formulario-login" onSubmit={handleSubmit}>
          <Link to="/" className="btn-volver">
            <IoArrowBack />
          </Link>

          <h2>Iniciar sesión</h2>

          {/* Campo correo */}
          <div className="campo">
            <label>Correo electrónico</label>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={correo}
              onChange={handleCorreoChange}
            />
            {errores.correo && <p className="mensaje-error">{errores.correo}</p>}
          </div>

          {/* Campo contraseña */}
          <div className="campo campo-password">
            <label>Contraseña</label>
            <div className="input-password">
              <input
                type={mostrarPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={handlePasswordChange}
              />
              <span
                className="icono-password"
                onClick={() => setMostrarPassword(!mostrarPassword)}
              >
                {mostrarPassword ? <IoEyeOff /> : <IoEye />}
              </span>
            </div>
            {errores.password && <p className="mensaje-error">{errores.password}</p>}
          </div>

          <button type="submit" className="boton-login">
            Iniciar Sesión
          </button>

          <Link to="/olvidar-contrasena" className="link-olvidaste">
            ¿Olvidaste tu contraseña?
          </Link>

          <hr className="separador-login" />

          <Link to="/registrarse" className="btn-crear-cuenta">
            Crear cuenta
          </Link>
        </form>
      </div>

      {/* CustomAlert */}
      {alert.mostrar && (
        <CustomAlert
          type={alert.type}
          title={alert.title}
          message={alert.message}
          logo={logo}
          onClose={handleAlertClose}
        />
      )}
    </div>
  );
}