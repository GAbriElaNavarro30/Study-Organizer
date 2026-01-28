import "../styles/manual.css";
import { AiFillFilePdf } from "react-icons/ai";
import { AiFillPlayCircle } from "react-icons/ai";
import Manual from "../assets/manual/manual-usuario.pdf";

export function ManualUsuario() {
    return (
        <>
            <div className="manual-container">
                <h1>Manual de Usuario</h1>

                {/* Sección del documento */}
                <section className="manual-section">
                    <div className="titulo-documento">
                        <AiFillFilePdf className="icono-pdf" />
                        <h2>Documento</h2>
                    </div>
                    <p>
                        Aquí puedes consultar el manual en formato PDF. Haz clic en el botón
                        para abrirlo o descargarlo.
                    </p>
                    <a
                        href={Manual}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Abrir Documento
                    </a>
                </section>

                {/* Sección del video */}
                <section className="manual-section">
                    <div className="titulo-video">
                        <AiFillPlayCircle className="icono-video" />
                        <h2>Video Tutorial</h2>
                    </div>

                    <p>Mira el video explicativo del manual de usuario.</p>
                    <div className="video-container">
                        <iframe
                            src="https://www.youtube.com/embed/wlHwjkYpSr0" // Cambia por tu video
                            title="Video Manual de Usuario"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </section>
            </div>
        </>
    );
}