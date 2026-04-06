// src/components/ModalEliminarCurso.jsx
import "../styles/ModalEliminarCurso.css";

export function ModalEliminarCurso({ isOpen, onClose, onConfirm, curso }) {
    if (!isOpen || !curso) return null;

    return (
        <div className="mec-overlay" onClick={onClose}>
            <div className="mec-modal" onClick={(e) => e.stopPropagation()}>

                <div className="mec-stripe" />

                <div className="mec-body">

                    <div className="mec-header">
                        <div className="mec-icon-wrap">
                            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8"
                                strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                <path d="M10 11v6M14 11v6" />
                                <path d="M9 6V4h6v2" />
                            </svg>
                        </div>
                        <div className="mec-titles">
                            <span className="mec-title">Eliminar curso</span>
                            <span className="mec-subtitle">Esta acción no se puede deshacer</span>
                        </div>
                    </div>

                    <div className="mec-course-card">
                        <CourseAvatar titulo={curso.titulo} foto={curso.foto} />
                        <div className="mec-course-info">
                            <span className="mec-course-name">{curso.titulo}</span>
                            <span className="mec-course-meta">
                                {curso.total_secciones ?? 0} secciones
                                {curso.total_estudiantes != null
                                    ? ` · ${curso.total_estudiantes} estudiantes`
                                    : ""}
                            </span>
                        </div>
                    </div>

                    <div className="mec-warning">
                        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                        <span>
                            Se eliminarán permanentemente todas las secciones, materiales
                            y el progreso de los estudiantes.
                        </span>
                    </div>

                    <div className="mec-actions">
                        <button className="mec-btn-cancel" onClick={onClose}>
                            Cancelar
                        </button>
                        <button className="mec-btn-delete" onClick={onConfirm}>
                            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2"
                                strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                <path d="M10 11v6M14 11v6" />
                            </svg>
                            Eliminar
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

/* ── Avatar interno ─────────────────────────────────────── */
const PLACEHOLDER_PALETTES = [
    { bg: "#DBEAFE", text: "#1E40AF" },
    { bg: "#D1FAE5", text: "#065F46" },
    { bg: "#FCE7F3", text: "#9D174D" },
    { bg: "#EDE9FE", text: "#5B21B6" },
    { bg: "#FEF3C7", text: "#92400E" },
    { bg: "#CFFAFE", text: "#155E75" },
    { bg: "#FFE4E6", text: "#9F1239" },
    { bg: "#DCFCE7", text: "#14532D" },
];

const getPlaceholderPalette = (titulo = "") => {
    const idx = (titulo.charCodeAt(0) || 65) % PLACEHOLDER_PALETTES.length;
    return PLACEHOLDER_PALETTES[idx];
};

const CourseAvatar = ({ titulo, foto }) => {
    const initials = titulo?.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
    const palette = getPlaceholderPalette(titulo);

    if (foto) return (
        <img src={foto} alt={titulo} className="mec-avatar mec-avatar--img" />
    );
    return (
        <div
            className="mec-avatar"
            data-palette={PLACEHOLDER_PALETTES.indexOf(palette)}
        >
            {initials}
        </div>
    );
};