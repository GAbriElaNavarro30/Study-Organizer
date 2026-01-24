import "../styles/login.css";
import logoLogin from "../assets/imagenes/logotipo-footer.png";
import { Link } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { useState } from "react";
import { IoEye, IoEyeOff } from "react-icons/io5";

export function Login() {
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);

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

                        <div className="campo campo-password">
                            <label>Contraseña</label>

                            <div className="input-password">
                                <input
                                    type={mostrarPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    required
                                />

                                <span
                                    className="icono-password"
                                    onClick={() => setMostrarPassword(!mostrarPassword)}
                                >
                                    {mostrarPassword ? <IoEyeOff /> : <IoEye />}
                                </span>
                            </div>
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

            </div>
        </>
    );
}