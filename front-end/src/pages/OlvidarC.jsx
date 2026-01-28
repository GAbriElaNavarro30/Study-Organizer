import "../styles/olvidarc.css";
import { Link } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";

export function OlvidarC() {
    return (
        <div className="contenedor-olvidar">
            <form className="form-olvidar">
                <Link to="/" className="btn-volver">
                    <IoArrowBack />
                </Link>

                <h2>Recupera tu cuenta</h2>

                <hr className="linea-separadora-o" />

                <p>
                    Ingresa tu correo electrónico y te enviaremos
                    un enlace para recuperar tu cuenta.
                </p>

                <div className="campo-olvidar">
                    <label htmlFor="email">Correo electrónico</label>
                    <input
                        type="email"
                        id="email"
                        placeholder="ejemplo@correo.com"
                        required
                    />
                </div>

                <button type="submit" className="btn-recuperar">
                    Enviar enlace
                </button>
            </form>
        </div>
    );
}
