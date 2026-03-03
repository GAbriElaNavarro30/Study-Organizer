import "../styles/manual.css";
import { AiFillFilePdf } from "react-icons/ai";
import { IoArrowForwardOutline } from "react-icons/io5";
import Manual from "../assets/manual/manual-usuario.pdf";
import logo from "../assets/imagenes/logotipo-footer.png";

export function ManualUsuario() {
    return (
        <div className="manual-page">

            {/* ── HEADER ── */}
            <div className="manual-header">
                <div className="manual-brand">
                    <div className="manual-brand-dot" />
                    <span className="manual-brand-name">Study Organizer</span>
                </div>
                <div className="manual-header-divider" />
                <h1>Manual de Usuario</h1>
            </div>

            {/* ── BODY ── */}
            <div className="manual-body">
                <div className="manual-main-row">

                    {/* VIDEO */}
                    <div className="area-video manual-video-block">
                        <div className="manual-video-wrap">
                            <iframe
                                src="https://www.youtube.com/embed/GsV1i0QHi-o"
                                title="Video Manual de Usuario"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                        <div className="manual-video-bar">
                            <div className="manual-video-bar-left">
                                <div className="manual-video-play">
                                    <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                </div>
                                <div>
                                    <p className="manual-video-title">Tutorial completo · Study Organizer</p>
                                    <p className="manual-video-sub">Desde el registro hasta el uso avanzado de la plataforma</p>
                                </div>
                            </div>
                            <div className="manual-chip">
                                <span className="manual-chip-dot" />
                                Disponible
                            </div>
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: pdf + quote + logo juntos en flex */}
                    <div className="manual-right-col">

                        {/* PDF */}
                        <div className="area-pdf manual-pdf-card">
                            <div className="manual-pdf-top">
                                <div className="manual-pdf-title-row">
                                    <div className="manual-pdf-icon-badge">
                                        <AiFillFilePdf />
                                    </div>
                                    <h2>Documento PDF</h2>
                                </div>
                                <p className="manual-pdf-desc">
                                    Manual con instrucciones paso a paso y explicación
                                    de cada módulo de la plataforma.
                                </p>
                                <div className="manual-pdf-file">
                                    <AiFillFilePdf className="manual-pdf-file-icon" />
                                    <div>
                                        <p className="manual-pdf-file-name">manual-usuario.pdf</p>
                                        <p className="manual-pdf-file-meta">Guía oficial · Study Organizer</p>
                                    </div>
                                </div>
                            </div>
                            <div className="manual-pdf-footer">
                                <a className="manual-pdf-btn" href={Manual} target="_blank" rel="noopener noreferrer">
                                    Abrir documento <IoArrowForwardOutline />
                                </a>
                            </div>
                        </div>

                        {/* FRASE */}
                        <div className="area-quote manual-quote">
                            <span className="manual-quote-mark">"</span>
                            <p className="manual-quote-text">
                                Aprender mejor no depende del tiempo que estudias,
                                sino de <strong>cómo lo haces.</strong>
                            </p>
                        </div>

                        {/* LOGO */}
                        <div className="area-logo logo-study">
                            <img src={logo} alt="Study Organizer" />
                        </div>

                    </div>

                </div>
            </div>

        </div>
    );
}

export default ManualUsuario;