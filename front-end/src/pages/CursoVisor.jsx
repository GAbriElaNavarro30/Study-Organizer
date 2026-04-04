// src/pages/Cursos/CursoVisor.jsx
import { useEffect } from "react";
import {
    IoArrowBackOutline, IoCheckmarkCircleOutline,
    IoChevronBackOutline, IoChevronForwardOutline,
    IoDocumentTextOutline, IoTrophyOutline,
    IoHomeOutline, IoRefreshOutline,
    IoMenuOutline, IoCloseOutline,
    IoHelpCircleOutline, IoCheckmarkDoneOutline,
    IoReloadOutline,
} from "react-icons/io5";
import "../styles/cursoVisor.css";
import { useCursoVisor } from "../hooks/useCursoVisor.js";

function LoadingState() {
    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F9F5EF" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                <div style={{ color: "#1277dd", animation: "ce-pulse 1.4s ease-in-out infinite" }}>
                    <IoDocumentTextOutline size={52} />
                </div>
                <p style={{ fontSize: 17, fontWeight: 500, color: "#4A5A6E", fontFamily: "'DM Sans',sans-serif" }}>
                    Cargando visor...
                </p>
                <div style={{ display: "flex", gap: 6 }}>
                    {[0, .2, .4].map((d, i) => (
                        <span key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#1277dd", display: "block", animation: `ce-bounce 1.2s ${d}s ease-in-out infinite` }} />
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ── Bloque del cuestionario ── */
function BloqueTest({ preguntas, respuestas, resultadoTest, onSeleccionar, onEnviar, onReiniciar }) {
    if (!preguntas || preguntas.length === 0) return null;

    const todasRespondidas = preguntas.every(p => respuestas[p.id_test] !== undefined);

    return (
        <div style={{ marginTop: 40, borderTop: "2px solid #E8EEF7", paddingTop: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
                <IoHelpCircleOutline size={20} color="#1277dd" />
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1A2B4A", margin: 0 }}>
                    Cuestionario de la sección
                </h2>
                <span style={{ marginLeft: "auto", fontSize: 12, background: "#E8F0FD", color: "#1277dd", padding: "3px 10px", borderRadius: 20, fontWeight: 600 }}>
                    {preguntas.length} pregunta{preguntas.length !== 1 ? "s" : ""}
                </span>
            </div>

            {/* Resultado */}
            {resultadoTest && (
                <div style={{
                    background: resultadoTest.correctas === resultadoTest.total ? "#E6F7EF" : "#FFF4E5",
                    border: `1px solid ${resultadoTest.correctas === resultadoTest.total ? "#2E8B57" : "#E8A44A"}`,
                    borderRadius: 12, padding: "16px 20px", marginBottom: 24,
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <IoCheckmarkDoneOutline size={22} color={resultadoTest.correctas === resultadoTest.total ? "#2E8B57" : "#E8A44A"} />
                        <div>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#1A2B4A" }}>
                                {resultadoTest.correctas} / {resultadoTest.total} correctas
                            </p>
                            <p style={{ margin: 0, fontSize: 12, color: "#4A5A6E" }}>
                                {resultadoTest.correctas === resultadoTest.total
                                    ? "¡Perfecto! Respondiste todo correctamente."
                                    : "Puedes intentarlo de nuevo."}
                            </p>
                        </div>
                    </div>
                    <button onClick={onReiniciar} style={{
                        display: "flex", alignItems: "center", gap: 6,
                        background: "white", border: "1px solid #CBD5E1",
                        borderRadius: 8, padding: "7px 14px", cursor: "pointer",
                        fontSize: 13, fontWeight: 600, color: "#4A5A6E",
                    }}>
                        <IoReloadOutline size={14} /> Reintentar
                    </button>
                </div>
            )}

            {/* Preguntas */}
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                {preguntas.map((pregunta, pi) => {
                    const elegida = respuestas[pregunta.id_test];
                    const respondida = resultadoTest !== null;

                    return (
                        <div key={pregunta.id_test}>
                            <p style={{ fontSize: 15, fontWeight: 600, color: "#1A2B4A", marginBottom: 12 }}>
                                <span style={{ color: "#1277dd", marginRight: 6 }}>{pi + 1}.</span>
                                {pregunta.texto_pregunta}
                            </p>

                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {pregunta.opciones?.map(opcion => {
                                    let bg = "white", border = "1px solid #CBD5E1", color = "#1A2B4A";

                                    if (respondida) {
                                        if (opcion.es_correcta) {
                                            bg = "#E6F7EF"; border = "1px solid #2E8B57"; color = "#1A6E3C";
                                        } else if (elegida === opcion.id_opcion && !opcion.es_correcta) {
                                            bg = "#FFF0F0"; border = "1px solid #C0392B"; color = "#C0392B";
                                        }
                                    } else if (elegida === opcion.id_opcion) {
                                        bg = "#E8F0FD"; border = "1px solid #1277dd"; color = "#1277dd";
                                    }

                                    return (
                                        <button
                                            key={opcion.id_opcion}
                                            disabled={respondida}
                                            onClick={() => onSeleccionar(pregunta.id_test, opcion.id_opcion)}
                                            style={{
                                                background: bg, border, color,
                                                borderRadius: 10, padding: "11px 16px",
                                                textAlign: "left", cursor: respondida ? "default" : "pointer",
                                                fontSize: 14, fontWeight: 500,
                                                transition: "all .15s", width: "100%",
                                            }}
                                        >
                                            {opcion.texto_opcion}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Botón enviar */}
            {!resultadoTest && (
                <button
                    onClick={onEnviar}
                    disabled={!todasRespondidas}
                    style={{
                        marginTop: 28, padding: "12px 28px",
                        background: todasRespondidas ? "linear-gradient(135deg,#1277dd,#1A5FD4)" : "#CBD5E1",
                        color: "white", border: "none", borderRadius: 10,
                        fontSize: 15, fontWeight: 700, cursor: todasRespondidas ? "pointer" : "not-allowed",
                        display: "flex", alignItems: "center", gap: 8,
                    }}
                >
                    <IoCheckmarkDoneOutline size={16} />
                    Verificar respuestas
                </button>
            )}
        </div>
    );
}

export function CursoVisor() {
    const {
        curso, progreso,
        contenidosVistos,           // vistos en esta sesión → para el sidebar y el progreso
        contenidosVistosIniciales,  // vistos que venían del servidor → solo para el badge
        cargando, animado,
        seccionIdx, contenidoIdx,
        seccionActual, contenidoActual,
        preguntasActuales,
        sidebarAbierto, setSidebarAbierto,
        hayAnterior, haysSiguiente,
        totalContenidos,
        modoTest, setModoTest,
        respuestas, resultadoTest,
        seleccionarRespuesta, enviarTest, reiniciarTest,
        marcarVisto, irASiguiente, irAAnterior, irAContenido,
        navigate,
    } = useCursoVisor();

    // Marcar como visto automáticamente tras 3 segundos — fire-and-forget
    useEffect(() => {
        if (contenidoActual?.id_contenido) {
            const timer = setTimeout(() => {
                marcarVisto(contenidoActual.id_contenido);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [contenidoActual?.id_contenido]);

    if (cargando) return <LoadingState />;
    if (!curso) return null;

    const pct = progreso.porcentaje;
    const completado = progreso.completado;
    const secciones = curso.secciones || [];

    return (
        <div className={`cv-app ${animado ? "cv-animated" : ""}`}>

            {/* TOP BAR */}
            <div className="cv-topbar">
                <button
                    className="cv-topbar-back"
                    onClick={() => navigate("/cursos-detalle", { state: { id_curso: curso.id_curso } })}
                >
                    <IoArrowBackOutline size={13} /> Detalle
                </button>

                <button
                    style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.6)", display: "flex", alignItems: "center" }}
                    onClick={() => setSidebarAbierto(v => !v)}
                >
                    {sidebarAbierto ? <IoCloseOutline size={20} /> : <IoMenuOutline size={20} />}
                </button>

                <span className="cv-topbar-titulo">{curso.titulo}</span>

                <div className="cv-topbar-prog">
                    <span className="cv-topbar-pct">{pct}%</span>
                    <div className="cv-topbar-track">
                        <div className="cv-topbar-fill" style={{ width: `${pct}%` }} />
                    </div>
                </div>
            </div>

            {/* LAYOUT */}
            <div className="cv-layout">

                {/* SIDEBAR */}
                {sidebarAbierto && (
                    <aside className="cv-sidebar">
                        <div className="cv-sidebar-header">
                            <p className="cv-sidebar-title">Contenido del curso</p>
                        </div>

                        {secciones.map((seccion, si) => (
                            <div key={seccion.id_seccion} className="cv-seccion-nav">
                                <div className="cv-seccion-nav-header">
                                    <span className="cv-seccion-nav-num">{si + 1}</span>
                                    {seccion.titulo_seccion}
                                </div>

                                {(seccion.contenidos || []).map((c, ci) => {
                                    // En el sidebar mostramos como visto lo de esta sesión
                                    const visto = contenidosVistos.has(c.id_contenido);
                                    const activo = si === seccionIdx && ci === contenidoIdx;

                                    return (
                                        <div
                                            key={c.id_contenido}
                                            className={`cv-contenido-nav-item ${activo ? "cv-contenido-nav-item--active" : ""} ${visto && !activo ? "cv-contenido-nav-item--visto" : ""}`}
                                            onClick={() => irAContenido(si, ci)}
                                        >
                                            {visto
                                                ? <IoCheckmarkCircleOutline size={14} className="cv-nav-check" />
                                                : <span className="cv-nav-dot" />
                                            }
                                            {c.titulo || `Contenido ${ci + 1}`}
                                        </div>
                                    );
                                })}

                                {/* Indicador de test en sidebar */}
                                {seccion.preguntas?.length > 0 && (
                                    <div
                                        className={`cv-contenido-nav-item ${si === seccionIdx ? "cv-contenido-nav-item--test" : ""}`}
                                        style={{ opacity: 0.75, fontStyle: "italic" }}
                                        onClick={() => { irAContenido(si, 0); }}
                                    >
                                        <IoHelpCircleOutline size={14} />
                                        Cuestionario ({seccion.preguntas.length} preg.)
                                    </div>
                                )}
                            </div>
                        ))}
                    </aside>
                )}

                {/* VISOR PRINCIPAL */}
                <main className="cv-main">
                    <div className="cv-content-area">

                        {contenidoActual ? (
                            <>
                                <div className="cv-content-tag">
                                    <IoDocumentTextOutline size={10} />
                                    {seccionActual?.titulo_seccion}
                                </div>

                                <h1 className="cv-content-titulo">
                                    {contenidoActual.titulo || `Contenido ${contenidoIdx + 1}`}
                                </h1>

                                {/*
                                    Badge "Ya viste este contenido":
                                    Solo aparece si el contenido ya estaba guardado en el servidor
                                    ANTES de que el usuario empezara esta sesión, Y además
                                    no lo ha visto aún en la sesión actual (para no mostrarlo
                                    justo después de marcarlo).
                                */}
                                {contenidosVistosIniciales.has(contenidoActual.id_contenido) &&
                                    !contenidosVistos.has(contenidoActual.id_contenido) && (
                                    <div className="cv-visto-badge">
                                        <IoCheckmarkCircleOutline size={16} />
                                        Ya viste este contenido anteriormente
                                    </div>
                                )}

                                {contenidoActual.imagen_url && (
                                    <img
                                        src={contenidoActual.imagen_url}
                                        alt={contenidoActual.titulo}
                                        className="cv-content-imagen"
                                    />
                                )}

                                {contenidoActual.contenido && (
                                    <div className="cv-content-texto">
                                        {contenidoActual.contenido}
                                    </div>
                                )}

                                {/* ── Cuestionario de la sección ── */}
                                <BloqueTest
                                    preguntas={preguntasActuales}
                                    respuestas={respuestas}
                                    resultadoTest={resultadoTest}
                                    onSeleccionar={seleccionarRespuesta}
                                    onEnviar={enviarTest}
                                    onReiniciar={reiniciarTest}
                                />

                                <div className="cv-nav-footer">
                                    <button
                                        className="cv-nav-btn cv-nav-btn--prev"
                                        onClick={irAAnterior}
                                        disabled={!hayAnterior}
                                    >
                                        <IoChevronBackOutline size={14} /> Anterior
                                    </button>

                                    {haysSiguiente ? (
                                        <button
                                            className="cv-nav-btn cv-nav-btn--next"
                                            onClick={irASiguiente}
                                        >
                                            Siguiente <IoChevronForwardOutline size={14} />
                                        </button>
                                    ) : (
                                        <button
                                            className="cv-nav-btn cv-nav-btn--next"
                                            onClick={() => {
                                                marcarVisto(contenidoActual.id_contenido);
                                                navigate("/cursos/resultado", { state: { id_curso: curso.id_curso } });
                                            }}
                                            style={{ background: "linear-gradient(135deg,#1A6E3C,#2E8B57)" }}
                                        >
                                            <IoTrophyOutline size={14} /> Ver resultados
                                        </button>
                                    )}
                                </div>

                                {completado && (
                                    <div className="cv-completado-banner">
                                        <IoTrophyOutline size={52} className="cv-completado-icon" />
                                        <h2 className="cv-completado-titulo">¡Felicidades!</h2>
                                        <p className="cv-completado-sub">
                                            Completaste el curso <strong>{curso.titulo}</strong>.<br />
                                            Puedes retomarlo cuando quieras.
                                        </p>
                                        <div className="cv-completado-btns">
                                            <button
                                                className="cv-completado-btn"
                                                onClick={() => navigate("/cursos")}
                                            >
                                                <IoHomeOutline size={15} /> Ver más cursos
                                            </button>
                                            <button
                                                className="cv-completado-btn cv-completado-btn--outline"
                                                onClick={() => navigate("/cursos-detalle", { state: { id_curso: curso.id_curso } })}
                                            >
                                                <IoRefreshOutline size={15} /> Ver detalle
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="cv-no-content">
                                <IoDocumentTextOutline size={52} />
                                <p>Este curso no tiene contenido disponible aún.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}