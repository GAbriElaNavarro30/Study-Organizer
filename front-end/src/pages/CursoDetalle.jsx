// src/pages/Cursos/CursoDetalle.jsx
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
    IoArrowBackOutline, IoBookOutline, IoLayersOutline,
    IoPersonOutline, IoCheckmarkCircleOutline,
    IoPlayCircleOutline, IoRefreshOutline,
    IoChevronDownOutline, IoDocumentTextOutline,
    IoAnalyticsOutline, IoRibbonOutline,
    IoTimeOutline, IoMailOutline, IoCallOutline,
    IoSchoolOutline, IoStarOutline,
    IoArchiveOutline
} from "react-icons/io5";
import "../styles/cursoDetalle.css";
import { useCursoDetalle } from "../hooks/useCursoDetalle.js";

/* ─────────────────────────────────────────────
   Constantes VARK
───────────────────────────────────────────── */
const VARK_LABELS = { V: "Visual", A: "Auditivo", R: "Lector / Escritor", K: "Kinestésico" };
const VARK_COLORS = { V: "#1A5FD4", A: "#0F7B4A", R: "#8B4500", K: "#5B3FA8" };
const VARK_BG = { V: "#E8F0FD", A: "#E6F7EF", R: "#FFF4E5", K: "#F0EDF9" };

/* ─────────────────────────────────────────────
   Sub-componentes
───────────────────────────────────────────── */
function LoadingState() {
    return (
        <div className="cd-loading">
            <IoBookOutline size={44} className="cd-loading-icon" />
            <p className="cd-loading-text">Cargando curso…</p>
        </div>
    );
}

function SeccionItem({ seccion, numero }) {
    const [open, setOpen] = useState(true);
    const total = seccion.contenidos?.length || 0;

    return (
        <div className="cd-seccion">
            <button className="cd-seccion-header" onClick={() => setOpen(v => !v)}>
                <span className="cd-seccion-num">{numero}</span>
                <div className="cd-seccion-info">
                    <span className="cd-seccion-titulo">{seccion.titulo_seccion}</span>
                    <span className="cd-seccion-count">
                        <IoDocumentTextOutline size={11} />
                        {total} contenido{total !== 1 ? "s" : ""}
                    </span>
                </div>
                <span className={`cd-seccion-chevron ${open ? "cd-seccion-chevron--up" : ""}`}>
                    <IoChevronDownOutline size={15} />
                </span>
            </button>

            {open && total > 0 && (
                <div className="cd-seccion-body">
                    {seccion.contenidos.map((c, i) => (
                        <div key={c.id_contenido} className="cd-contenido-item">
                            <span className="cd-contenido-idx">{i + 1}</span>
                            <IoDocumentTextOutline size={13} className="cd-contenido-icon" />
                            <span className="cd-contenido-titulo">{c.titulo || `Contenido ${i + 1}`}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function InstructorCard({ tutor }) {
    if (!tutor?.nombre) return null;
    const initials = tutor.nombre.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();

    return (
        <div className="cd-block">
            <div className="cd-block-head">
                <IoSchoolOutline size={16} className="cd-block-head-icon" />
                <h2 className="cd-block-head-title">Instructor</h2>
            </div>
            <div className="cd-instructor-wrap">
                {tutor.foto
                    ? <img src={tutor.foto} alt={tutor.nombre} className="cd-instructor-avatar-img" />
                    : <div className="cd-instructor-avatar-initials">{initials}</div>
                }
                <div className="cd-instructor-info">
                    <span className="cd-instructor-badge">
                        <IoStarOutline size={10} /> Tutor
                    </span>
                    <h3 className="cd-instructor-nombre">{tutor.nombre}</h3>
                    <p className="cd-instructor-rol">Instructor del curso</p>

                    {tutor.descripcion && (
                        <p className="cd-instructor-bio">{tutor.descripcion}</p>
                    )}

                    {(tutor.correo || tutor.telefono) && (
                        <div className="cd-instructor-contacts">
                            {tutor.correo && (
                                <a href={`mailto:${tutor.correo}`} className="cd-instructor-contact">
                                    <IoMailOutline size={14} /> {tutor.correo}
                                </a>
                            )}
                            {tutor.telefono && (
                                <span className="cd-instructor-contact">
                                    <IoCallOutline size={14} /> {tutor.telefono}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
═══════════════════════════════════════════════════════ */
export function CursoDetalle() {
    const navigate = useNavigate();

    const {
        curso, inscrito, progreso,
        cargando, inscribiendo, animado, error,
        ultimoResultado, id_curso,
        inscribirse, cancelarInscripcion, iniciarIntento,
    } = useCursoDetalle();

    /* ── Valores derivados (no pertenecen al hook: dependen solo de `curso`) ── */
    const totalContenidos = curso?.secciones?.reduce(
        (acc, s) => acc + (s.contenidos?.length || 0), 0
    ) ?? 0;

    const totalPreguntas = curso?.secciones?.reduce(
        (acc, s) => acc + (s.preguntas?.length || 0), 0
    ) ?? 0;

    /* ── Handlers con navegación / UI (propios del componente) ── */
    const handleInscribirse = async () => {
        try {
            await inscribirse();
        } catch (err) {
            alert(err?.response?.data?.mensaje || "Error al inscribirse.");
        }
    };

    const handleCancelarInscripcion = async () => {
        const confirmar = window.confirm("¿Seguro que quieres cancelar tu inscripción?");
        if (!confirmar) return;
        try {
            await cancelarInscripcion();
        } catch (err) {
            alert(err?.response?.data?.mensaje || "Error al cancelar la inscripción.");
        }
    };

    const handleIniciarCurso = async () => {
        await iniciarIntento();
        navigate("/cursos-visor", { state: { id_curso } });
    };

    const handleRetomarCurso = () => {
        navigate("/cursos-visor", { state: { id_curso } });
    };

    const handleVerResultados = () => {
        navigate("/cursos/resultado", { state: { id_curso } });
    };

    /* ── Estados de carga / error ── */
    if (cargando) return <LoadingState />;

    if (error || !curso) {
        return (
            <div className="cd-error">
                <IoBookOutline size={44} className="cd-error-icon" />
                <p className="cd-error-msg">{error || "Curso no disponible."}</p>
                <button className="cd-btn cd-btn--primary" onClick={() => navigate("/cursos")}>
                    Volver a cursos
                </button>
            </div>
        );
    }

    /* ── Datos auxiliares ── */
    const pct = progreso?.porcentaje ?? 0;
    const completado = progreso?.completado ?? false;
    const hue = ((curso.titulo?.charCodeAt(0) || 65) * 7) % 360;
    const letrasVark = curso.perfil_vark?.split("").filter(l => ["V", "A", "R", "K"].includes(l)) || [];

    const tutor = curso.tutor ?? {
        nombre: `${curso.nombre_tutor ?? ""} ${curso.apellido_tutor ?? ""}`.trim(),
        foto: curso.foto_tutor ?? null,
        descripcion: curso.descripcion_tutor ?? null,
        correo: curso.correo_tutor ?? null,
        telefono: curso.telefono_tutor ?? null,
    };

    /* ── CTA reutilizable ── */
    const renderCTA = (full = false) => {
        const cls = `cd-btn${full ? " cd-btn--full" : ""}`;

        if (!inscrito) {
            if (curso?.archivado) return null;
            return (
                <button
                    className={`${cls} cd-btn--primary`}
                    onClick={handleInscribirse}
                    disabled={inscribiendo}
                >
                    <IoRibbonOutline size={15} />
                    {inscribiendo ? "Inscribiendo…" : "Inscribirse al curso"}
                </button>
            );
        }

        if (curso?.archivado) {
            return (
                <div className="cd-cta-group">
                    <div className="cd-archived-notice">
                        <IoArchiveOutline size={14} /> Este curso está archivado
                    </div>
                    <button className={`${cls} cd-btn--secondary`} onClick={handleRetomarCurso}>
                        <IoBookOutline size={15} /> Ver contenido
                    </button>
                    {progreso?.completado && (
                        <button className={`${cls} cd-btn--primary`} onClick={handleVerResultados}>
                            <IoAnalyticsOutline size={15} /> Ver resultados
                        </button>
                    )}
                    <button className={`${cls} cd-btn--danger cd-btn--cancel`} onClick={handleCancelarInscripcion}>
                        Cancelar inscripción
                    </button>
                </div>
            );
        }

        return (
            <div className="cd-cta-group">
                {completado ? (
                    <div className="cd-cta-group">
                        <button className={`${cls} cd-btn--primary`} onClick={handleVerResultados}>
                            <IoAnalyticsOutline size={15} /> Ver resultados
                        </button>
                        <button className={`${cls} cd-btn--secondary`} onClick={handleIniciarCurso}>
                            <IoRefreshOutline size={15} /> Tomar de nuevo
                        </button>
                    </div>
                ) : (
                    <button
                        className={`${cls} cd-btn--success`}
                        onClick={pct > 0 ? handleRetomarCurso : handleIniciarCurso}
                    >
                        <IoPlayCircleOutline size={15} />
                        {pct > 0 ? "Continuar curso" : "Iniciar curso"}
                    </button>
                )}
                <button className={`${cls} cd-btn--danger cd-btn--cancel`} onClick={handleCancelarInscripcion}>
                    Cancelar inscripción
                </button>
            </div>
        );
    };

    /* ── Render ── */
    return (
        <div className={`cd-app ${animado ? "cd-animated" : ""}`}>

            {/* ═══════════  HERO  ═══════════ */}
            <div className="cd-hero">
                {curso.foto && <img src={curso.foto} alt="" aria-hidden className="cd-hero-bg-img" />}

                <div className="cd-hero-inner">
                    <button className="cd-back" onClick={() => navigate("/cursos")}>
                        <IoArrowBackOutline size={13} /> Volver a cursos
                    </button>

                    <div className="cd-hero-grid">

                        {/* ─ Texto ─ */}
                        <div className="cd-hero-content">
                            {letrasVark.length > 0 && (
                                <div className="cd-hero-tags">
                                    {letrasVark.map(l => (
                                        <span key={l} className="cd-tag cd-tag--vark">
                                            {l} · {VARK_LABELS[l]}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <h1 className="cd-hero-titulo">{curso.titulo}</h1>

                            {curso.descripcion && (
                                <p className="cd-hero-desc">{curso.descripcion}</p>
                            )}

                            <div className="cd-hero-pills">
                                {curso.secciones?.length > 0 && (
                                    <span className="cd-hero-pill">
                                        <IoLayersOutline size={12} />
                                        {curso.secciones.length} sección{curso.secciones.length !== 1 ? "es" : ""}
                                    </span>
                                )}
                                {totalContenidos > 0 && (
                                    <span className="cd-hero-pill">
                                        <IoDocumentTextOutline size={12} />
                                        {totalContenidos} contenido{totalContenidos !== 1 ? "s" : ""}
                                    </span>
                                )}
                                {tutor.nombre && (
                                    <span className="cd-hero-pill">
                                        <IoPersonOutline size={12} /> {tutor.nombre}
                                    </span>
                                )}
                                {curso.nombre_dimension && (
                                    <span className="cd-hero-pill cd-hero-pill--gold">
                                        <IoTimeOutline size={12} /> {curso.nombre_dimension}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* ─ Enrollment card (desktop) ─ */}
                        <div className="cd-hero-aside">
                            <div className="cd-enroll-card">
                                <div className="cd-enroll-cover">
                                    {curso.foto
                                        ? <img src={curso.foto} alt={curso.titulo} />
                                        : (
                                            <div
                                                className="cd-enroll-cover-placeholder"
                                                style={{
                                                    color: `hsl(${hue},55%,42%)`,
                                                    background: `hsl(${hue},40%,93%)`,
                                                }}
                                            >
                                                {curso.titulo?.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()}
                                            </div>
                                        )
                                    }
                                </div>

                                <div className="cd-enroll-body">
                                    {inscrito && (
                                        <div>
                                            {completado ? (
                                                <div className="cd-progress-complete">
                                                    <IoCheckmarkCircleOutline size={16} /> ¡Curso completado!
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="cd-progress-label">
                                                        <span>Progreso</span>
                                                        <strong>{pct}%</strong>
                                                    </div>
                                                    <div className="cd-progress-track">
                                                        <div className="cd-progress-fill" style={{ width: `${pct}%` }} />
                                                    </div>
                                                    <p className="cd-progress-sub">
                                                        {progreso?.vistos ?? 0} de {progreso?.total ?? totalContenidos} contenidos vistos
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {inscrito && ultimoResultado && (
                                        <button
                                            className="cd-btn cd-btn--primary cd-btn--full"
                                            onClick={handleVerResultados}
                                        >
                                            <IoAnalyticsOutline size={15} /> Ver último resultado
                                        </button>
                                    )}

                                    {renderCTA(true)}

                                    <div className="cd-enroll-sep" />

                                    <div className="cd-enroll-quickstats">
                                        <div className="cd-enroll-qs">
                                            <span className="cd-enroll-qs-num">{curso.secciones?.length ?? 0}</span>
                                            <span className="cd-enroll-qs-lbl">Secciones</span>
                                        </div>
                                        <div className="cd-enroll-qs">
                                            <span className="cd-enroll-qs-num">{totalContenidos}</span>
                                            <span className="cd-enroll-qs-lbl">Contenidos</span>
                                        </div>
                                        <div className="cd-enroll-qs">
                                            <span className="cd-enroll-qs-num">{totalPreguntas > 0 ? totalPreguntas : "—"}</span>
                                            <span className="cd-enroll-qs-lbl">Preguntas</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* CTA móvil */}
            <div className="cd-mobile-cta">
                {inscrito && !completado && pct > 0 && (
                    <div className="cd-mobile-prog-bar">
                        <div className="cd-mobile-prog-fill" style={{ width: `${pct}%` }} />
                    </div>
                )}
                {renderCTA(true)}
            </div>

            {/* ═══════════  BODY  ═══════════ */}
            <div className="cd-body">

                {/* Columna principal */}
                <div className="cd-main">

                    <div className="cd-block">
                        <div className="cd-block-head">
                            <IoLayersOutline size={16} className="cd-block-head-icon" />
                            <h2 className="cd-block-head-title">Contenido del curso</h2>
                            {curso.secciones?.length > 0 && (
                                <span className="cd-block-head-badge">{curso.secciones.length} secciones</span>
                            )}
                        </div>

                        {curso.secciones?.length > 0 ? (
                            <div className="cd-secciones">
                                {curso.secciones.map((s, i) => (
                                    <SeccionItem key={s.id_seccion} seccion={s} numero={i + 1} />
                                ))}
                            </div>
                        ) : (
                            <p className="cd-empty-text">Este curso aún no tiene secciones.</p>
                        )}
                    </div>

                    <InstructorCard tutor={tutor} />
                </div>

                {/* Sidebar */}
                <aside className="cd-sidebar">

                    <div className="cd-sidebar-block">
                        <div className="cd-sidebar-head">
                            <p className="cd-sidebar-head-title">
                                <IoBookOutline size={12} /> Detalles del curso
                            </p>
                        </div>
                        <div className="cd-sidebar-body">
                            {curso.secciones?.length > 0 && (
                                <div className="cd-fact">
                                    <span className="cd-fact-label">Secciones</span>
                                    <span className="cd-fact-value">
                                        <IoLayersOutline size={13} /> {curso.secciones.length}
                                    </span>
                                </div>
                            )}
                            {totalContenidos > 0 && (
                                <div className="cd-fact">
                                    <span className="cd-fact-label">Contenidos</span>
                                    <span className="cd-fact-value">
                                        <IoDocumentTextOutline size={13} /> {totalContenidos}
                                    </span>
                                </div>
                            )}
                            {totalPreguntas > 0 && (
                                <div className="cd-fact">
                                    <span className="cd-fact-label">Preguntas</span>
                                    <span className="cd-fact-value">
                                        <IoAnalyticsOutline size={13} /> {totalPreguntas}
                                    </span>
                                </div>
                            )}
                            {tutor.nombre && (
                                <div className="cd-fact">
                                    <span className="cd-fact-label">Instructor</span>
                                    <span className="cd-fact-value">
                                        <IoPersonOutline size={13} /> {tutor.nombre.split(" ")[0]}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {letrasVark.length > 0 && (
                        <div className="cd-sidebar-block">
                            <div className="cd-sidebar-head">
                                <p className="cd-sidebar-head-title">
                                    <IoAnalyticsOutline size={12} /> Perfil VARK
                                </p>
                            </div>
                            <div className="cd-sidebar-body">
                                <div className="cd-vark-list">
                                    {letrasVark.map(l => (
                                        <div
                                            key={l}
                                            className="cd-vark-row"
                                            style={{
                                                background: VARK_BG[l],
                                                color: VARK_COLORS[l],
                                                borderColor: VARK_COLORS[l] + "33",
                                            }}
                                        >
                                            <span className="cd-vark-letter">{l}</span>
                                            <span>{VARK_LABELS[l]}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {curso.nombre_dimension && (
                        <div className="cd-sidebar-block">
                            <div className="cd-sidebar-head">
                                <p className="cd-sidebar-head-title">
                                    <IoTimeOutline size={12} /> Dimensión
                                </p>
                            </div>
                            <div className="cd-sidebar-body">
                                <div className="cd-dim-badge">
                                    <IoTimeOutline size={14} /> {curso.nombre_dimension}
                                </div>
                            </div>
                        </div>
                    )}

                </aside>
            </div>
        </div>
    );
}