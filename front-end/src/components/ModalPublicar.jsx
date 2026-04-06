// src/components/ModalPublicar.jsx
import { IoCheckmarkCircle, IoEyeOff, IoPeopleOutline } from "react-icons/io5";
import "../styles/ModalPublicar.css";

/**
 * ModalPublicar
 *
 * Props:
 *  - isOpen      {boolean}  — controla visibilidad
 *  - curso       {object}   — objeto del curso ({ titulo, es_publicado, total_estudiantes })
 *  - onConfirm   {function} — acción al confirmar
 *  - onClose     {function} — acción al cancelar / cerrar
 */
export function ModalPublicar({ isOpen, curso, onConfirm, onClose }) {
    if (!isOpen || !curso) return null;

    const esPublicar = !curso.es_publicado;

    return (
        <div
            className="mp-overlay"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="mp-card">

                {/* Acento superior */}
                <div className={`mp-accent ${esPublicar ? "mp-accent--pub" : "mp-accent--unp"}`} />

                <div className="mp-inner">

                    {/* Encabezado */}
                    <div className="mp-top">
                        <div className={`mp-badge ${esPublicar ? "mp-badge--pub" : "mp-badge--unp"}`}>
                            {esPublicar
                                ? <IoCheckmarkCircle size={22} className="mp-badge-icon mp-badge-icon--pub" />
                                : <IoEyeOff         size={22} className="mp-badge-icon mp-badge-icon--unp" />
                            }
                        </div>
                        <div className="mp-heads">
                            <p className="mp-title">
                                {esPublicar ? "Publicar curso" : "Despublicar curso"}
                            </p>
                            <p className="mp-sub">
                                {esPublicar
                                    ? "Los estudiantes podrán acceder"
                                    : "Se ocultará a los estudiantes"}
                            </p>
                        </div>
                    </div>

                    <div className="mp-divider" />

                    {/* Cuerpo */}
                    <p className="mp-body">
                        {esPublicar ? (
                            <><strong>"{curso.titulo}"</strong> estará visible y disponible para que los estudiantes puedan inscribirse.</>
                        ) : (
                            <><strong>"{curso.titulo}"</strong> dejará de ser visible. Los estudiantes perderán acceso hasta que lo vuelvas a publicar.</>
                        )}
                    </p>

                    {/* Pills de contexto */}
                    <div className="mp-pill-row">
                        {esPublicar ? (
                            <span className="mp-pill mp-pill--pub">
                                <CheckIcon />
                                Visible al publicar
                            </span>
                        ) : (
                            <>
                                <span className="mp-pill mp-pill--unp">
                                    <CloseIcon />
                                    Se ocultará
                                </span>
                                {curso.total_estudiantes > 0 && (
                                    <span className="mp-pill mp-pill--students">
                                        <IoPeopleOutline size={11} />
                                        {curso.total_estudiantes} estudiantes afectados
                                    </span>
                                )}
                            </>
                        )}
                    </div>

                    {/* Acciones */}
                    <div className="mp-actions">
                        <button className="mp-btn-cancel" onClick={onClose}>
                            Cancelar
                        </button>
                        <button
                            className={`mp-btn-confirm ${esPublicar ? "mp-btn-confirm--pub" : "mp-btn-confirm--unp"}`}
                            onClick={onConfirm}
                        >
                            {esPublicar
                                ? <><CheckIcon />&nbsp;Publicar curso</>
                                : <><EyeOffIcon />&nbsp;Despublicar curso</>
                            }
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

/* ── Iconos SVG inline (evita dependencia de react-icons en los botones) ── */
const CheckIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" />
    </svg>
);

const CloseIcon = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const EyeOffIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);