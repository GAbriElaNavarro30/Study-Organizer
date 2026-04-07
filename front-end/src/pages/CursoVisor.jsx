// src/pages/Cursos/CursoVisor.jsx
import { useEffect } from "react";
import {
    IoArrowBackOutline, IoCheckmarkCircleOutline,
    IoChevronBackOutline, IoChevronForwardOutline,
    IoDocumentTextOutline, IoTrophyOutline,
    IoHomeOutline, IoRefreshOutline,
    IoHelpCircleOutline, IoCheckmarkDoneOutline,
    IoReloadOutline, IoLayersOutline, IoSparkles,
} from "react-icons/io5";
import "../styles/cursoVisor.css";
import { useCursoVisor } from "../hooks/useCursoVisor.js";

/* ── Loading ── */
function LoadingState() {
    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                <div style={{ width: 32, height: 32, border: "3px solid #E2E8F0", borderTopColor: "#6366F1", borderRadius: "50%", animation: "cv-spin .7s linear infinite" }} />
                <p style={{ fontSize: 14, fontWeight: 500, color: "#64748B", fontFamily: "'Inter',sans-serif" }}>
                    Cargando visor...
                </p>
            </div>
            <style>{`@keyframes cv-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

/* ── Cuestionario — mismo estilo que PreguntaVisor del tutor ── */
function BloqueTest({ preguntas, respuestas, resultadoTest, onSeleccionar, onEnviar, onReiniciar }) {
    if (!preguntas || preguntas.length === 0) return null;
    const todasRespondidas = preguntas.every(p => respuestas[p.id_test] !== undefined);

    return (
        <div style={{ background: "#F0F9FF", border: "1px solid #BAE6FD", borderRadius: 12, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14, marginTop: 22 }}>
            {/* Header cuestionario */}
            <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#0284C7", paddingBottom: 10, borderBottom: "1px solid #BAE6FD" }}>
                <IoHelpCircleOutline size={13} /> Cuestionario de la sección
                <span style={{ marginLeft: "auto", fontSize: 11, background: "#E0F2FE", color: "#0284C7", padding: "2px 8px", borderRadius: 20, fontWeight: 600, textTransform: "none", letterSpacing: 0 }}>
                    {preguntas.length} pregunta{preguntas.length !== 1 ? "s" : ""}
                </span>
            </div>

            {/* Resultado */}
            {resultadoTest && (
                <div style={{ background: resultadoTest.correctas === resultadoTest.total ? "#F0FDF4" : "#FFFBEB", border: `1px solid ${resultadoTest.correctas === resultadoTest.total ? "#BBF7D0" : "#FDE68A"}`, borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <IoCheckmarkDoneOutline size={20} color={resultadoTest.correctas === resultadoTest.total ? "#16A34A" : "#D97706"} />
                        <div>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#0F172A" }}>{resultadoTest.correctas} / {resultadoTest.total} correctas</p>
                            <p style={{ margin: 0, fontSize: 12, color: "#64748B" }}>{resultadoTest.correctas === resultadoTest.total ? "¡Perfecto! Respondiste todo correctamente." : "Puedes intentarlo de nuevo."}</p>
                        </div>
                    </div>
                    <button onClick={onReiniciar} style={{ display: "flex", alignItems: "center", gap: 6, background: "white", border: "1px solid #E2E8F0", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#64748B", fontFamily: "'Inter',sans-serif" }}>
                        <IoReloadOutline size={13} /> Reintentar
                    </button>
                </div>
            )}

            {/* Preguntas */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {preguntas.map((pregunta, pi) => {
                    const elegida = respuestas[pregunta.id_test];
                    const respondida = resultadoTest !== null;
                    return (
                        <div key={pregunta.id_test}>
                            <p style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", marginBottom: 10, lineHeight: 1.5 }}>
                                <span style={{ color: "#0284C7", marginRight: 6 }}>{pi + 1}.</span>{pregunta.texto_pregunta}
                            </p>
                            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                                {pregunta.opciones?.map(opcion => {
                                    let bg = "white", border = "1.5px solid #E2E8F0", color = "#374151";
                                    if (respondida) {
                                        if (opcion.es_correcta) { bg = "#F0FDF4"; border = "1.5px solid #16A34A"; color = "#15803D"; }
                                        else if (elegida === opcion.id_opcion) { bg = "#FEF2F2"; border = "1.5px solid #DC2626"; color = "#B91C1C"; }
                                    } else if (elegida === opcion.id_opcion) {
                                        bg = "#EEF2FF"; border = "1.5px solid #6366F1"; color = "#3730A3";
                                    }
                                    return (
                                        <button key={opcion.id_opcion} disabled={respondida} onClick={() => onSeleccionar(pregunta.id_test, opcion.id_opcion)}
                                            style={{ background: bg, border, color, borderRadius: 8, padding: "10px 14px", textAlign: "left", cursor: respondida ? "default" : "pointer", fontSize: 13, fontWeight: 500, transition: "all .15s", width: "100%", fontFamily: "'Inter',sans-serif" }}>
                                            {opcion.texto_opcion}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {!resultadoTest && (
                <button onClick={onEnviar} disabled={!todasRespondidas}
                    style={{ alignSelf: "flex-start", padding: "9px 20px", background: todasRespondidas ? "#6366F1" : "#CBD5E1", color: "white", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: todasRespondidas ? "pointer" : "not-allowed", display: "flex", alignItems: "center", gap: 7, fontFamily: "'Inter',sans-serif" }}>
                    <IoCheckmarkDoneOutline size={15} /> Verificar respuestas
                </button>
            )}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════════════════ */
export function CursoVisor() {
    const {
        curso, progreso,
        contenidosVistos, contenidosVistosIniciales,
        cargando, animado,
        seccionIdx, contenidoIdx,
        seccionActual, contenidoActual,
        preguntasActuales,
        hayAnterior, haysSiguiente,
        respuestas, resultadoTest,
        seleccionarRespuesta, enviarTest, reiniciarTest,
        marcarVisto, irASiguiente, irAAnterior, irAContenido,
        navigate,
    } = useCursoVisor();

    useEffect(() => {
        if (contenidoActual?.id_contenido) {
            const timer = setTimeout(() => marcarVisto(contenidoActual.id_contenido), 3000);
            return () => clearTimeout(timer);
        }
    }, [contenidoActual?.id_contenido]);

    if (cargando) return <LoadingState />;
    if (!curso) return null;

    const pct = progreso.porcentaje;
    const completado = progreso.completado;
    const secciones = curso.secciones || [];

    // Índice plano para los dots de navegación
    const todosLosContenidos = secciones.flatMap((s, si) =>
        (s.contenidos || []).map((c, ci) => ({ si, ci, id: c.id_contenido }))
    );
    const idxPlano = todosLosContenidos.findIndex(x => x.si === seccionIdx && x.ci === contenidoIdx);

    return (
        <div className={`cv-app ${animado ? "cv-animated" : ""}`}>

            {/* ── TOPBAR (= vct-topbar) ── */}
            <header className="cv-topbar">
                <button className="cv-topbar-back"
                    onClick={() => navigate("/cursos-detalle", { state: { id_curso: curso.id_curso } })}>
                    <IoArrowBackOutline size={16} /> Volver
                </button>

                {/* Badge progreso — en lugar del badge "Vista previa del tutor" */}
                <div className="cv-topbar-prog">
                    <span className="cv-topbar-pct">{pct}% completado</span>
                    <div className="cv-topbar-track">
                        <div className="cv-topbar-fill" style={{ width: `${pct}%` }} />
                    </div>
                </div>
            </header>

            {/* ── MAIN (= vct-main) ── */}
            <main className="cv-main">

                {/* ── GRID SIDEBAR + CONTENIDO (= vct-preview-root > vct-preview-layout) ── */}
                <div className="cv-preview-root">
                    <div className="cv-preview-layout">

                        {/* SIDEBAR (= vct-preview-sidebar) */}
                        <div className="cv-sidebar">
                            <div className="cv-sidebar-header">
                                <IoLayersOutline size={11} />
                                {secciones.length} sección{secciones.length !== 1 ? "es" : ""}
                            </div>

                            {secciones.map((seccion, si) => {
                                const seccionActiva = si === seccionIdx;
                                return (
                                    <div key={seccion.id_seccion} className={`cv-seccion-nav ${seccionActiva ? "cv-seccion-nav--active" : ""}`}>
                                        <div className="cv-seccion-nav-header">
                                            <span className="cv-seccion-nav-num">{si + 1}</span>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <span className="cv-seccion-nav-label" style={{ fontSize: 12.5, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: seccionActiva ? "#4338CA" : "#64748B" }}>
                                                    {seccion.titulo_seccion || `Sección ${si + 1}`}
                                                </span>
                                                {seccion.preguntas?.length > 0 && (
                                                    <span style={{ fontSize: 10.5, color: "#94A3B8", marginTop: 2, display: "block" }}>
                                                        {seccion.preguntas.length} preg.
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {(seccion.contenidos || []).map((c, ci) => {
                                            const visto = contenidosVistos.has(c.id_contenido);
                                            const activo = si === seccionIdx && ci === contenidoIdx;
                                            return (
                                                <div key={c.id_contenido}
                                                    className={`cv-contenido-nav-item${activo ? " cv-contenido-nav-item--active" : ""}${visto && !activo ? " cv-contenido-nav-item--visto" : ""}`}
                                                    onClick={() => irAContenido(si, ci)}>
                                                    {visto
                                                        ? <IoCheckmarkCircleOutline size={14} className="cv-nav-check" />
                                                        : <span className="cv-nav-dot" />}
                                                    {c.titulo || `Contenido ${ci + 1}`}
                                                </div>
                                            );
                                        })}

                                        {seccion.preguntas?.length > 0 && (
                                            <div className="cv-contenido-nav-item cv-contenido-nav-item--test"
                                                onClick={() => irAContenido(si, 0)}>
                                                <IoHelpCircleOutline size={14} />
                                                Cuestionario ({seccion.preguntas.length} preg.)
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* CONTENIDO PRINCIPAL (= vct-preview-content) */}
                        <div className="cv-content-wrapper">
                            <div className="cv-content-area">
                                {contenidoActual ? (
                                    <>
                                        {/* Tag sección */}
                                        <div className="cv-content-tag">
                                            <IoDocumentTextOutline size={10} />
                                            {seccionActual?.titulo_seccion}
                                        </div>

                                        {/* Título */}
                                        <div className="cv-content-titulo">
                                            {contenidoActual.titulo || `Contenido ${contenidoIdx + 1}`}
                                        </div>

                                        {/* Badge "ya viste" */}
                                        {contenidosVistosIniciales.has(contenidoActual.id_contenido) &&
                                            !contenidosVistos.has(contenidoActual.id_contenido) && (
                                            <div className="cv-visto-badge">
                                                <IoCheckmarkCircleOutline size={15} />
                                                Ya viste este contenido anteriormente
                                            </div>
                                        )}

                                        {/* Imagen */}
                                        {contenidoActual.imagen_url && (
                                            <img src={contenidoActual.imagen_url} alt={contenidoActual.titulo} className="cv-content-imagen" />
                                        )}

                                        {/* Texto */}
                                        {contenidoActual.contenido && (
                                            <div className="cv-content-texto">{contenidoActual.contenido}</div>
                                        )}

                                        {/* Cuestionario */}
                                        <BloqueTest
                                            preguntas={preguntasActuales}
                                            respuestas={respuestas}
                                            resultadoTest={resultadoTest}
                                            onSeleccionar={seleccionarRespuesta}
                                            onEnviar={enviarTest}
                                            onReiniciar={reiniciarTest}
                                        />

                                        {/* Banner completado */}
                                        {completado && (
                                            <div className="cv-completado-banner">
                                                <IoTrophyOutline size={44} className="cv-completado-icon" />
                                                <h2 className="cv-completado-titulo">¡Felicidades!</h2>
                                                <p className="cv-completado-sub">
                                                    Completaste el curso <strong>{curso.titulo}</strong>.<br />
                                                    Puedes retomarlo cuando quieras.
                                                </p>
                                                <div className="cv-completado-btns">
                                                    <button className="cv-completado-btn" onClick={() => navigate("/cursos")}>
                                                        <IoHomeOutline size={14} /> Ver más cursos
                                                    </button>
                                                    <button className="cv-completado-btn cv-completado-btn--outline"
                                                        onClick={() => navigate("/cursos-detalle", { state: { id_curso: curso.id_curso } })}>
                                                        <IoRefreshOutline size={14} /> Ver detalle
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="cv-no-content">
                                        <IoDocumentTextOutline size={44} />
                                        <p>Este curso no tiene contenido disponible aún.</p>
                                    </div>
                                )}
                            </div>

                            {/* ── NAV INFERIOR (= vct-preview-nav) ── */}
                            <div className="cv-nav-footer">
                                <button className="cv-nav-btn" onClick={irAAnterior} disabled={!hayAnterior}>
                                    <IoChevronBackOutline size={14} /> Anterior
                                </button>

                                <div className="cv-nav-dots">
                                    <div className="cv-nav-dots-list">
                                        {todosLosContenidos.map((item, i) => (
                                            <div key={i}
                                                className={`cv-nav-dot-item${i === idxPlano ? " active" : contenidosVistos.has(item.id) ? " done" : ""}`}
                                                onClick={() => irAContenido(item.si, item.ci)}
                                            />
                                        ))}
                                    </div>
                                    <span>Contenido {idxPlano + 1} de {todosLosContenidos.length}</span>
                                </div>

                                {haysSiguiente ? (
                                    <button className="cv-nav-btn cv-nav-btn--next" onClick={irASiguiente}>
                                        Siguiente <IoChevronForwardOutline size={14} />
                                    </button>
                                ) : (
                                    <button className="cv-nav-btn cv-nav-btn--next"
                                        onClick={() => { marcarVisto(contenidoActual.id_contenido); navigate("/cursos/resultado", { state: { id_curso: curso.id_curso } }); }}
                                        style={{ background: "#16A34A", borderColor: "#16A34A" }}>
                                        <IoTrophyOutline size={14} /> Ver resultados
                                    </button>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

            </main>
        </div>
    );
}