// src/pages/CursoResultado.jsx
import {
    IoArrowBackOutline,
    IoTrophyOutline,
    IoTimeOutline,
    IoChatbubbleEllipsesOutline,
    IoChevronForwardOutline,
    IoPersonOutline,
    IoHomeOutline,
    IoRefreshOutline,
    IoBookOutline,
} from "react-icons/io5";
import { useCursoResultado } from "../hooks/useCursoResultado.js";
import "../styles/cursoResultado.css";

export function CursoResultado() {
    const {
        resultado,
        curso,
        progreso,
        cargando,
        animado,
        error,
        navigate,
        retroalimentacion,
    } = useCursoResultado();

    /* ── Loading ── */
    if (cargando) return (
        <div className="cr-loading">
            <IoTrophyOutline size={44} className="cr-loading-icon" />
            <p className="cr-loading-text">Cargando resultado…</p>
        </div>
    );

    /* ── Error / vacío ── */
    if (error || !curso) return (
        <div className="cr-empty">
            <IoBookOutline size={44} className="cr-loading-icon" />
            <p className="cr-empty-msg">{error || "Resultado no disponible."}</p>
            <button className="cr-btn cr-btn--solid" onClick={() => navigate("/cursos")}>
                <IoHomeOutline size={14} /> Volver a cursos
            </button>
        </div>
    );

    /* ── Datos ── */
    const pct             = progreso?.porcentaje ?? 100;
    const totalContenidos = progreso?.total ?? 0;
    const vistos          = progreso?.vistos ?? 0;

    const puntaje     = Number(resultado?.porcentaje ?? 0);
    const correctas   = resultado?.respuestas_correctas ?? 0;
    const total       = resultado?.total_preguntas ?? 0;
    const incorrectas = total - correctas;
    const aprobado    = puntaje >= 70;

    const tutor = curso?.tutor ?? null;

    /* ── Anillo SVG ── */
    const CIRCUNFERENCIA = 219.9;
    const ringValue  = resultado ? puntaje : pct;
    const ringOffset = CIRCUNFERENCIA - (ringValue / 100) * CIRCUNFERENCIA;

    /* ── Formato de fechas ── */
    const formatHora = (fecha) =>
        fecha
            ? new Date(fecha).toLocaleTimeString("es-MX", {
                hour: "2-digit", minute: "2-digit", hour12: true,
            })
            : "—";

    const formatDia = (fecha) =>
        fecha
            ? new Date(fecha).toLocaleDateString("es-MX", {
                day: "2-digit", month: "short", year: "numeric",
            })
            : "—";

    return (
        <div className={`cr-wrap${animado ? " cr-animated" : ""}`}>

            {/* ── Topbar ── */}
            <div className="cr-topbar">
                <button
                    className="cr-back-btn"
                    onClick={() => navigate("/cursos-detalle", { state: { id_curso: curso.id_curso } })}
                >
                    <IoArrowBackOutline size={13} />
                    Volver
                </button>

                <nav className="cr-breadcrumb">
                    <span>Mis cursos</span>
                    <IoChevronForwardOutline size={9} className="cr-breadcrumb-sep" />
                    <span>{curso.titulo}</span>
                    <IoChevronForwardOutline size={9} className="cr-breadcrumb-sep" />
                    <span className="cr-breadcrumb-active">Resultado</span>
                </nav>

                <div className="cr-attempt-chip">
                    {pct >= 100 ? "Completado" : `${pct}% visto`}
                </div>
            </div>

            {/* ── Score band ── */}
            <div className="cr-scoreband">
                <div className="cr-score-left">

                    {/* Anillo SVG */}
                    <div className="cr-ring">
                        <svg viewBox="0 0 80 80" width="80" height="80">
                            <circle className="cr-ring-track" cx="40" cy="40" r="35" />
                            <circle
                                className="cr-ring-fill"
                                cx="40" cy="40" r="35"
                                style={{
                                    stroke: aprobado ? "#2255cc" : "#d97706",
                                    strokeDashoffset: ringOffset,
                                }}
                            />
                        </svg>
                        <div className="cr-ring-label">
                            <span className="cr-ring-num">
                                {resultado ? puntaje.toFixed(0) : pct}
                            </span>
                            <span className="cr-ring-sub">
                                {resultado ? "/ 100" : "% visto"}
                            </span>
                        </div>
                    </div>

                    {/* Info del curso */}
                    <div className="cr-score-info">
                        <h2 className="cr-score-title">{curso.titulo}</h2>
                        <p className="cr-score-sub">
                            {resultado
                                ? `${correctas} de ${total} respuestas correctas`
                                : `${vistos} de ${totalContenidos} contenidos vistos`}
                        </p>
                        <div className="cr-badges-row">
                            {resultado && (
                                <span className={`cr-badge-status cr-badge-status--${aprobado ? "pass" : "pending"}`}>
                                    <span className="cr-badge-dot" />
                                    {aprobado ? "Aprobado" : "En progreso"}
                                </span>
                            )}
                            {resultado?.nivel && (
                                <span className="cr-badge-level">Nivel: {resultado.nivel}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Métricas */}
                <div className="cr-score-right">
                    {resultado ? (
                        <>
                            <div className="cr-stat-box cr-stat-box--correct">
                                <span className="cr-stat-num">{correctas}</span>
                                <span className="cr-stat-lbl">Correctas</span>
                            </div>
                            <div className="cr-stat-box cr-stat-box--wrong">
                                <span className="cr-stat-num">{incorrectas}</span>
                                <span className="cr-stat-lbl">Incorrectas</span>
                            </div>
                            <div className="cr-stat-box cr-stat-box--total">
                                <span className="cr-stat-num">{total}</span>
                                <span className="cr-stat-lbl">Total</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="cr-stat-box cr-stat-box--correct">
                                <span className="cr-stat-num">{vistos}</span>
                                <span className="cr-stat-lbl">Vistos</span>
                            </div>
                            <div className="cr-stat-box cr-stat-box--total">
                                <span className="cr-stat-num">{totalContenidos}</span>
                                <span className="cr-stat-lbl">Total</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ── Contenido ── */}
            <div className="cr-content">

                {/* Fechas */}
                <div className="cr-section">
                    <div className="cr-section-head">
                        <div className="cr-section-icon">
                            <IoTimeOutline size={14} />
                        </div>
                        <span className="cr-section-title">
                            {resultado ? "Fechas del cuestionario" : "Progreso del curso"}
                        </span>
                    </div>
                    <div className="cr-dates-grid">
                        {resultado ? (
                            <>
                                <div className="cr-date-cell">
                                    <p className="cr-date-lbl">Inicio</p>
                                    <p className="cr-date-val">{formatDia(resultado.fecha_inicio)}</p>
                                    <p className="cr-date-sub">{formatHora(resultado.fecha_inicio)}</p>
                                </div>
                                <div className="cr-date-cell">
                                    <p className="cr-date-lbl">Fin</p>
                                    <p className="cr-date-val">{formatDia(resultado.fecha_fin)}</p>
                                    <p className="cr-date-sub">{formatHora(resultado.fecha_fin)}</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="cr-date-cell">
                                    <p className="cr-date-lbl">Contenidos vistos</p>
                                    <p className="cr-date-val">{vistos} / {totalContenidos}</p>
                                    <p className="cr-date-sub">{pct}% completado</p>
                                </div>
                                <div className="cr-date-cell">
                                    <p className="cr-date-lbl">Estado</p>
                                    <p className="cr-date-val">{pct >= 100 ? "Finalizado" : "En curso"}</p>
                                    <p className="cr-date-sub">
                                        {pct >= 100
                                            ? "Todos los contenidos completados"
                                            : `${totalContenidos - vistos} pendientes`}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Retroalimentación + Tutor en la misma fila */}
                {(retroalimentacion.length > 0 || (tutor && (tutor.nombre || tutor.foto))) && (
                    <div className="cr-row-2col">

                        {/* Retroalimentación */}
                        {retroalimentacion.length > 0 && (
                            <div className="cr-section">
                                <div className="cr-section-head">
                                    <div className="cr-section-icon">
                                        <IoChatbubbleEllipsesOutline size={14} />
                                    </div>
                                    <span className="cr-section-title">Retroalimentación</span>
                                </div>
                                <div className="cr-section-body">
                                    <ul className="cr-retro-list">
                                        {retroalimentacion.map((msg, i) => (
                                            <li key={i} className="cr-retro-row">
                                                <span className="cr-retro-idx">{i + 1}</span>
                                                <p className="cr-retro-text">{msg}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Tutor */}
                        {tutor && (tutor.nombre || tutor.foto) && (
                            <div className="cr-section">
                                <div className="cr-section-head">
                                    <div className="cr-section-icon">
                                        <IoPersonOutline size={14} />
                                    </div>
                                    <span className="cr-section-title">Tutor del curso</span>
                                </div>
                                <div className="cr-tutor-body">
                                    <div className="cr-tutor-avatar">
                                        {tutor.foto
                                            ? <img src={tutor.foto} alt={tutor.nombre} />
                                            : <span>{tutor.nombre?.charAt(0)?.toUpperCase() ?? "T"}</span>
                                        }
                                    </div>
                                    <div className="cr-tutor-info">
                                        <p className="cr-tutor-name">{tutor.nombre}</p>
                                        {tutor.descripcion && (
                                            <p className="cr-tutor-desc">{tutor.descripcion}</p>
                                        )}
                                        {tutor.correo && (
                                            <p className="cr-tutor-meta">{tutor.correo}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                )}

                {/* Acciones */}
                <div className="cr-actions">
                    <button
                        className="cr-btn cr-btn--solid"
                        onClick={() => navigate("/cursos")}
                    >
                        <IoHomeOutline size={13} />
                        Ver más cursos
                    </button>
                    <button
                        className="cr-btn cr-btn--ghost"
                        onClick={() => navigate("/cursos-detalle", { state: { id_curso: curso.id_curso } })}
                    >
                        <IoRefreshOutline size={13} />
                        Volver al detalle
                    </button>
                </div>

            </div>
        </div>
    );
}