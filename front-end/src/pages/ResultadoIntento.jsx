// src/pages/ResultadoIntento.jsx
import {
    IoArrowBackOutline, IoTrophyOutline,
    IoCheckmarkCircleOutline, IoCloseCircleOutline,
    IoRibbonOutline, IoChatbubbleEllipsesOutline,
    IoTimeOutline,
} from "react-icons/io5";
import { useResultadoIntento } from "../hooks/useResultadoIntento";
import "../styles/cursoResultado.css"; // reutiliza los estilos existentes

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
    } = useResultadoIntento();

    if (cargando) return (
        <div className="cr-loading">
            <IoTrophyOutline size={52} className="cr-loading-icon" />
            <p className="cr-loading-text">Cargando resultado…</p>
        </div>
    );

    if (error || !resultado) return (
        <div className="cr-empty">
            <p className="cr-empty-msg">{error || "Resultado no disponible."}</p>
            <button className="cr-btn cr-btn--primary" onClick={() => navigate(-1)}>
                <IoArrowBackOutline size={15} /> Volver
            </button>
        </div>
    );

    const formatFecha = (fecha) =>
        fecha
            ? new Date(fecha).toLocaleString("es-MX", {
                day: "2-digit", month: "short", year: "numeric",
                hour: "2-digit", minute: "2-digit", hour12: true,
              })
            : "—";

    return (
        <div className="cr-wrap cr-animated">

            {/* Hero */}
            <div className="cr-hero">
                <button className="cr-back-btn" onClick={() => navigate(-1)}>
                    <IoArrowBackOutline size={14} /> Volver
                </button>
                <div className="cr-trophy">
                    <IoTrophyOutline size={40} />
                </div>
                <h1 className="cr-hero-title">
                    Intento #{resultado.numero_intento}
                </h1>
                <p className="cr-hero-sub">Detalle del resultado</p>
                <p className="cr-hero-course">{curso?.titulo || state?.nombreCurso || "—"}</p>
            </div>

            <div className="cr-body">

                {/* Fechas */}
                <div className="cr-card">
                    <div className="cr-card-head">
                        <IoTimeOutline size={15} className="cr-card-head-icon" />
                        <p className="cr-card-head-title">Fechas del intento</p>
                    </div>
                    <div className="cr-card-body">
                        <div className="cr-stats-grid">
                            <div className="cr-stat cr-stat--blue">
                                <div>
                                    <p className="cr-stat-lbl">Fecha inicio</p>
                                    <p className="cr-stat-val" style={{ fontSize: 13 }}>
                                        {formatFecha(resultado.fecha_inicio)}
                                    </p>
                                </div>
                            </div>
                            <div className="cr-stat cr-stat--blue">
                                <div>
                                    <p className="cr-stat-lbl">Fecha fin</p>
                                    <p className="cr-stat-val" style={{ fontSize: 13 }}>
                                        {formatFecha(resultado.fecha_fin)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Resultado cuestionario */}
                <div className="cr-card">
                    <div className="cr-card-head">
                        <IoRibbonOutline size={15} className="cr-card-head-icon" />
                        <p className="cr-card-head-title">Resultado del cuestionario</p>
                        <span className={`cr-badge ${aprobado ? "cr-badge--pass" : "cr-badge--pending"}`}>
                            {aprobado ? "Aprobado" : "En progreso"}
                        </span>
                    </div>
                    <div className="cr-card-body">
                        <div className="cr-circle-wrap">
                            <div
                                className="cr-circle-outer"
                                style={{
                                    background: `conic-gradient(${aprobado ? "#1A5FD4" : "#E8A44A"} ${resultado.puntaje * 3.6}deg, #E2EBF8 0deg)`
                                }}
                            >
                                <div className="cr-circle-inner">
                                    <span className="cr-circle-pct">
                                        {Number(resultado.puntaje).toFixed(0)}%
                                    </span>
                                    <span className="cr-circle-sub">correcto</span>
                                </div>
                            </div>
                            <p className="cr-circle-msg">
                                {resultado.respuestas_correctas} de {resultado.total_preguntas} respuestas correctas
                            </p>
                            <p className="cr-circle-detail">
                                Nivel: <strong>{resultado.nivel || "—"}</strong>
                            </p>
                        </div>

                        <div className="cr-divider" />

                        <div className="cr-stats-grid">
                            <div className="cr-stat cr-stat--green">
                                <div className="cr-stat-icon cr-stat-icon--green">
                                    <IoCheckmarkCircleOutline size={16} />
                                </div>
                                <div>
                                    <p className="cr-stat-lbl">Correctas</p>
                                    <p className="cr-stat-val">{resultado.respuestas_correctas}</p>
                                </div>
                            </div>
                            <div className="cr-stat cr-stat--red">
                                <div className="cr-stat-icon cr-stat-icon--red">
                                    <IoCloseCircleOutline size={16} />
                                </div>
                                <div>
                                    <p className="cr-stat-lbl">Incorrectas</p>
                                    <p className="cr-stat-val">
                                        {resultado.total_preguntas - resultado.respuestas_correctas}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Retroalimentación */}
                {retroalimentacion.length > 0 && (
                    <div className="cr-card">
                        <div className="cr-card-head">
                            <IoChatbubbleEllipsesOutline size={15} className="cr-card-head-icon" />
                            <p className="cr-card-head-title">Retroalimentación</p>
                        </div>
                        <div className="cr-card-body">
                            <ul className="cr-retro-list">
                                {retroalimentacion.map((msg, i) => (
                                    <li key={i} className="cr-retro-item">
                                        <IoCheckmarkCircleOutline size={15} className="cr-retro-icon" />
                                        {msg}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Acciones */}
                

            </div>
        </div>
    );
}