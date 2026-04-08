// src/pages/Cursos/CursoResultado.jsx
import {
    IoTrophyOutline, IoCheckmarkCircleOutline,
    IoCloseCircleOutline, IoHomeOutline,
    IoArrowBackOutline, IoBookOutline,
    IoAnalyticsOutline, IoRibbonOutline,
    IoTimeOutline, IoRefreshOutline,
} from "react-icons/io5";
import { useCursoResultado } from "../hooks/useCursoResultado.js";
import "../styles/cursoResultado.css";

function LoadingState() {
    return (
        <div className="cr-loading">
            <IoTrophyOutline size={52} className="cr-loading-icon" />
            <p className="cr-loading-text">Cargando resultados…</p>
        </div>
    );
}

export function CursoResultado() {
    const { resultado, curso, progreso, cargando, animado, error, navigate } = useCursoResultado();

    if (cargando) return <LoadingState />;

    if (error || !curso) {
        return (
            <div className="cr-empty">
                <IoBookOutline size={44} className="cr-empty-icon" />
                <p className="cr-empty-msg">{error || "Resultado no disponible."}</p>
                <button className="cr-btn cr-btn--primary" onClick={() => navigate("/cursos")}>
                    <IoHomeOutline size={15} /> Volver a cursos
                </button>
            </div>
        );
    }

    const pct = progreso?.porcentaje ?? 100;
    const totalContenidos = progreso?.total ?? 0;
    const vistos = progreso?.vistos ?? 0;
    const aprobado = resultado ? Number(resultado.porcentaje) >= 70 : true;

    return (
        <div className={`cr-wrap ${animado ? "cr-animated" : ""}`}>

            {/* ── HERO ── */}
            <div className="cr-hero">
                <button
                    className="cr-back-btn"
                    onClick={() => navigate("/cursos-detalle", { state: { id_curso: curso.id_curso } })}
                >
                    <IoArrowBackOutline size={14} /> Detalle
                </button>

                <div className="cr-trophy">
                    <IoTrophyOutline size={40} />
                </div>

                <h1 className="cr-hero-title">
                    {aprobado ? "¡Felicidades!" : "¡Curso completado!"}
                </h1>
                <p className="cr-hero-sub">Completaste el curso</p>
                <p className="cr-hero-course">{curso.titulo}</p>
            </div>

            {/* ── BODY ── */}
            <div className="cr-body">

                {/* Progreso */}
                <div className="cr-card">
                    <div className="cr-card-head">
                        <IoAnalyticsOutline size={15} className="cr-card-head-icon" />
                        <p className="cr-card-head-title">Progreso del curso</p>
                    </div>
                    <div className="cr-card-body">
                        <div className="cr-prog-row">
                            <span className="cr-prog-label">Contenidos vistos</span>
                            <span className="cr-prog-pct">{pct}%</span>
                        </div>
                        <div className="cr-track">
                            <div className="cr-fill" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="cr-prog-sub">{vistos} de {totalContenidos} contenidos completados</p>

                        <div className="cr-stats-grid">
                            <StatBox
                                variant="green"
                                icon={<IoCheckmarkCircleOutline size={16} />}
                                label="Vistos"
                                value={vistos}
                            />
                            <StatBox
                                variant="blue"
                                icon={<IoTimeOutline size={16} />}
                                label="Total"
                                value={totalContenidos}
                            />
                        </div>
                    </div>
                </div>

                {/* Resultado cuestionario */}
                {resultado && (
                    <div className="cr-card">
                        <div className="cr-card-head">
                            <IoRibbonOutline size={15} className="cr-card-head-icon" />
                            <p className="cr-card-head-title">Resultado del cuestionario</p>
                            <span className={`cr-badge ${aprobado ? "cr-badge--pass" : "cr-badge--pending"}`}>
                                {aprobado ? "Aprobado" : "En progreso"}
                            </span>
                        </div>
                        <div className="cr-card-body">
                            {/* Círculo */}
                            <div className="cr-circle-wrap">
                                <div
                                    className="cr-circle-outer"
                                    style={{
                                        background: `conic-gradient(${aprobado ? "#1A5FD4" : "#E8A44A"} ${resultado.porcentaje * 3.6}deg, #E2EBF8 0deg)`
                                    }}
                                >
                                    <div className="cr-circle-inner">
                                        <span className="cr-circle-pct">
                                            {Number(resultado.porcentaje).toFixed(0)}%
                                        </span>
                                        <span className="cr-circle-sub">correcto</span>
                                    </div>
                                </div>
                                <p className="cr-circle-msg">
                                    {resultado.respuestas_correctas} de {resultado.total_preguntas} respuestas correctas
                                </p>
                                <p className="cr-circle-detail">
                                    {aprobado
                                        ? "¡Excelente desempeño en el cuestionario!"
                                        : "Puedes tomar el curso de nuevo para mejorar tu puntaje."}
                                </p>
                            </div>

                            <div className="cr-divider" />

                            <div className="cr-stats-grid">
                                <StatBox
                                    variant="green"
                                    icon={<IoCheckmarkCircleOutline size={16} />}
                                    label="Correctas"
                                    value={resultado.respuestas_correctas}
                                />
                                <StatBox
                                    variant="red"
                                    icon={<IoCloseCircleOutline size={16} />}
                                    label="Incorrectas"
                                    value={resultado.total_preguntas - resultado.respuestas_correctas}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Acciones */}
                <div className="cr-actions">
                    <button className="cr-btn cr-btn--primary" onClick={() => navigate("/cursos")}>
                        <IoHomeOutline size={15} /> Ver más cursos
                    </button>
                    <button
                        className="cr-btn cr-btn--outline"
                        onClick={() => navigate("/cursos-detalle", { state: { id_curso: curso.id_curso } })}
                    >
                        <IoRefreshOutline size={15} /> Volver al detalle
                    </button>
                </div>
            </div>
        </div>
    );
}

function StatBox({ variant, icon, label, value }) {
    return (
        <div className={`cr-stat cr-stat--${variant}`}>
            <div className={`cr-stat-icon cr-stat-icon--${variant}`}>{icon}</div>
            <div>
                <p className="cr-stat-lbl">{label}</p>
                <p className="cr-stat-val">{value}</p>
            </div>
        </div>
    );
}