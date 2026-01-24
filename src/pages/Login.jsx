import "../styles/login.css";
import logoLogin from "../assets/imagenes/logotipo-footer.png";
import { Link } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";

export function Login() {
    return (
        <>
            <div className="contenedor-login">
                <div className="logo-login">
                    <img src={logoLogin} alt="Logotipo" className="logotipo-login" />
                </div>

                <div className="contenedor-formulario-login">
                    <form className="formulario-login">
                        <Link to="/" className="btn-volver">
                            <IoArrowBack />
                        </Link>

                        <h2>Iniciar sesión</h2>

                        <div className="campo">
                            <label>Correo electrónico</label>
                            <input
                                type="email"
                                placeholder="correo@ejemplo.com"
                                required
                            />
                        </div>

                        <div className="campo">
                            <label>Contraseña</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button type="submit" className="boton-login">
                            Iniciar Sesión
                        </button>

                        <Link to="/recuperar-contrasena" className="link-olvidaste">
                            ¿Olvidaste tu contraseña?
                        </Link>

                        <hr className="separador-login" />

                        <Link to="/registrarse" className="btn-crear-cuenta">
                            Crear cuenta
                        </Link>

                    </form>
                </div>

            </div>
        </>
    );
}