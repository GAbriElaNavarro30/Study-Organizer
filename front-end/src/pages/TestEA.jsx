import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/testea.css";
import { ModalAbandonarTest } from "../components/ModalAbandonarTest";
import {
    IoVolumeMuteOutline,
    IoMusicalNotesOutline,
    IoCheckmarkOutline,
    IoArrowForwardOutline,
    IoArrowBackOutline,
    IoTimeOutline,
    IoListOutline,
    IoArrowBackCircleOutline,
} from "react-icons/io5";

// ─── DATOS ───────────────────────────────────────────────────────────────────

const PREGUNTAS = [
    {
        id: 1,
        texto: "¿Cómo prefieres recibir instrucciones para llegar a un lugar?",
        opciones: [
            { texto: "Veo un mapa o diagrama del recorrido", cat: "V" },
            { texto: "Alguien me lo explica verbalmente o escucho indicaciones", cat: "A" },
            { texto: "Leo las instrucciones escritas paso a paso", cat: "R" },
            { texto: "Recorro el camino yo mismo hasta aprenderlo", cat: "K" },
        ],
    },
    {
        id: 2,
        texto: "Cuando aprendes a usar un programa nuevo, ¿qué prefieres?",
        opciones: [
            { texto: "Ver tutoriales en video con capturas de pantalla", cat: "V" },
            { texto: "Escuchar a alguien explicarme cómo funciona", cat: "A" },
            { texto: "Leer el manual o la documentación del programa", cat: "R" },
            { texto: "Probarlo directamente y aprender con la práctica", cat: "K" },
        ],
    },
    {
        id: 3,
        texto: "Si tienes que recordar una lista de cosas, ¿qué haces?",
        opciones: [
            { texto: "Hago una lista visual o mapa mental con colores", cat: "V" },
            { texto: "Las repito en voz alta varias veces", cat: "A" },
            { texto: "Las escribo en un papel o cuaderno", cat: "R" },
            { texto: "Las asocio con acciones o movimientos que puedo hacer", cat: "K" },
        ],
    },
    {
        id: 4,
        texto: "¿Cómo prefieres que te expliquen un tema difícil?",
        opciones: [
            { texto: "Con gráficas, esquemas o imágenes ilustrativas", cat: "V" },
            { texto: "Con una explicación oral detallada o un podcast", cat: "A" },
            { texto: "Con textos, artículos o apuntes bien redactados", cat: "R" },
            { texto: "Con ejemplos prácticos y ejercicios que pueda realizar", cat: "K" },
        ],
    },
    {
        id: 5,
        texto: "Cuando estudias para un examen, ¿qué método usas más?",
        opciones: [
            { texto: "Reviso diagramas, mapas conceptuales y esquemas visuales", cat: "V" },
            { texto: "Escucho grabaciones de clase o explico en voz alta", cat: "A" },
            { texto: "Leo mis apuntes y resumo la información en texto", cat: "R" },
            { texto: "Hago ejercicios, resuelvo problemas o practico casos", cat: "K" },
        ],
    },
    {
        id: 6,
        texto: "Si tienes un problema, ¿cómo sueles resolverlo?",
        opciones: [
            { texto: "Visualizo el problema y busco patrones o diagramas", cat: "V" },
            { texto: "Lo hablo con alguien o lo pienso en voz alta", cat: "A" },
            { texto: "Investigo y leo sobre el tema antes de actuar", cat: "R" },
            { texto: "Lo intento directamente y aprendo del ensayo y error", cat: "K" },
        ],
    },
    {
        id: 7,
        texto: "¿Qué tipo de clases disfrutas más?",
        opciones: [
            { texto: "Las que usan imágenes, videos y presentaciones visuales", cat: "V" },
            { texto: "Las que incluyen debates, exposiciones o discusiones orales", cat: "A" },
            { texto: "Las que tienen lecturas, ensayos y materiales escritos", cat: "R" },
            { texto: "Las que tienen actividades prácticas, talleres o laboratorios", cat: "K" },
        ],
    },
    {
        id: 8,
        texto: "Cuando compras algo nuevo, ¿qué haces primero?",
        opciones: [
            { texto: "Reviso fotos, videos o imágenes del producto", cat: "V" },
            { texto: "Pregunto a alguien que ya lo haya usado o busco reseñas en audio", cat: "A" },
            { texto: "Leo las instrucciones o las especificaciones técnicas", cat: "R" },
            { texto: "Lo pruebo directamente para ver cómo funciona", cat: "K" },
        ],
    },
    {
        id: 9,
        texto: "¿Cómo prefieres que sea una presentación en clase?",
        opciones: [
            { texto: "Con muchas imágenes, gráficos y recursos visuales", cat: "V" },
            { texto: "Con una buena explicación oral y espacio para preguntas", cat: "A" },
            { texto: "Con diapositivas con texto claro y referencias para leer después", cat: "R" },
            { texto: "Con demostraciones en vivo y actividades para participar", cat: "K" },
        ],
    },
    {
        id: 10,
        texto: "Si tuvieras que enseñarle algo a alguien, ¿cómo lo harías?",
        opciones: [
            { texto: "Dibujando esquemas, mapas o imágenes explicativas", cat: "V" },
            { texto: "Explicándoselo en voz alta con ejemplos orales", cat: "A" },
            { texto: "Escribiendo un resumen o guía que pueda leer", cat: "R" },
            { texto: "Haciéndolo practicar directamente con ejercicios", cat: "K" },
        ],
    },
    {
        id: 11,
        texto: "Cuando visitas un lugar nuevo, ¿cómo lo recuerdas mejor?",
        opciones: [
            { texto: "Por las imágenes y el aspecto visual del lugar", cat: "V" },
            { texto: "Por los sonidos, conversaciones o música del ambiente", cat: "A" },
            { texto: "Por el nombre del lugar y detalles que anoté", cat: "R" },
            { texto: "Por las sensaciones y experiencias que viví ahí", cat: "K" },
        ],
    },
    {
        id: 12,
        texto: "¿Qué te ayuda más a concentrarte al estudiar?",
        opciones: [
            { texto: "Tener un espacio ordenado con colores y organización visual", cat: "V" },
            { texto: "Escuchar música suave o estar en un ambiente con sonido controlado", cat: "A" },
            { texto: "Tener mis apuntes bien organizados y leer en silencio", cat: "R" },
            { texto: "Cambiar de postura, caminar o tomar descansos activos", cat: "K" },
        ],
    },
    {
        id: 13,
        texto: "Cuando algo no te queda claro, ¿qué haces?",
        opciones: [
            { texto: "Busco un video o imagen que lo explique visualmente", cat: "V" },
            { texto: "Le pido a alguien que me lo explique con sus palabras", cat: "A" },
            { texto: "Busco más textos, artículos o apuntes sobre el tema", cat: "R" },
            { texto: "Intento aplicarlo en un ejemplo práctico hasta entenderlo", cat: "K" },
        ],
    },
    {
        id: 14,
        texto: "¿Cómo prefieres recibir retroalimentación de un trabajo?",
        opciones: [
            { texto: "Con anotaciones visuales, gráficas o subrayados en el documento", cat: "V" },
            { texto: "En una conversación donde me expliquen verbalmente", cat: "A" },
            { texto: "Con comentarios escritos detallados en mi trabajo", cat: "R" },
            { texto: "Con una demostración de cómo mejorar lo que hice", cat: "K" },
        ],
    },
    {
        id: 15,
        texto: "Al planificar tus actividades, ¿cómo lo haces?",
        opciones: [
            { texto: "Uso un calendario visual, tablero o mapa de actividades", cat: "V" },
            { texto: "Me digo a mí mismo o comento con alguien mis planes del día", cat: "A" },
            { texto: "Escribo una lista detallada de tareas en papel o app de notas", cat: "R" },
            { texto: "Simplemente empiezo a hacer las cosas más urgentes", cat: "K" },
        ],
    },
    {
        id: 16,
        texto: "¿Qué tipo de material de estudio prefieres?",
        opciones: [
            { texto: "Infografías, mapas mentales y material con muchas imágenes", cat: "V" },
            { texto: "Podcasts, audiolibros o videos con buena explicación oral", cat: "A" },
            { texto: "Libros, artículos, apuntes y resúmenes escritos", cat: "R" },
            { texto: "Guías de ejercicios, casos prácticos y simulaciones", cat: "K" },
        ],
    },
];

const SELECTED_COLOR = "#1C5A90";
const SELECTED_BG = "#E0EEF9";
const LETRAS = ["A", "B", "C", "D"];

// ─── COMPONENTE ───────────────────────────────────────────────────────────────

export function TestEA() {
    const navigate = useNavigate();
    const [respuestas, setRespuestas] = useState({});
    const [actual, setActual] = useState(0);
    const [muted, setMuted] = useState(true);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [errorEnvio, setErrorEnvio] = useState(null);
    const iframeRef = useRef(null);
    const mainRef = useRef(null);

    const totalPreguntas = PREGUNTAS.length;
    const respondidas = Object.keys(respuestas).length;
    const progreso = Math.round((respondidas / totalPreguntas) * 100);
    const preguntaActual = PREGUNTAS[actual];
    const seleccionActual = respuestas[preguntaActual.id];

    // ── Música ──
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

    // ── Seleccionar opción ──
    const seleccionar = (opcionIndex) => {
        setRespuestas((prev) => ({ ...prev, [preguntaActual.id]: opcionIndex }));
    };

    // ── Navegar ──
    const irA = (index) => {
        setActual(index);
        mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    };

    const siguiente = () => { if (actual < totalPreguntas - 1) irA(actual + 1); };
    const anterior = () => { if (actual > 0) irA(actual - 1); };

    // ── Enviar al backend ──
    const enviar = async () => {
        setEnviando(true);
        setErrorEnvio(null);

        try {
            const respuestasArray = PREGUNTAS.map((pregunta) => {
                const opcionIndex = respuestas[pregunta.id];
                const opcion = pregunta.opciones[opcionIndex];
                return {
                    id_pregunta: pregunta.id,
                    id_opcion: opcionIndex + 1,
                    categoria: opcion.cat,
                };
            });

            // ✅ POST a /responder, no GET a /resultado
            const response = await fetch("http://localhost:3000/estilosaprendizaje/responder", {
                method: "POST",                          // ✅ POST
                headers: { "Content-Type": "application/json" },
                credentials: "include",                  // ✅ envía la cookie
                body: JSON.stringify({ respuestas: respuestasArray }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Error al procesar el test");
            }

            const resultado = await response.json();
            navigate("/resultados-test-estilos-aprendizaje", { state: resultado });

        } catch (err) {
            setErrorEnvio(err.message || "Ocurrió un error al enviar el test. Intenta de nuevo.");
        } finally {
            setEnviando(false);
        }
    };

    // ── Abandonar ──
    const handleAbandonar = () => {
        setMostrarModal(false);
        navigate(-1);
    };

    const todasRespondidas = respondidas === totalPreguntas;

    return (
        <div className="test-app">
            {mostrarModal && (
                <ModalAbandonarTest
                    respondidas={respondidas}
                    onContinuar={() => setMostrarModal(false)}
                    onAbandonar={handleAbandonar}
                />
            )}

            <iframe
                ref={iframeRef}
                src="https://www.youtube.com/embed/MNM4D5CxJaU?autoplay=1&loop=1&playlist=MNM4D5CxJaU&controls=0&mute=1"
                allow="autoplay"
                style={{ display: "none" }}
                title="background-music"
            />
            <button className="mute-btn" onClick={toggleMute} title={muted ? "Activar música" : "Silenciar"}>
                {muted ? <IoVolumeMuteOutline size={20} /> : <IoMusicalNotesOutline size={20} />}
            </button>

            {/* ── HEADER ── */}
            <div className="test-header">
                <div className="test-header-left">
                    <button className="test-back-btn" onClick={() => setMostrarModal(true)}>
                        <IoArrowBackCircleOutline size={18} />
                        Volver
                    </button>
                    <h1 className="test-header-title">
                        Test de estilos de <em>aprendizaje</em>
                    </h1>
                    <p className="test-header-subtitle">
                        Selecciona la opción que mejor describa tu comportamiento habitual. No hay respuestas correctas o incorrectas.
                    </p>
                </div>
                <div className="test-header-right">
                    <div className="header-stat"><IoListOutline size={15} /> {respondidas}/{totalPreguntas} respondidas</div>
                    <div className="header-stat"><IoTimeOutline size={15} /> ~5 minutos</div>
                </div>
            </div>

            {/* ── BARRA DE PROGRESO ── */}
            <div className="test-progress-bar-wrapper">
                <div className="test-progress-track">
                    <div className="test-progress-fill" style={{ width: `${progreso}%` }} />
                </div>
                <span className="test-progress-label">{progreso}% completado</span>
            </div>

            {/* ── LAYOUT ── */}
            <div className="test-layout">
                <aside className="test-sidebar">
                    <div className="sidebar-label">Preguntas</div>
                    <nav className="test-sidebar-nav">
                        {PREGUNTAS.map((p, i) => {
                            const respondida = respuestas[p.id] !== undefined;
                            const esActual = i === actual;
                            return (
                                <div
                                    key={p.id}
                                    className={`test-sidebar-item ${esActual ? "active" : ""} ${respondida ? "done" : ""}`}
                                    onClick={() => irA(i)}
                                >
                                    <div
                                        className="test-sidebar-num"
                                        style={respondida
                                            ? { background: SELECTED_BG, color: SELECTED_COLOR, borderColor: SELECTED_COLOR + "40" }
                                            : {}
                                        }
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
                                    const seleccionada = seleccionActual === i;
                                    return (
                                        <button
                                            key={i}
                                            className={`test-opcion ${seleccionada ? "selected" : ""}`}
                                            style={seleccionada
                                                ? { borderColor: SELECTED_COLOR, background: SELECTED_BG }
                                                : {}
                                            }
                                            onClick={() => seleccionar(i)}
                                        >
                                            <span
                                                className="test-opcion-letra"
                                                style={seleccionada
                                                    ? { background: SELECTED_COLOR, color: "white", borderColor: SELECTED_COLOR }
                                                    : {}
                                                }
                                            >
                                                {LETRAS[i]}
                                            </span>
                                            <span className="test-opcion-texto">{op.texto}</span>
                                            {seleccionada && (
                                                <IoCheckmarkOutline
                                                    size={18}
                                                    className="test-opcion-check"
                                                    style={{ color: SELECTED_COLOR }}
                                                />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Error de envío */}
                    {errorEnvio && (
                        <div className="test-aviso" style={{ borderColor: "#e53e3e", background: "#fff5f5", color: "#c53030" }}>
                            ⚠️ {errorEnvio}
                        </div>
                    )}

                    {/* Navegación */}
                    <div className="test-nav-btns">
                        <button
                            className="test-nav-btn secondary"
                            onClick={anterior}
                            disabled={actual === 0 || enviando}
                        >
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
                                {enviando ? (
                                    <>Analizando... <span className="spinner" /></>
                                ) : (
                                    <>Ver resultados <IoArrowForwardOutline size={16} /></>
                                )}
                            </button>
                        )}
                    </div>


                </main>
            </div>
        </div>
    );
}