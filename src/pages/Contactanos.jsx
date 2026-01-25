import contactanos from "../assets/imagenes/fondo-contactanos.png";
import "../styles/contactanos.css";
import { FaFacebookF, FaInstagram, FaEnvelope } from "react-icons/fa";

export function Contactanos() {
    return (
        <div className="contenedor-contactanos">

            {/* Imagen */}
            <div className="imagen-contactanos">
                <img
                    src={contactanos}
                    alt="Contáctanos"
                    className="imagen-contacto"
                />
            </div>

            {/* Contenido */}
            <section className="contenido-contactanos">
                <h2>Contáctanos</h2>

                <p className="texto-contactanos">
                    ¿Tienes alguna duda, sugerencia o necesitas apoyo?
                    Escríbenos y con gusto te responderemos lo antes posible.
                </p>

                <div className="contacto-grid">

                    {/* Formulario */}
                    <form className="form-contactanos">
                        <div className="campo-contacto">
                            <label htmlFor="nombre">
                                Nombre <span className="requerido">*</span>
                            </label>
                            <input
                                type="text"
                                id="nombre"
                                placeholder="Tu nombre"
                                required
                            />
                        </div>

                        <div className="campo-contacto">
                            <label htmlFor="correo">
                                Correo electrónico <span className="requerido">*</span>
                            </label>
                            <input
                                type="email"
                                id="correo"
                                placeholder="ejemplo@correo.com"
                                required
                            />
                        </div>

                        <div className="campo-contacto">
                            <label htmlFor="mensaje">
                                Mensaje <span className="requerido">*</span>
                            </label>
                            <textarea
                                id="mensaje"
                                rows="4"
                                placeholder="Escribe tu mensaje aquí"
                                required
                            />
                        </div>

                        <button type="submit" className="btn-contacto">
                            Enviar mensaje
                        </button>
                    </form>

                    {/* Redes y contacto */}
                    <aside className="info-contacto">
                        <h3>Información de contacto</h3>

                        <p>
                            También puedes encontrarnos en nuestras redes
                            sociales o escribirnos directamente.
                        </p>

                        <div className="redes-contacto">
                            <a href="#" aria-label="Facebook">
                                <FaFacebookF />
                                <span>Facebook</span>
                            </a>

                            <a href="#" aria-label="Instagram">
                                <FaInstagram />
                                <span>Instagram</span>
                            </a>

                            <a href="mailto:studyorganizer.contactosoporte@gmail.com">
                                <FaEnvelope />
                                <span>studyorganizer.contactosoporte@gmail.com</span>
                            </a>
                        </div>
                    </aside>

                </div>
            </section>

        </div>
    );
}
