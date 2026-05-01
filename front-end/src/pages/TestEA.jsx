import "../styles/testea.css";
import { ModalAbandonarTest } from "../components/ModalAbandonarTest";
import { CustomAlert } from "../components/CustomAlert";
import {
    IoVolumeMuteOutline, IoMusicalNotesOutline,
    IoCheckmarkOutline, IoArrowForwardOutline, IoArrowBackOutline,
    IoTimeOutline, IoListOutline, IoArrowBackCircleOutline,
} from "react-icons/io5";
import logo from "../assets/imagenes/logotipo.png";
import { useTestEA, PREGUNTAS, SELECTED_COLOR, SELECTED_BG, LETRAS } from "../hooks/useTestEA";

export function TestEA() {
    const {
        // Referencias
        iframeRef,
        mainRef,

        // Estado
        respuestas,
        actual,
        muted,
        mostrarModal, setMostrarModal,
        enviando,
        errorEnvio,
        mostrarAlertExito,

        // Derivados
        totalPreguntas,
        respondidas,
        progreso,
        preguntaActual,
        seleccionActual,
        todasRespondidas,

        // Handlers
        toggleMute,
        seleccionar,
        irA,
        siguiente,
        anterior,
        enviar,
        handleCerrarAlertExito,
        handleAbandonar,
    } = useTestEA();

    return (
        <div className="test-app">

            {mostrarModal && (
                <ModalAbandonarTest
                    respondidas={respondidas}
                    onContinuar={() => setMostrarModal(false)}
                    onAbandonar={handleAbandonar}
                />
            )}

            {mostrarAlertExito && (
                <CustomAlert
                    type="success"
                    title="¡Test completado!"
                    logo={logo}
                    message="Has respondido todas las preguntas exitosamente. Haz clic en Aceptar para ver tus resultados."
                    onClose={handleCerrarAlertExito}
                />
            )}

            {/*<iframe
                ref={iframeRef}
                src="https://www.youtube.com/embed/MNM4D5CxJaU?autoplay=1&loop=1&playlist=MNM4D5CxJaU&controls=0&mute=1"
                allow="autoplay"
                style={{ display: "none" }}
                title="background-music"
            />
            <button className="mute-btn" onClick={toggleMute} title={muted ? "Activar música" : "Silenciar"}>
                {muted ? <IoVolumeMuteOutline size={20} /> : <IoMusicalNotesOutline size={20} />}
            </button>*/}

            {/* HEADER */}
            <div className="test-header">
                <div className="test-header-left">
                    <button className="test-back-btn" onClick={() => setMostrarModal(true)}>
                        <IoArrowBackCircleOutline size={18} /> Volver
                    </button>
                    <h1 className="test-header-title">
                        Test de estilos de <em>aprendizaje</em>
                    </h1>
                    <p className="test-header-subtitle">
                        Selecciona las opciones que mejor describan tu comportamiento habitual; puedes seleccionar más de una opción en cada pregunta.
                        No existen respuestas correctas o incorrectas.
                    </p>
                </div>
                <div className="test-header-right">
                    <div className="header-stat"><IoListOutline size={15} /> {respondidas}/{totalPreguntas} respondidas</div>
                    <div className="header-stat"><IoTimeOutline size={15} /> ~5 minutos</div>
                </div>
            </div>

            {/* BARRA DE PROGRESO */}
            <div className="test-progress-bar-wrapper">
                <div className="test-progress-track">
                    <div className="test-progress-fill" style={{ width: `${progreso}%` }} />
                </div>
                <span className="test-progress-label">{progreso}% completado</span>
            </div>

            {/* LAYOUT */}
            <div className="test-layout">
                <aside className="test-sidebar">
                    <div className="sidebar-label">Preguntas</div>
                    <nav className="test-sidebar-nav">
                        {PREGUNTAS.map((p, i) => {
                            const respondida = !!(respuestas[p.id]?.length > 0);
                            const esActual   = i === actual;
                            return (
                                <div
                                    key={p.id}
                                    className={`test-sidebar-item ${esActual ? "active" : ""} ${respondida ? "done" : ""}`}
                                    onClick={() => irA(i)}
                                >
                                    <div
                                        className="test-sidebar-num"
                                        style={respondida ? { background: SELECTED_BG, color: SELECTED_COLOR, borderColor: SELECTED_COLOR + "40" } : {}}
                                    >
                                        {respondida ? <IoCheckmarkOutline size={12} /> : i + 1}
                                    </div>
                                    <span className="test-sidebar-texto">
                                        {p.texto.length > 42 ? p.texto.slice(0, 42) + "…" : p.texto}
                                    </span>
                                </div>
                            );
                        })}
                    </nav>
                </aside>

                <main className="test-main" ref={mainRef}>
                    <div className="test-pregunta-header">
                        <span className="test-pregunta-num">Pregunta {actual + 1} de {totalPreguntas}</span>
                    </div>

                    <div className="test-card fade-in" key={actual}>
                        <div className="test-card-body">
                            <h2 className="test-pregunta-texto">{preguntaActual.texto}</h2>
                            <div className="test-opciones">
                                {preguntaActual.opciones.map((op, i) => {
                                    const seleccionada = seleccionActual.includes(i);
                                    return (
                                        <button
                                            key={i}
                                            className={`test-opcion ${seleccionada ? "selected" : ""}`}
                                            style={seleccionada ? { borderColor: SELECTED_COLOR, background: SELECTED_BG } : {}}
                                            onClick={() => seleccionar(i)}
                                        >
                                            <span
                                                className="test-opcion-letra"
                                                style={seleccionada ? { background: SELECTED_COLOR, color: "white", borderColor: SELECTED_COLOR } : {}}
                                            >
                                                {LETRAS[i]}
                                            </span>
                                            <span className="test-opcion-texto">{op.texto}</span>
                                            {seleccionada && (
                                                <IoCheckmarkOutline size={18} className="test-opcion-check" style={{ color: SELECTED_COLOR }} />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {errorEnvio && (
                        <div className="test-aviso" style={{ borderColor: "#e53e3e", background: "#fff5f5", color: "#c53030" }}>
                            ⚠️ {errorEnvio}
                        </div>
                    )}

                    <div className="test-nav-btns">
                        <button className="test-nav-btn secondary" onClick={anterior} disabled={actual === 0 || enviando}>
                            <IoArrowBackOutline size={16} /> Anterior
                        </button>

                        {actual < totalPreguntas - 1 ? (
                            <button className="test-nav-btn primary" onClick={siguiente} disabled={enviando}>
                                Siguiente <IoArrowForwardOutline size={16} />
                            </button>
                        ) : (
                            <button
                                className={`test-nav-btn submit ${todasRespondidas ? "ready" : ""}`}
                                onClick={todasRespondidas && !enviando ? enviar : null}
                                disabled={!todasRespondidas || enviando}
                                title={!todasRespondidas ? `Faltan ${totalPreguntas - respondidas} preguntas por responder` : ""}
                            >
                                {enviando ? <>Analizando... <span className="spinner" /></> : <>Ver resultados <IoArrowForwardOutline size={16} /></>}
                            </button>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
} 