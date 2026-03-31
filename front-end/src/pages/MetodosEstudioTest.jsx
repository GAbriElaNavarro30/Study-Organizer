// src/pages/MetodosEstudio/MetodosEstudioTest.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import {
  IoCheckmarkOutline, IoArrowForwardOutline, IoArrowBackOutline,
  IoTimeOutline, IoListOutline, IoArrowBackCircleOutline,
  IoVolumeMuteOutline, IoMusicalNotesOutline,
  IoAlertCircleOutline,
} from "react-icons/io5";
import "../styles/metodos-estudio-test.css";
import { ModalAbandonarTest } from "../components/ModalAbandonarTest";
import { CustomAlert } from "../components/CustomAlert";
import logo from "../assets/imagenes/logotipo.png";

export function MetodosEstudioTest() {
  const navigate = useNavigate();

  const [dimensiones, setDimensiones] = useState([]);
  const [dimActual, setDimActual] = useState(0);
  const [respuestas, setRespuestas] = useState({});
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [muted, setMuted] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarAlertExito, setMostrarAlertExito] = useState(false);

  const iframeRef = useRef(null);
  const mainRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    cargarTest();
  }, []);

  const cargarTest = async () => {
    try {
      const { data } = await api.get("/metodosestudio/preguntas");
      setDimensiones(data.dimensiones);
    } catch {
      setError("No se pudo cargar el test. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  const toggleMute = () => {
    setMuted((prev) => {
      const next = !prev;
      if (iframeRef.current) {
        const base = "https://www.youtube.com/embed/MNM4D5CxJaU?autoplay=1&loop=1&playlist=MNM4D5CxJaU&controls=0";
        iframeRef.current.src = next ? base + "&mute=1" : base + "&mute=0";
      }
      return next;
    });
  };

  /**
   * Toggle selection:
   * - Si la opción ya está seleccionada → desmarcar (elimina la key)
   * - Si es diferente → seleccionar la nueva (solo 1 a la vez)
   */
  const seleccionarRespuesta = (id_pregunta, opcion) => {
    setRespuestas(prev => {
      const actual = prev[id_pregunta];
      // Mismo id_opcion → deseleccionar
      if (actual?.id_opcion === opcion.id_opcion) {
        const { [id_pregunta]: _, ...resto } = prev;
        return resto;
      }
      // Distinto → reemplazar (solo 1 selección por pregunta)
      return { ...prev, [id_pregunta]: opcion };
    });
  };

  const dimCompleta = (dim) =>
    dim?.preguntas?.every(p => respuestas[p.id_pregunta]);

  const totalRespondidas = Object.keys(respuestas).length;
  const totalPreguntas = dimensiones.reduce((a, d) => a + d.preguntas.length, 0);
  const progreso = totalPreguntas > 0
    ? Math.round((totalRespondidas / totalPreguntas) * 100)
    : 0;

  const irA = (index) => {
    setDimActual(index);
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [datosResultado, setDatosResultado] = useState(null);

  const enviarTest = async () => {
    if (totalRespondidas !== totalPreguntas) {
      setError("Debes responder todas las preguntas antes de continuar.");
      return;
    }
    setEnviando(true);
    setError(null);
    try {
      const todasPreguntas = dimensiones.flatMap(d => d.preguntas);
      const payload = todasPreguntas.map(p => {
        const r = respuestas[p.id_pregunta];
        return {
          id_pregunta: p.id_pregunta,
          id_opcion: r.id_opcion,
          id_dimension: p.id_dimension,
          valor: r.valor,
          es_negativa: p.es_negativa,
        };
      });
      const { data } = await api.post("/metodosestudio/guardar-respuestas", { respuestas: payload });
      setDatosResultado(data);         // guarda los datos
      setMostrarAlertExito(true);      // muestra el alert
    } catch (err) {
      setError(err.response?.data?.error || "Error al enviar el test.");
    } finally {
      setEnviando(false);
    }
  };

  const handleAlertAceptar = () => {
    setMostrarAlertExito(false);
    navigate("/resultado-metodos-estudio", { state: datosResultado });
  };

  /* ── LOADING ── */
  if (cargando) {
    return (
      <div className="met-loading">
        <div className="met-loading-icon"><IoListOutline size={52} /></div>
        <p className="met-loading-text">Cargando test...</p>
        <div className="met-loading-dots"><span /><span /><span /></div>
      </div>
    );
  }

  const dim = dimensiones[dimActual];
  const preguntasRestantes =
    dim?.preguntas?.filter(p => !respuestas[p.id_pregunta]).length || 0;

  const handleAbandonar = () => {
    setMostrarModal(false);
    navigate("/metodos-estudio");
  };
  return (
    <div className="met-app">

      {/* ── Modal abandonar ── */}
      {mostrarModal && (
        <ModalAbandonarTest
          respondidas={totalRespondidas}
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
          onClose={handleAlertAceptar}
        />
      )}

      {/* ── Música de fondo ── */}
      {/*<iframe
        ref={iframeRef}
        src="https://www.youtube.com/embed/MNM4D5CxJaU?autoplay=1&loop=1&playlist=MNM4D5CxJaU&controls=0&mute=1"
        allow="autoplay"
        style={{ display: "none" }}
        title="background-music"
      />
      <button
        className="met-mute-btn"
        onClick={toggleMute}
        title={muted ? "Activar música" : "Silenciar"}
      >
        {muted ? <IoVolumeMuteOutline size={20} /> : <IoMusicalNotesOutline size={20} />}
      </button>*/}

      {/* ── HEADER ── */}
      <div className="met-header">
        <div className="met-header-left">
          <button className="met-back-btn" onClick={() => setMostrarModal(true)}>
            <IoArrowBackCircleOutline size={17} /> Volver
          </button>
          <h1 className="met-header-title">
            Test de <em>Métodos de Estudio</em>
          </h1>
          <p className="met-header-subtitle">
            Selecciona la opción que mejor describa tu comportamiento habitual.
            No existen respuestas correctas o incorrectas.
            <br />
            Solo puedes seleccionar una opción por pregunta.
          </p>
        </div>
        <div className="met-header-right">
          <div className="met-header-stat">
            <IoListOutline size={15} /> {totalRespondidas}/{totalPreguntas} respondidas
          </div>
          <div className="met-header-stat">
            <IoTimeOutline size={15} /> ~10–15 minutos
          </div>
        </div>
      </div>

      {/* ── BARRA DE PROGRESO ── */}
      <div className="met-progress-wrapper">
        <div className="met-progress-track">
          <div className="met-progress-fill" style={{ width: `${progreso}%` }} />
        </div>
        <span className="met-progress-label">{progreso}% completado</span>
      </div>

      {/* ── LAYOUT ── */}
      <div className="met-layout">

        {/* SIDEBAR */}
        <aside className="met-sidebar">
          <div className="met-sidebar-label">Dimensiones</div>
          <nav className="met-sidebar-nav">
            {dimensiones.map((d, i) => {
              const completada = dimCompleta(d);
              const esActual = i === dimActual;
              return (
                <div
                  key={d.id_dimension}
                  className={`met-sidebar-item ${esActual ? "active" : ""} ${completada ? "done" : ""}`}
                  onClick={() => irA(i)}
                >
                  <div className="met-sidebar-num">
                    {completada ? <IoCheckmarkOutline size={11} /> : i + 1}
                  </div>
                  <span className="met-sidebar-texto">
                    {d.nombre_dimension.length > 30
                      ? d.nombre_dimension.slice(0, 30) + "…"
                      : d.nombre_dimension}
                  </span>
                </div>
              );
            })}
          </nav>
        </aside>

        {/* MAIN */}
        <main className="met-main" ref={mainRef}>

          <div className="met-pregunta-header">
            <span className="met-dim-num-label">
              Dimensión {dimActual + 1} de {dimensiones.length}
            </span>
            {preguntasRestantes > 0 && (
              <span className="met-pending">
                {preguntasRestantes} sin responder
              </span>
            )}
          </div>

          <div className="met-card fade-in" key={dimActual}>
            <div className="met-card-body">
              <h2 className="met-dim-title">{dim?.nombre_dimension}</h2>

              <div className="met-preguntas-list">
                {dim?.preguntas?.map((p, pi) => {
                  const seleccionada = respuestas[p.id_pregunta];
                  return (
                    <div
                      key={p.id_pregunta}
                      className={`met-pregunta-card ${seleccionada ? "respondida" : ""}`}
                    >
                      <div className="met-pregunta-top">
                        <span className="met-pregunta-num">{pi + 1}</span>
                        <p className="met-pregunta-texto">{p.texto_pregunta}</p>
                        {/*p.es_negativa && (
                          <span className="met-negativa-badge">¡Atención!</span>
                        )*/}
                      </div>

                      <div className="met-opciones">
                        {p.opciones.map(op => {
                          const isSelected = seleccionada?.id_opcion === op.id_opcion;
                          return (
                            <button
                              key={op.id_opcion}
                              className={`met-opcion ${isSelected ? "selected" : ""}`}
                              onClick={() =>
                                seleccionarRespuesta(p.id_pregunta, {
                                  id_opcion: op.id_opcion,
                                  valor: op.valor,
                                })
                              }
                              /* aria accesibilidad */
                              aria-pressed={isSelected}
                            >
                              <span className="met-opcion-circle" />
                              <span className="met-opcion-texto">{op.categoria}</span>
                              {isSelected && (
                                <IoCheckmarkOutline size={14} className="met-opcion-check" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {error && (
            <div className="met-error-msg">
              <IoAlertCircleOutline size={16} /> {error}
            </div>
          )}

          {/* Botones de navegación */}
          <div className="met-nav-btns">
            <button
              className="met-nav-btn met-secondary"
              disabled={dimActual === 0}
              onClick={() => irA(dimActual - 1)}
            >
              <IoArrowBackOutline size={15} /> Anterior
            </button>

            {dimActual < dimensiones.length - 1 ? (
              <button
                className="met-nav-btn met-primary"
                onClick={() => irA(dimActual + 1)}
              >
                Siguiente <IoArrowForwardOutline size={15} />
              </button>
            ) : (
              <button
                className={`met-nav-btn met-submit ${totalRespondidas === totalPreguntas ? "ready" : ""
                  }`}
                onClick={
                  totalRespondidas === totalPreguntas && !enviando
                    ? enviarTest
                    : undefined
                }
                disabled={totalRespondidas !== totalPreguntas || enviando}
                title={
                  totalRespondidas !== totalPreguntas
                    ? `Faltan ${totalPreguntas - totalRespondidas} preguntas`
                    : ""
                }
              >
                {enviando ? (
                  <>Analizando... <span className="met-spinner" /></>
                ) : (
                  <>Ver resultados <IoArrowForwardOutline size={15} /></>
                )}
              </button>
            )}
          </div>

        </main>
      </div>
    </div>
  );
}