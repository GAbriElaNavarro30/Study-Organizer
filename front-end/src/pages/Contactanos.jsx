import contactanos from "../assets/imagenes/fondo-contactanos.png";
import "../styles/contactanos.css";
import { FaFacebookF, FaInstagram, FaEnvelope } from "react-icons/fa";
import { useContacto } from "../hooks/useContacto";

export function Contactanos() {
    const {
        nombre,
        correo,
        mensaje,
        errores,
        enviando,
        exitoso,
        handleSubmit,
        handleNombreChange,
        handleCorreoChange,
        handleMensajeChange,
    } = useContacto();

    return (
        <div className="contenedor-contactanos">

            <div className="imagen-contactanos">
                <img src={contactanos} alt="Contáctanos" className="imagen-contacto" />
            </div>

            <section className="contenido-contactanos">
                <h2>Contáctanos</h2>

                <p className="texto-contactanos">
                    ¿Tienes alguna duda, sugerencia o necesitas apoyo?
                    Escríbenos y con gusto te responderemos lo antes posible.
                </p>

                <div className="contacto-grid">

                    <form className="form-contactanos" onSubmit={handleSubmit}>

                        {exitoso && (
                            <div className="alerta-exito-contacto">
                                Tu mensaje fue enviado correctamente. Te responderemos pronto.
                            </div>
                        )}

                        {errores.general && (
                            <div className="alerta-error-contacto">{errores.general}</div>
                        )}

                        <div className="campo-contacto">
                            <label htmlFor="nombre">
                                Nombre <span className="requerido">*</span>
                            </label>
                            <input
                                type="text"
                                id="nombre"
                                placeholder="Tu nombre"
                                value={nombre}
                                onChange={handleNombreChange}
                                disabled={enviando}
                                className={errores.nombre ? "input-error-contacto" : ""}
                            />
                            {errores.nombre && <span className="error-contacto">{errores.nombre}</span>}
                        </div>

                        <div className="campo-contacto">
                            <label htmlFor="correo">
                                Correo electrónico <span className="requerido">*</span>
                            </label>
                            <input
                                type="email"
                                id="correo"
                                placeholder="ejemplo@correo.com"
                                value={correo}
                                onChange={handleCorreoChange}
                                disabled={enviando}
                                className={errores.correo ? "input-error-contacto" : ""}
                            />
                            {errores.correo && <span className="error-contacto">{errores.correo}</span>}
                        </div>

                        <div className="campo-contacto">
                            <label htmlFor="mensaje">
                                Mensaje <span className="requerido">*</span>
                            </label>
                            <textarea
                                id="mensaje"
                                rows="4"
                                placeholder="Escribe tu mensaje aquí"
                                value={mensaje}
                                onChange={handleMensajeChange}
                                disabled={enviando}
                                className={errores.mensaje ? "input-error-contacto" : ""}
                            />
                            {errores.mensaje && <span className="error-contacto">{errores.mensaje}</span>}
                        </div>

                        <button type="submit" className="btn-contacto" disabled={enviando}>
                            {enviando ? "Enviando..." : "Enviar mensaje"}
                        </button>
                    </form>

                    <aside className="info-contacto">
                        <h3>Información de contacto</h3>
                        <p>También puedes encontrarnos en nuestras redes sociales o escribirnos directamente.</p>
                        <div className="redes-contacto">
                            <a href="#" aria-label="Facebook">
                                <FaFacebookF /><span>Facebook</span>
                            </a>
                            <a href="#" aria-label="Instagram">
                                <FaInstagram /><span>Instagram</span>
                            </a>
                            <a href="mailto:studyorganizer.contactosoporte@gmail.com">
                                <FaEnvelope /><span>studyorganizer.contactosoporte@gmail.com</span>
                            </a>
                        </div>
                    </aside>

                </div>
            </section>
        </div>
    );
}