import "../styles/olvidarc.css";
import { Link } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { useState } from "react";
import { IoEye, IoEyeOff } from "react-icons/io5";

export function RecuperarC() {
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);

    return (
        <div className="recuperar-contrasena">
            <form className="form-recuperar">
                <Link to="/" className="btn-volver">
                    <IoArrowBack />
                </Link>

                <h2>Restablecer contraseña</h2>

                <hr className="linea-separadora-rc" />

                <p className="texto-recuperar">
                    Ingresa tu nueva contraseña y confírmala para
                    recuperar el acceso a tu cuenta.
                </p>

                <div className="campo-recuperar campo-password">
                    <label htmlFor="password">Nueva contraseña</label>

                    <div className="input-password">
                        <input
                            type={mostrarPassword ? "text" : "password"}
                            id="password"
                            placeholder="Nueva contraseña"
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


                <div className="campo-recuperar campo-password">
                    <label htmlFor="confirmPassword">Confirmar contraseña</label>

                    <div className="input-password">
                        <input
                            type={mostrarConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            placeholder="Confirmar contraseña"
                            required
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

                <button type="submit" className="btn-recuperar">
                    Guardar cambios
                </button>
            </form>
        </div>
    );
}
