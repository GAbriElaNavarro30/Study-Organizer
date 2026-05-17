// src/components/ModalCancelarInscripcion.jsx
import { createPortal } from "react-dom";
import {
    IoWarningOutline,
    IoCloseOutline,
    IoRemoveCircleOutline,
    IoBookOutline,
} from "react-icons/io5";
import "../styles/ModalCancelarInscripcion.css";
import { useModalCancelarInscripcion } from "../hooks/useModalCancelarInscripcion.js";

export function ModalCancelarInscripcion({ abierto, curso, onConfirmar, onCerrar, cargando = false }) {
    const { dialogRef } = useModalCancelarInscripcion({ abierto, onCerrar });

    if (!abierto) return null;

    const hue = ((curso?.titulo?.charCodeAt(0) || 65) * 7) % 360;

    return createPortal(
        <div
            className="mci-overlay"
            onClick={(e) => { if (e.target === e.currentTarget) onCerrar(); }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mci-title"
        >
            <div className="mci-dialog" ref={dialogRef}>

                {/* Botón cerrar ─── esquina */}
                <button className="mci-close" onClick={onCerrar} aria-label="Cerrar">
                    <IoCloseOutline size={18} />
                </button>

                {/* Icono de advertencia */}
                <div className="mci-icon-wrap">
                    <div className="mci-icon-ring">
                        <IoWarningOutline size={28} className="mci-icon" />
                    </div>
                </div>

                {/* Título */}
                <h2 className="mci-title" id="mci-title">
                    ¿Cancelar inscripción?
                </h2>

                {/* Tarjeta del curso */}
                {curso && (
                    <div className="mci-curso-card">
                        <div
                            className="mci-curso-thumb"
                            style={{
                                "--ph-bg": `hsl(${hue},30%,91%)`,
                                "--ph-color": `hsl(${hue},42%,38%)`,
                            }}
                        >
                            {curso.foto
                                ? <img src={curso.foto} alt={curso.titulo} />
                                : <span>{curso.titulo?.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()}</span>
                            }
                        </div>
                        <div className="mci-curso-info">
                            <p className="mci-curso-titulo">{curso.titulo}</p>
                            {curso.nombre_tutor && (
                                <p className="mci-curso-tutor">{curso.nombre_tutor}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Mensaje */}
                <p className="mci-body">
                    Se perderá tu progreso y ya no tendrás acceso al contenido de este curso.
                    Esta acción <strong>no se puede deshacer</strong>.
                </p>

                {/* Acciones */}
                <div className="mci-actions">
                    <button
                        className="mci-btn mci-btn--cancel"
                        onClick={onCerrar}
                        disabled={cargando}
                    >
                        <IoBookOutline size={14} />
                        Mantener inscripción
                    </button>
                    <button
                        className="mci-btn mci-btn--confirm"
                        onClick={onConfirmar}
                        disabled={cargando}
                    >
                        {cargando
                            ? <span className="mci-spinner" />
                            : <IoRemoveCircleOutline size={14} />
                        }
                        {cargando ? "Cancelando..." : "Sí, cancelar"}
                    </button>
                </div>

            </div>
        </div>,
        document.body
    );
}