// src/components/ModalArchivar.jsx
import { IoPeopleOutline } from "react-icons/io5";
import "../styles/ModalArchivar.css";

/**
 * ModalArchivar
 *
 * Props:
 *  - isOpen      {boolean}  — controla visibilidad
 *  - curso       {object}   — objeto del curso ({ titulo, archivado, total_estudiantes })
 *  - onConfirm   {function} — acción al confirmar
 *  - onClose     {function} — acción al cancelar / cerrar
 */
export function ModalArchivar({ isOpen, curso, onConfirm, onClose }) {
    if (!isOpen || !curso) return null;

    const esArchivar = !curso.archivado;

    return (
        <div
            className="marc-overlay"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="marc-card">

                {/* Acento superior */}
                <div className={`marc-accent ${esArchivar ? "marc-accent--arch" : "marc-accent--unarch"}`} />

                <div className="marc-inner">

                    {/* Encabezado */}
                    <div className="marc-top">
                        <div className={`marc-badge ${esArchivar ? "marc-badge--arch" : "marc-badge--unarch"}`}>
                            {esArchivar ? <ArchiveIcon /> : <UnarchiveIcon />}
                        </div>
                        <div className="marc-heads">
                            <p className="marc-title">
                                {esArchivar ? "Archivar curso" : "Desarchivar curso"}
                            </p>
                            <p className="marc-sub">
                                {esArchivar ? "Se moverá a archivados" : "Volverá al panel principal"}
                            </p>
                        </div>
                    </div>

                    <div className="marc-divider" />

                    {/* Tarjeta del curso */}
                    <div className="marc-course-card">
                        <CourseAvatar titulo={curso.titulo} foto={curso.foto} />
                        <div className="marc-course-info">
                            <span className="marc-course-name">{curso.titulo}</span>
                            <span className="marc-course-meta">
                                {curso.total_secciones ?? 0} secciones
                                {curso.total_estudiantes != null
                                    ? ` · ${curso.total_estudiantes} estudiantes`
                                    : ""}
                            </span>
                        </div>
                    </div>

                    {/* Cuerpo */}
                    <p className="marc-body">
                        {esArchivar
                            ? "El curso dejará de aparecer en tu panel principal y no será visible para los estudiantes. Podrás restaurarlo cuando quieras."
                            : "El curso volverá a tu panel principal como borrador. Podrás editarlo y publicarlo nuevamente cuando estés listo."
                        }
                    </p>

                    {/* Pills */}
                    <div className="marc-pill-row">
                        {esArchivar ? (
                            <>
                                <span className="marc-pill marc-pill--arch">
                                    <ArchiveIconSm />
                                    Se archivará
                                </span>
                                {curso.total_estudiantes > 0 && (
                                    <span className="marc-pill marc-pill--info">
                                        <IoPeopleOutline size={11} />
                                        {curso.total_estudiantes} estudiantes afectados
                                    </span>
                                )}
                            </>
                        ) : (
                            <span className="marc-pill marc-pill--unarch">
                                <CheckIconSm />
                                Vuelve como borrador
                            </span>
                        )}
                    </div>

                    {/* Acciones */}
                    <div className="marc-actions">
                        <button className="marc-btn-cancel" onClick={onClose}>
                            Cancelar
                        </button>
                        <button
                            className={`marc-btn-confirm ${esArchivar ? "marc-btn-confirm--arch" : "marc-btn-confirm--unarch"}`}
                            onClick={onConfirm}
                        >
                            {esArchivar ? <><ArchiveIconSm />&nbsp;Archivar curso</> : <><UnarchiveIconSm />&nbsp;Desarchivar curso</>}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

/* ── Iconos SVG ── */
const ArchiveIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="21 8 21 21 3 21 3 8" />
        <rect x="1" y="3" width="22" height="5" />
        <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
);

const UnarchiveIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="21 8 21 21 3 21 3 8" />
        <rect x="1" y="3" width="22" height="5" />
        <polyline points="10 12 12 14 14 12" />
        <line x1="12" y1="8" x2="12" y2="14" />
    </svg>
);

const ArchiveIconSm = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="21 8 21 21 3 21 3 8" />
        <rect x="1" y="3" width="22" height="5" />
    </svg>
);

const UnarchiveIconSm = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="21 8 21 21 3 21 3 8" />
        <rect x="1" y="3" width="22" height="5" />
        <polyline points="10 12 12 14 14 12" />
        <line x1="12" y1="8" x2="12" y2="14" />
    </svg>
);

const CheckIconSm = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 12 11 14 15 10" />
    </svg>
);

/* ── Avatar interno ── */
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
    const { bg, text } = getPlaceholderPalette(titulo);

    if (foto) return <img src={foto} alt={titulo} className="marc-avatar marc-avatar--img" />;
    return (
        <div className="marc-avatar" style={{ background: bg, color: text }}>
            {initials}
        </div>
    );
};