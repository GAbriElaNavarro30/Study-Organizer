import { useState, useRef, useEffect } from "react";
import {
    IoArrowBackOutline, IoCheckmarkCircleOutline,
    IoChevronBackOutline, IoChevronForwardOutline,
    IoDocumentTextOutline, IoTrophyOutline,
    IoHomeOutline, IoRefreshOutline,
    IoHelpCircleOutline, IoCheckmarkDoneOutline,
    IoLayersOutline, IoArchiveOutline, IoLockClosedOutline,
    IoChevronForwardOutline as IoNext,
} from "react-icons/io5";
import "../styles/cursoVisor.css";
import { useCursoVisor } from "../hooks/useCursoVisor.js";
import { ModalConfirmarSalirCurso } from "../components/ModalConfirmarSalirCurso.jsx";
import { ModalCursoCompletado } from "../components/ModalCursoCompletado.jsx";

/* ── Loading ── */
function LoadingState() {
    return (
        <div className="cv-loading-root">
            <div className="cv-loading-inner">
                <div className="cv-loading-spinner" />
                <p className="cv-loading-text">Cargando visor...</p>
            </div>
        </div>
    );
}

/* ── Banner archivado ── */
function BannerArchivado({ titulo, onVolver }) {
    return (
        <div className="cv-banner-archivado">
            <div className="cv-banner-archivado__icon"><IoArchiveOutline size={24} /></div>
            <h2 className="cv-banner-archivado__titulo">Curso archivado</h2>
            <p className="cv-banner-archivado__desc">
                <strong>{titulo}</strong> está en modo solo lectura. Puedes navegar el contenido y consultar tus
                resultados, pero no registrar nuevo progreso ni responder cuestionarios.
            </p>
            <button onClick={onVolver} className="cv-banner-archivado__btn">
                <IoArrowBackOutline size={14} /> Volver al catálogo
            </button>
        </div>
    );
}

/* ── Cuestionario ── */
function BloqueTest({ preguntas, respuestas, resultadoTest, onSeleccionar, onEnviar, soloLectura }) {
    if (!preguntas || preguntas.length === 0) return null;
    const todasRespondidas = preguntas.every(p => respuestas[p.id_test] !== undefined);

    return (
        <div className={`cv-bloque-test ${soloLectura ? "cv-bloque-test--archivado" : ""}`}>
            <div className={`cv-bloque-test__header ${soloLectura ? "cv-bloque-test__header--archivado" : ""}`}>
                <IoHelpCircleOutline size={13} />
                Cuestionario de la sección
                <span className={`cv-bloque-test__count ${soloLectura ? "cv-bloque-test__count--archivado" : ""}`}>
                    {preguntas.length} pregunta{preguntas.length !== 1 ? "s" : ""}
                </span>
                {soloLectura && (
                    <span className="cv-bloque-test__solo-badge">
                        <IoArchiveOutline size={10} /> Solo lectura
                    </span>
                )}
            </div>

            {soloLectura && (
                <div className="cv-bloque-test__aviso-archivado">
                    <IoArchiveOutline size={14} />
                    Este cuestionario no puede responderse porque el curso está archivado.
                </div>
            )}

            {resultadoTest && (
                <div className={`cv-bloque-test__resultado ${resultadoTest.correctas === resultadoTest.total ? "cv-bloque-test__resultado--perfecto" : "cv-bloque-test__resultado--parcial"}`}>
                    <div className="cv-bloque-test__resultado-info">
                        <IoCheckmarkDoneOutline size={20} className={resultadoTest.correctas === resultadoTest.total ? "cv-icon--success" : "cv-icon--warning"} />
                        <div>
                            <p className="cv-bloque-test__resultado-score">{resultadoTest.correctas} / {resultadoTest.total} correctas</p>
                            <p className="cv-bloque-test__resultado-msg">
                                {resultadoTest.correctas === resultadoTest.total
                                    ? "¡Perfecto! Respondiste todo correctamente."
                                    : "Puedes intentarlo de nuevo."}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="cv-bloque-test__preguntas">
                {preguntas.map((pregunta, pi) => {
                    const elegida = respuestas[pregunta.id_test];
                    const respondida = resultadoTest !== null;
                    return (
                        <div key={pregunta.id_test} className="cv-pregunta">
                            <p className="cv-pregunta__texto">
                                <span className={`cv-pregunta__num ${soloLectura ? "cv-pregunta__num--archivado" : ""}`}>{pi + 1}.</span>
                                {pregunta.texto_pregunta}
                            </p>
                            <div className="cv-pregunta__opciones">
                                {pregunta.opciones?.map(opcion => {
                                    let mod = "";
                                    if (respondida) {
                                        if (opcion.es_correcta) mod = "cv-opcion--correcta";
                                        else if (elegida === opcion.id_opcion) mod = "cv-opcion--incorrecta";
                                    } else if (elegida === opcion.id_opcion) {
                                        mod = "cv-opcion--elegida";
                                    }
                                    return (
                                        <button
                                            key={opcion.id_opcion}
                                            disabled={respondida || soloLectura}
                                            onClick={() => !respondida && !soloLectura && onSeleccionar(pregunta.id_test, opcion.id_opcion)}
                                            className={`cv-opcion ${mod} ${soloLectura ? "cv-opcion--readonly" : ""}`}
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

            {!resultadoTest && !soloLectura && (
                <button
                    onClick={onEnviar}
                    disabled={!todasRespondidas}
                    className={`cv-bloque-test__verificar-btn ${!todasRespondidas ? "cv-bloque-test__verificar-btn--disabled" : ""}`}
                >
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
        curso, progreso, soloLectura,
        contenidosVistos, contenidosVistosIniciales,
        cargando, animado,
        seccionIdx, contenidoIdx,
        seccionActual, contenidoActual,
        preguntasActuales,
        hayAnterior, haysSiguiente,
        respuestas, resultadoTest,
        marcadoEnSesion,
        testPendiente, siguienteBloqueado,
        mostrarModalSalir, setMostrarModalSalir,
        seleccionarRespuesta, enviarTest,
        irAAnterior, irAContenido,
        handleSiguiente, handleVerResultados, handleConfirmarSalir,
        navigate,
    } = useCursoVisor();

    const [mostrarModalCompletado, setMostrarModalCompletado] = useState(false);
    const completadoPrevio = useRef(false);

    const completado = progreso.completado;

    useEffect(() => {
        if (completado && !soloLectura && !completadoPrevio.current) {
            completadoPrevio.current = true;
            setMostrarModalCompletado(true);
        }
    }, [completado, soloLectura]);

    if (cargando) return <LoadingState />;
    if (!curso) return null;

    const pct = progreso.porcentaje;
    const secciones = curso.secciones || [];

    const todosLosContenidos = secciones.flatMap((s, si) =>
        (s.contenidos || []).map((c, ci) => ({ si, ci, id: c.id_contenido }))
    );
    const idxPlano = todosLosContenidos.findIndex(x => x.si === seccionIdx && x.ci === contenidoIdx);

    // ── Helpers para bloqueo del sidebar ──
    const toPlano = (si, ci) =>
        secciones.slice(0, si).reduce((acc, s) => acc + (s.contenidos?.length || 0), 0) + ci;

    const puedeIr = (si, ci) => {
        if (soloLectura) return true;
        const dest = toPlano(si, ci);
        const actual = toPlano(seccionIdx, contenidoIdx);
        if (dest <= actual) return true;
        return marcadoEnSesion && !testPendiente && dest === actual + 1;
    };

    return (
        <div className={`cv-app ${animado ? "cv-animated" : ""}`}>

            {/* ── TOPBAR ── */}
            <header className="cv-topbar">
                <button className="cv-topbar-back" onClick={() => setMostrarModalSalir(true)}>
                    <IoArrowBackOutline size={16} /> Volver
                </button>
                <span className="cv-topbar-curso-nombre">{curso.titulo}</span>
                <div className="cv-topbar-prog">
                    {soloLectura ? (
                        <span className="cv-topbar-archivado-badge">
                            <IoArchiveOutline size={13} /> Archivado
                        </span>
                    ) : (
                        <>
                            <span className="cv-topbar-pct">{pct}%</span>
                            <div className="cv-topbar-track">
                                <div className="cv-topbar-fill" style={{ width: `${pct}%` }} />
                            </div>
                        </>
                    )}
                </div>
            </header>

            {/* ── MAIN ── */}
            <main className="cv-main">
                {soloLectura && (
                    <div className="cv-aviso-archivado-top">
                        <div className="cv-aviso-archivado-top__inner">
                            <IoArchiveOutline size={15} />
                            Este curso está archivado. Puedes ver el contenido, pero no registrar progreso ni responder cuestionarios.
                        </div>
                    </div>
                )}

                <div className="cv-preview-root">
                    <div className="cv-preview-layout">

                        {/* ── SIDEBAR ── */}
                        <div className="cv-sidebar">
                            <div className="cv-sidebar-curso-header">
                                <div className="cv-sidebar-curso-label">Curso</div>
                                <div className="cv-sidebar-curso-nombre">{curso.titulo}</div>
                            </div>
                            <div className="cv-sidebar-header">
                                <IoLayersOutline size={11} />
                                {secciones.length} sección{secciones.length !== 1 ? "es" : ""}
                            </div>
                            <div className="cv-sidebar-nav">
                                {secciones.map((seccion, si) => {
                                    const seccionActiva = si === seccionIdx;
                                    // Una sección está vista si todos sus contenidos están vistos
                                    const seccionVista = (seccion.contenidos || []).every(c => contenidosVistos.has(c.id_contenido));
                                    // Está bloqueada si es futura y la actual aún no está lista
                                    const bloqueada = si > seccionIdx && (!marcadoEnSesion || testPendiente);
                                    // Solo puede ir a la siguiente inmediata
                                    const muyBloqueada = si > seccionIdx + 1 || (si === seccionIdx + 1 && (!marcadoEnSesion || testPendiente));

                                    return (
                                        <div key={seccion.id_seccion} className={`cv-seccion-nav ${seccionActiva ? "cv-seccion-nav--active" : ""}`}>
                                            <div
                                                className="cv-seccion-nav-header"
                                                onClick={() => irAContenido(si, 0)}
                                                style={{
                                                    cursor: muyBloqueada ? "not-allowed" : "pointer",
                                                    opacity: muyBloqueada ? 0.45 : 1,
                                                }}
                                            >
                                                <span className="cv-seccion-nav-num">
                                                    {seccionVista && !seccionActiva
                                                        ? <IoCheckmarkCircleOutline size={13} style={{ color: "var(--cv-success)" }} />
                                                        : muyBloqueada
                                                            ? <IoLockClosedOutline size={11} />
                                                            : si + 1}
                                                </span>
                                                <div className="cv-seccion-nav-info">
                                                    <span className={`cv-seccion-nav-label ${seccionActiva ? "cv-seccion-nav-label--active" : ""}`}>
                                                        {seccion.titulo_seccion || `Sección ${si + 1}`}
                                                    </span>
                                                    {muyBloqueada
                                                        ? <span className="cv-seccion-nav-pregs">Completa la sección anterior</span>
                                                        : seccion.preguntas?.length > 0 && (
                                                            <span className="cv-seccion-nav-pregs">{seccion.preguntas.length} preg.</span>
                                                        )
                                                    }
                                                </div>
                                            </div>

                                            {seccion.preguntas?.length > 0 && !muyBloqueada && (
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
                        </div>

                        {/* ── CONTENIDO PRINCIPAL ── */}
                        <div className="cv-content-wrapper">
                            <div className="cv-content-area">
                                {seccionActual ? (
                                    <>
                                        <div className="cv-seccion-bloque">
                                            <div className="cv-seccion-bloque__etiqueta">
                                                <IoLayersOutline size={11} />
                                                Sección {seccionIdx + 1}
                                            </div>
                                            <div className="cv-seccion-bloque__nombre">
                                                {seccionActual?.titulo_seccion}
                                            </div>
                                            {seccionActual?.descripcion_seccion && (
                                                <p className="cv-seccion-bloque__desc">
                                                    {seccionActual.descripcion_seccion}
                                                </p>
                                            )}
                                        </div>

                                        <div className="cv-bloque-contenido">
                                            {(seccionActual.contenidos || []).map((con) => (
                                                <div key={con.id_contenido}>
                                                    {con.titulo && (
                                                        <div className="cv-content-titulo">{con.titulo}</div>
                                                    )}
                                                    {con.contenido && (
                                                        <div className="cv-content-texto">{con.contenido}</div>
                                                    )}
                                                    {con.imagen_url && (
                                                        <img
                                                            src={con.imagen_url}
                                                            alt={con.titulo}
                                                            className="cv-content-imagen"
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <BloqueTest
                                            preguntas={preguntasActuales}
                                            respuestas={respuestas}
                                            resultadoTest={resultadoTest}
                                            onSeleccionar={seleccionarRespuesta}
                                            onEnviar={enviarTest}
                                            soloLectura={soloLectura}
                                        />

                                        {soloLectura && (
                                            <BannerArchivado
                                                titulo={curso.titulo}
                                                onVolver={() => navigate("/cursos")}
                                            />
                                        )}
                                    </>
                                ) : (
                                    <div className="cv-no-content">
                                        <IoDocumentTextOutline size={48} />
                                        <p>Este curso no tiene contenido disponible aún.</p>
                                    </div>
                                )}
                            </div>

                            {/* ── NAV INFERIOR ── */}
                            <div className="cv-nav-footer">
                                <button className="cv-nav-btn" onClick={irAAnterior} disabled={!hayAnterior}>
                                    <IoChevronBackOutline size={14} /> Anterior
                                </button>

                                <div className="cv-nav-dots">
                                    <div className="cv-nav-dots-list">
                                        {secciones.map((s, i) => (
                                            <div key={i}
                                                className={`cv-nav-dot-item${i === seccionIdx ? " active" : (s.contenidos || []).every(c => contenidosVistos.has(c.id_contenido)) ? " done" : ""}`}
                                                onClick={() => irAContenido(i, 0)}
                                            />
                                        ))}
                                    </div>
                                    <span>Sección {seccionIdx + 1} de {secciones.length}</span>
                                </div>

                                {soloLectura ? (
                                    haysSiguiente ? (
                                        <button className="cv-nav-btn cv-nav-btn--next" onClick={handleSiguiente}>
                                            Siguiente <IoChevronForwardOutline size={14} />
                                        </button>
                                    ) : (
                                        <button className="cv-nav-btn cv-nav-btn--catalogo" onClick={() => navigate("/cursos")}>
                                            <IoArchiveOutline size={14} /> Ver catálogo
                                        </button>
                                    )
                                ) : haysSiguiente ? (
                                    <button
                                        className={`cv-nav-btn cv-nav-btn--next${siguienteBloqueado ? " cv-nav-btn--locked" : ""}`}
                                        onClick={handleSiguiente}
                                        disabled={siguienteBloqueado}
                                        title={siguienteBloqueado ? (testPendiente ? "Responde el cuestionario antes de continuar" : "Espera a que se registre el progreso") : ""}
                                    >
                                        {siguienteBloqueado
                                            ? <><IoLockClosedOutline size={13} /> Cargando...</>
                                            : <>Siguiente <IoChevronForwardOutline size={14} /></>}
                                    </button>
                                ) : (
                                    <button
                                        className={`cv-nav-btn cv-nav-btn--next cv-nav-btn--resultado${siguienteBloqueado ? " cv-nav-btn--locked" : ""}`}
                                        onClick={handleVerResultados}
                                        disabled={siguienteBloqueado}
                                        title={siguienteBloqueado ? (testPendiente ? "Responde el cuestionario antes de continuar" : "Espera a que se registre el progreso") : ""}
                                    >
                                        {siguienteBloqueado
                                            ? <><IoLockClosedOutline size={13} /> Cargando...</>
                                            : <><IoTrophyOutline size={14} /> Ver resultados</>}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* ── MODALES ── */}
            {mostrarModalSalir && (
                <ModalConfirmarSalirCurso
                    onConfirmar={handleConfirmarSalir}
                    onCancelar={() => setMostrarModalSalir(false)}
                />
            )}

            {mostrarModalCompletado && (
                <ModalCursoCompletado
                    titulo={curso.titulo}
                    onCerrar={() => setMostrarModalCompletado(false)}
                />
            )}
        </div>
    );
}