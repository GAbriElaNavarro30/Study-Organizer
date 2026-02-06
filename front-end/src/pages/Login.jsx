import "../styles/login.css";
import logoLogin from "../assets/imagenes/logotipo-footer.png";
import { Link } from "react-router-dom";
import { IoArrowBack, IoEye, IoEyeOff } from "react-icons/io5";
import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { CustomAlert } from "../components/CustomAlert"; // importa tu CustomAlert
import logo from "../assets/imagenes/logotipo.png";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export function Login() {
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [errores, setErrores] = useState({ correo: "", password: "" });
  const [alert, setAlert] = useState({ mostrar: false, type: "", title: "", message: "" });
  const [redirectPath, setRedirectPath] = useState(""); // Guardamos la ruta de redirección
  const navigate = useNavigate();
  const { setUsuario, setLoading } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación manual
    let nuevosErrores = { correo: "", password: "" };
    let hayError = false;

    if (!correo.trim()) {
      nuevosErrores.correo = "El correo es obligatorio";
      hayError = true;
    }

    if (!password.trim()) {
      nuevosErrores.password = "La contraseña es obligatoria";
      hayError = true;
    }

    setErrores(nuevosErrores);
    if (hayError) return;

    try {
      const res = await api.post("/usuarios/login", {
        correo_electronico: correo,
        contrasena: password,
      });


      // Determinar ruta según rol
      let ruta = "/";
      const rol = res.data.usuario.rol;
      if (rol === 2) ruta = "/dashboard";
      else if (rol === 1 || rol === 3) ruta = "/home";

      setRedirectPath(ruta); // Guardamos ruta para redirigir después
      setUsuario(res.data.usuario);
      setLoading(false);

      // Mostrar alerta de éxito
      setAlert({
        mostrar: true,
        type: "success",
        title: "Inicio de sesión exitoso",
        message: `Bienvenido, ${res.data.usuario.nombre}!`,
      });

    } catch (error) {
      const mensajeBackend = error.response?.data?.mensaje || "";

      if (mensajeBackend === "No encontrado") {
        setErrores({ correo: "Correo electrónico incorrecto, no está registrado", password: "" });
      } else if (mensajeBackend === "Contraseña incorrecta") {
        setErrores({ correo: "", password: "Contraseña incorrecta" });
      } else {
        setErrores({ correo: "", password: "Error al iniciar sesión" });

        console.error("Error login completo:", error);   // <--- línea clave
        console.error("Error response.data:", error.response?.data);
      }
    }
  };

  // Función para cerrar alerta y redirigir
  const handleAlertClose = () => {
    setAlert({ ...alert, mostrar: false });
    if (redirectPath) navigate(redirectPath);
  };

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
              onChange={(e) => setCorreo(e.target.value)}
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
                onChange={(e) => setPassword(e.target.value)}
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
