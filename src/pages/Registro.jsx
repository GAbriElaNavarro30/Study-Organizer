import "../styles/registro.css";
import { Link } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { useState } from "react";
import { IoEye, IoEyeOff } from "react-icons/io5";


export function Registro() {
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);

    return (
        <>
            <div className="contenedor-registro">
                <form className="formulario-registro">
                    <Link to="/" className="btn-volver">
                        <IoArrowBack />
                    </Link>

                    <h2>Crea una cuenta</h2>
                    <p>Es fácil y seguro.</p>

                    <hr className="separador" />

                    <div className="campo">
                        <label>Nombre</label>
                        <input
                            type="text"
                            placeholder="Nombre"
                            required
                        />
                    </div>

                    {/*<div className="fila-campos">
                        <div className="campo">
                            <label>Nombre</label>
                            <input
                                type="text"
                                placeholder="Nombre"
                                required
                            />
                        </div>

                        <div className="campo">
                            <label>Apellido</label>
                            <input
                                type="text"
                                placeholder="Apellido"
                                required
                            />
                        </div>
                    </div>*/}

                    <div className="fila-campos">
                        <div className="campo">
                            <label>Fecha de nacimiento</label>
                            <input
                                type="date"
                                required
                            />
                        </div>

                        <div className="campo">
                            <label>Teléfono</label>
                            <input
                                type="tel"
                                placeholder="Ej. 5512345678"
                                pattern="[0-9]{10}"
                                required
                            />
                        </div>
                    </div>

                    <div className="fila-campos">
                        <div className="campo">
                            <label>Género</label>

                            <div className="opciones-genero">
                                <label className="radio-opcion">
                                    <input type="radio" name="genero" value="mujer" required />
                                    Mujer
                                </label>

                                <label className="radio-opcion">
                                    <input type="radio" name="genero" value="hombre" />
                                    Hombre
                                </label>

                                <label className="radio-opcion">
                                    <input type="radio" name="genero" value="otro" />
                                    Otro
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="campo">
                        <label>Correo electrónico</label>
                        <input
                            type="email"
                            placeholder="correo@ejemplo.com"
                            required
                        />
                    </div>

                    <div className="fila-campos">
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


                        <div className="campo campo-password">
                            <label>Confirmar contraseña</label>

                            <div className="input-password">
                                <input
                                    type={mostrarConfirmPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    required
                                />

                                <span
                                    className="icono-password"
                                    onClick={() => setMostrarConfirmPassword(!mostrarConfirmPassword)}
                                >
                                    {mostrarConfirmPassword ? <IoEyeOff /> : <IoEye />}
                                </span>
                            </div>
                        </div>

                    </div>

                    <button type="submit" className="btn-registrar">
                        Registrarse
                    </button>

                    <p className="texto-login">
                        <span>¿Ya tienes cuenta?</span>
                        <Link to="/login">Inicia sesión</Link>
                    </p>

                </form>
            </div>
        </>
    );
}