import "../styles/preguntasFrecuentes.css";
import { FaChevronDown } from "react-icons/fa";
import { usePreguntasFrecuentes } from "../hooks/usePreguntasFrecuentes";
import { Link } from "react-router-dom";

// ── Respuestas con JSX especial ────────────────────────────────
const RESPUESTAS_JSX = {
    c5_jsx: (
        <p className="faq-respuesta">
            Si deseas eliminar tu cuenta, comunícate con nuestro equipo de soporte a través
            del formulario de{" "}
            <Link to="/contactanos" className="faq-respuesta-link">Contáctanos</Link>
            {" "}o escribiéndonos a{" "}
            <a
                href="mailto:studyorganizer.contactosoporte@gmail.com?subject=Deseo%20Eliminar%20mi%20Cuenta"
                className="faq-respuesta-link"
            >
                studyorganizer.contactosoporte@gmail.com
            </a>
            . Procesaremos tu solicitud a la brevedad.
        </p>
    ),

    s1_jsx: (
        <p className="faq-respuesta">
            Puedes reportar cualquier problema a través del formulario en la sección de{" "}
            <Link to="/contactanos" className="faq-respuesta-link">Contáctanos</Link>
            , o enviarnos un correo a{" "}
            <a
                href="mailto:studyorganizer.contactosoporte@gmail.com?subject=Reporte%20de%20Problema%20T%C3%A9cnico"
                className="faq-respuesta-link"
            >
                studyorganizer.contactosoporte@gmail.com
            </a>
            {" "}describiendo el problema. Incluye capturas de pantalla si es posible
            para ayudarnos a resolverlo más rápido.
        </p>
    ),

    s3_jsx: (
        <p className="faq-respuesta">
            Sí, puedes encontrarnos en{" "}
            {/* TODO: reemplaza "#" con la URL real de Facebook cuando esté disponible */}
            <a
                href="#"
                className="faq-respuesta-link"
                target="_blank"
                rel="noopener noreferrer"
            >
                Facebook
            </a>
            {" "}e{" "}
            {/* TODO: reemplaza "#" con la URL real de Instagram cuando esté disponible */}
            <a
                href="#"
                className="faq-respuesta-link"
                target="_blank"
                rel="noopener noreferrer"
            >
                Instagram
            </a>
            . También puedes escribirnos directamente al correo{" "}
            <a
                href="mailto:studyorganizer.contactosoporte@gmail.com"
                className="faq-respuesta-link"
            >
                studyorganizer.contactosoporte@gmail.com
            </a>
            .
        </p>
    ),
};

export function PreguntasFrecuentes() {

    const {
        categorias,
        categoriasFiltradas,
        categoriaActiva,
        abierta,
        togglePregunta,
        seleccionarCategoria,
    } = usePreguntasFrecuentes();

    return (
        <div className="faq-page">

            {/* ── HEADER ── */}
            <div className="faq-header">
                <h1 className="faq-titulo">Preguntas frecuentes</h1>
                <p className="faq-subtitulo">
                    Encuentra respuestas a las dudas más comunes sobre Study Organizer.
                    Si no encuentras lo que buscas, puedes escribirnos desde{" "}
                    <Link to="/contactanos" className="faq-link">Contáctanos</Link>.
                </p>
            </div>

            {/* ── LAYOUT SIDEBAR + MAIN ── */}
            <div className="faq-layout">

                {/* SIDEBAR */}
                <aside className="faq-sidebar">
                    <div className="faq-sidebar-label">Categorías</div>
                    <nav className="faq-sidebar-nav">
                        <button
                            className={`faq-sidebar-item ${!categoriaActiva ? "activa" : ""}`}
                            onClick={() => seleccionarCategoria(null)}
                        >
                            <span className="faq-sidebar-dot" />
                            Todas las preguntas
                        </button>
                        {categorias.map((cat) => (
                            <button
                                key={cat.id}
                                className={`faq-sidebar-item ${categoriaActiva === cat.id ? "activa" : ""}`}
                                onClick={() => seleccionarCategoria(cat.id)}
                            >
                                <span className="faq-sidebar-dot" />
                                {cat.titulo}
                            </button>
                        ))}
                    </nav>

                </aside>

                {/* MAIN */}
                <main className="faq-main">
                    <div className="faq-contenido">
                        {categoriasFiltradas.map((categoria) => (
                            <section key={categoria.id} className="faq-seccion">

                                <h2 className="faq-seccion-titulo">{categoria.titulo}</h2>

                                <div className="faq-lista">
                                    {categoria.preguntas.map((item) => {
                                        const estaAbierta = abierta === item.id;
                                        return (
                                            <div
                                                key={item.id}
                                                className={`faq-item${estaAbierta ? " abierta" : ""}`}
                                            >
                                                <button
                                                    className="faq-pregunta"
                                                    onClick={() => togglePregunta(item.id)}
                                                    aria-expanded={estaAbierta}
                                                >
                                                    <span>{item.pregunta}</span>
                                                    <FaChevronDown className="faq-icono" />
                                                </button>

                                                <div className="faq-respuesta-wrapper">
                                                    {item.jsx
                                                        ? RESPUESTAS_JSX[item.respuesta]
                                                        : <p className="faq-respuesta">{item.respuesta}</p>
                                                    }
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                            </section>
                        ))}
                    </div>
                </main>

            </div>

            {/* ── CTA FOOTER ── */}
            <div className="faq-footer">
                <p>¿No encontraste tu respuesta?</p>
                <Link to="/contactanos" className="faq-btn-contacto">
                    Escríbenos
                </Link>
            </div>

        </div>
    );
}