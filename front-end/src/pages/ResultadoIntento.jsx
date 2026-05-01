// src/pages/ResultadoIntento.jsx
import {
    IoArrowBackOutline,
    IoTrophyOutline,
    IoTimeOutline,
    IoChatbubbleEllipsesOutline,
    IoReloadOutline,
    IoChevronForwardOutline,
    IoPersonOutline,
    IoHelpCircleOutline,
} from "react-icons/io5";
import { useResultadoIntento } from "../hooks/useResultadoIntento";
import "../styles/resultadoIntento.css";

export function ResultadoIntento() {
    const {
        navigate,
        state,
        resultado,
        curso,
        retroalimentacion,
        cargando,
        error,
        aprobado,
        respuestasDetalle,
    } = useResultadoIntento();

    if (cargando) return (
        <div className="cr-loading">
            <IoTrophyOutline size={44} className="cr-loading-icon" />
            <p className="cr-loading-text">Cargando resultado…</p>
        </div>
    );

    if (error || !resultado) return (
        <div className="cr-empty">
            <p className="cr-empty-msg">{error || "Resultado no disponible."}</p>
            <button className="cr-btn cr-btn--solid" onClick={() => navigate(-1)}>
                <IoArrowBackOutline size={14} /> Volver
            </button>
        </div>
    );

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

    const puntaje = Number(resultado.puntaje) || 0;
    const correctas = resultado.respuestas_correctas ?? 0;
    const total = resultado.total_preguntas ?? 0;
    const incorrectas = total - correctas;
    const nombreCurso = curso?.titulo || state?.nombreCurso || "Cuestionario";
    const tutor = curso?.tutor || null;

    const CIRCUNFERENCIA = 219.9;
    const ringOffset = CIRCUNFERENCIA - (puntaje / 100) * CIRCUNFERENCIA;

    return (
        <div className="cr-wrap">

            {/* ── Topbar ── */}
            <div className="cr-topbar">
                <button className="cr-back-btn" onClick={() => navigate(-1)}>
                    <IoArrowBackOutline size={13} />
                    Volver
                </button>

                <nav className="cr-breadcrumb">
                    <span>Mis cursos</span>
                    <IoChevronForwardOutline size={9} className="cr-breadcrumb-sep" />
                    <span>{nombreCurso}</span>
                    <IoChevronForwardOutline size={9} className="cr-breadcrumb-sep" />
                    <span className="cr-breadcrumb-active">Resultado</span>
                </nav>

                <div className="cr-attempt-chip">
                    Intento #{resultado.numero_intento}
                </div>
            </div>

            {/* ── Score band ── */}
            <div className="cr-scoreband">
                <div className="cr-score-left">

                    {/* Anillo SVG */}
                    <div className="cr-ring">
                        <svg viewBox="0 0 80 80" width="80" height="80">
                            <circle
                                className="cr-ring-track"
                                cx="40" cy="40" r="35"
                            />
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
                            <span className="cr-ring-num">{puntaje.toFixed(0)}</span>
                            <span className="cr-ring-sub">/ 100</span>
                        </div>
                    </div>

                    {/* Info del curso */}
                    <div className="cr-score-info">
                        <h2 className="cr-score-title">{nombreCurso}</h2>
                        <p className="cr-score-sub">
                            {curso?.modulo || state?.modulo || "Cuestionario final"}
                        </p>
                        <div className="cr-badges-row">
                            <span className={`cr-badge-status ${aprobado ? "cr-badge-status--pass" : "cr-badge-status--pending"}`}>
                                <span className="cr-badge-dot" />
                                {aprobado ? "Aprobado" : "En progreso"}
                            </span>
                            <span className="cr-badge-level">
                                Nivel: {resultado.nivel || "—"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Métricas */}
                <div className="cr-score-right">
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
                        <span className="cr-section-title">Fechas del intento</span>
                    </div>
                    <div className="cr-dates-grid">
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
                    </div>
                </div>

                {/* Revisión de respuestas */}
                {respuestasDetalle.length > 0 && (
                    <div className="cr-section">
                        <div className="cr-section-head">
                            <div className="cr-section-icon">
                                <IoHelpCircleOutline size={14} />
                            </div>
                            <span className="cr-section-title">Revisión de respuestas</span>
                        </div>
                        <div className="cr-review-body">
                            {respuestasDetalle.map((sec) => (
                                <div key={sec.id_seccion} className="cr-review-section">
                                    <p className="cr-review-sec-title">{sec.titulo_seccion}</p>
                                    {sec.preguntas.map((preg, pi) => {
                                        const respondida = preg.opciones.some(o => o.fue_seleccionada);
                                        const acerto = preg.opciones.some(o => o.fue_seleccionada && o.es_correcta);
                                        return (
                                            <div key={preg.id_test} className={`cr-review-card ${acerto ? "cr-review-card--ok" : respondida ? "cr-review-card--fail" : "cr-review-card--skip"}`}>
                                                <div className="cr-review-q-header">
                                                    <span className="cr-review-q-num">P{pi + 1}</span>
                                                    <p className="cr-review-q-text">{preg.texto_pregunta}</p>
                                                    <span className={`cr-review-opt-tag ${acerto ? "cr-review-opt-tag--correct" : respondida ? "cr-review-opt-tag--wrong" : ""}`}>
                                                        {acerto ? "✓ Correcta" : respondida ? "✗ Incorrecta" : "—"}
                                                    </span>
                                                </div>
                                                <div className="cr-review-options">
                                                    {preg.opciones.map((op) => {
                                                        let cls = "cr-review-opt";
                                                        if (op.fue_seleccionada && op.es_correcta) cls += " cr-review-opt--correct-selected";
                                                        else if (op.fue_seleccionada && !op.es_correcta) cls += " cr-review-opt--wrong";
                                                        else if (!op.fue_seleccionada && op.es_correcta) cls += " cr-review-opt--correct";
                                                        return (
                                                            <div key={op.id_opcion} className={cls}>
                                                                <span className="cr-review-opt-marker">
                                                                    {op.fue_seleccionada
                                                                        ? op.es_correcta ? "✓" : "✗"
                                                                        : op.es_correcta ? "✓" : ""}
                                                                </span>
                                                                <span className="cr-review-opt-text">{op.texto_opcion}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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
                    <button className="cr-btn cr-btn--solid" onClick={() => navigate(-2)}>
                        <IoReloadOutline size={13} />
                        Retomar curso
                    </button>
                </div>

            </div>
        </div>
    );
}