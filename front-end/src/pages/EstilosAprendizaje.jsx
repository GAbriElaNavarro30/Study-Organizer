import { useState, useRef } from "react";
import "../styles/estilosaprendizaje.css";
import {
    IoListOutline,
    IoTimeOutline,
    IoFlashOutline,
    IoAnalyticsOutline,
    IoEyeOutline,
    IoHeadsetOutline,
    IoBookOutline,
    IoHandLeftOutline,
    IoBarChartOutline,
    IoBulbOutline,
    IoArrowForwardOutline,
    IoArrowBackOutline,
    IoCheckmarkCircleOutline,
    IoRefreshOutline,
    IoVolumeMuteOutline,
    IoMusicalNotesOutline,
    IoCheckmarkOutline,
} from "react-icons/io5";

const VARK_DATA = {
    V: {
        name: "Visual",
        icon: IoEyeOutline,
        desc: "Aprenden mejor a través de imágenes, diagramas, mapas, colores y representaciones visuales. Prefieren ver la información organizada espacialmente.",
        barColor: "#4A90C4",
    },
    A: {
        name: "Auditivo",
        icon: IoHeadsetOutline,
        desc: "Aprenden mejor escuchando explicaciones, discusiones, conferencias y debates. La comunicación verbal es su canal preferido de comprensión.",
        barColor: "#5A8FB8",
    },
    R: {
        name: "Lectura/Escritura",
        icon: IoBookOutline,
        desc: "Aprenden mejor leyendo y escribiendo texto. Prefieren notas, listas, manuales, libros y ensayos como medios de aprendizaje.",
        barColor: "#4A9E70",
    },
    K: {
        name: "Kinestésico",
        icon: IoHandLeftOutline,
        desc: "Aprenden mejor a través de experiencias prácticas, ejemplos concretos, simulaciones y aprendizaje en contextos reales.",
        barColor: "#B8842A",
    },
};

const QUESTIONS = [
    {
        text: "Cuando aprendes algo nuevo, prefieres...",
        options: [
            { text: "Ver diagramas, gráficos o esquemas visuales que expliquen el concepto.", type: "V" },
            { text: "Escuchar a alguien explicarlo verbalmente o en una clase.", type: "A" },
            { text: "Leer sobre el tema en libros, artículos o apuntes detallados.", type: "R" },
            { text: "Intentarlo tú mismo con ejemplos prácticos o experimentos.", type: "K" },
        ],
    },
    {
        text: "Cuando necesitas recordar una dirección nueva, ¿qué haces?",
        options: [
            { text: "Visualizo un mapa mental del trayecto en mi cabeza.", type: "V" },
            { text: "Repito las instrucciones en voz alta varias veces.", type: "A" },
            { text: "Las escribo en papel o en mi teléfono.", type: "R" },
            { text: "Simplemente lo recorro una vez y lo recuerdo por experiencia.", type: "K" },
        ],
    },
    {
        text: "Durante una presentación, lo que más te ayuda a entender es...",
        options: [
            { text: "Las diapositivas con colores, imágenes e ilustraciones.", type: "V" },
            { text: "La voz y las explicaciones verbales del presentador.", type: "A" },
            { text: "El material escrito que puedo leer y subrayar.", type: "R" },
            { text: "Las demostraciones prácticas o ejemplos de la vida real.", type: "K" },
        ],
    },
    {
        text: "Si debes explicarle algo complejo a alguien, ¿cómo lo harías?",
        options: [
            { text: "Dibujo un esquema o diagrama para que lo visualice.", type: "V" },
            { text: "Se lo explico hablando con metáforas y ejemplos verbales.", type: "A" },
            { text: "Le paso un resumen escrito o una lista de pasos.", type: "R" },
            { text: "Le pido que lo intente conmigo paso a paso de forma práctica.", type: "K" },
        ],
    },
    {
        text: "Cuando estudias para un examen, tu método más efectivo es...",
        options: [
            { text: "Crear mapas mentales, tablas o usar colores para organizar la info.", type: "V" },
            { text: "Escuchar grabaciones, podcasts o leer en voz alta.", type: "A" },
            { text: "Escribir resúmenes, repasar apuntes y hacer fichas.", type: "R" },
            { text: "Practicar con ejercicios, casos reales o simulacros.", type: "K" },
        ],
    },
    {
        text: "¿Qué tipo de libro o contenido disfrutas más?",
        options: [
            { text: "Libros con ilustraciones, infografías y diseño visual.", type: "V" },
            { text: "Audiolibros, podcasts o contenido en formato audio.", type: "A" },
            { text: "Novelas, ensayos o artículos extensos bien escritos.", type: "R" },
            { text: "Manuales prácticos, tutoriales o guías paso a paso.", type: "K" },
        ],
    },
    {
        text: "Cuando algo no funciona (un aparato, una tarea), tu reacción es...",
        options: [
            { text: "Busco un diagrama o esquema visual que explique cómo funciona.", type: "V" },
            { text: "Llamo a alguien para que me lo explique o busco un video.", type: "A" },
            { text: "Leo el manual de instrucciones detalladamente.", type: "R" },
            { text: "Pruebo diferentes soluciones hasta encontrar la que funciona.", type: "K" },
        ],
    },
    {
        text: "En clase, te concentras mejor cuando...",
        options: [
            { text: "El profesor usa pizarrón, proyecciones e imágenes.", type: "V" },
            { text: "El profesor explica con detalle y hay debate en clase.", type: "A" },
            { text: "Hay material escrito o puedo tomar apuntes detallados.", type: "R" },
            { text: "Hay actividades prácticas, laboratorios o proyectos.", type: "K" },
        ],
    },
    {
        text: "Cuando ves un nuevo software o app, ¿cómo aprendes a usarlo?",
        options: [
            { text: "Exploro visualmente la interfaz y los íconos.", type: "V" },
            { text: "Veo un tutorial en video con explicación verbal.", type: "A" },
            { text: "Leo la documentación o guía del usuario.", type: "R" },
            { text: "Lo uso directamente y aprendo sobre la marcha.", type: "K" },
        ],
    },
    {
        text: "Al recordar una experiencia pasada, ¿qué recuerdas más vívidamente?",
        options: [
            { text: "Las imágenes, colores y cómo se veía el lugar.", type: "V" },
            { text: "Las conversaciones y sonidos de ese momento.", type: "A" },
            { text: "Lo que escribí o leí en ese momento (notas, mensajes).", type: "R" },
            { text: "Cómo me sentí físicamente y lo que hice con mis manos.", type: "K" },
        ],
    },
    {
        text: "Para planear un viaje, prefieres...",
        options: [
            { text: "Buscar fotos del destino y hacer un mapa visual del recorrido.", type: "V" },
            { text: "Hablar con alguien que ya fue o ver vlogs del lugar.", type: "A" },
            { text: "Leer blogs de viaje, guías y reseñas detalladas.", type: "R" },
            { text: "Hacer la maleta y descubrir el destino al llegar.", type: "K" },
        ],
    },
    {
        text: "Si tuvieras que aprender un nuevo idioma, elegiría...",
        options: [
            { text: "Tarjetas con imágenes asociadas a palabras y tablas visuales.", type: "V" },
            { text: "Escuchar canciones, series y hablar con nativos constantemente.", type: "A" },
            { text: "Leer gramática, vocabulario y estudiar reglas escritas.", type: "R" },
            { text: "Irme al país e inmergirme totalmente en la cultura.", type: "K" },
        ],
    },
];

const DESCRIPTIONS = {
    V: "Eres un aprendiz Visual. Procesas mejor la información cuando se presenta de forma gráfica y espacial. Los mapas mentales, diagramas, colores y esquemas son tus mejores aliados. Te ayuda mucho organizar visualmente tus notas y usar recursos multimedia.",
    A: "Eres un aprendiz Auditivo. Tu mente procesa y retiene mejor la información que escuchas. Las discusiones en clase, los audiolibros, los podcasts y explicar en voz alta lo que estudias te beneficia enormemente.",
    R: "Eres un aprendiz de Lectura/Escritura. Tienes una afinidad especial con el texto escrito. Leer, tomar apuntes detallados, hacer resúmenes y reescribir información son las estrategias más efectivas para ti.",
    K: "Eres un aprendiz Kinestésico. Aprendes mejor haciendo. La práctica directa, los laboratorios, los proyectos reales y los ejemplos concretos de la vida cotidiana son los que más anclan el conocimiento en ti.",
};

const RECOMMENDATIONS = {
    V: ["Usa mapas mentales y diagramas de flujo para organizar ideas.", "Resalta tus apuntes con colores y símbolos visuales.", "Convierte textos en esquemas o tablas.", "Usa aplicaciones visuales como Notion, MindMeister o Canva."],
    A: ["Grábate explicando los temas y escúchalo después.", "Participa activamente en debates y discusiones de grupo.", "Usa audiolibros y podcasts educativos.", "Lee en voz alta cuando estudies conceptos difíciles."],
    R: ["Escribe resúmenes detallados después de cada clase.", "Crea fichas con definiciones y conceptos clave.", "Lee bibliografía complementaria sobre los temas.", "Convierte diagramas en texto escrito propio."],
    K: ["Busca prácticas, laboratorios o simulaciones del tema.", "Aplica lo aprendido en proyectos o problemas reales.", "Aprende con ejemplos del mundo cotidiano.", "Estudia moviéndote: camina mientras repasas o usa objetos físicos."],
};

const NAV_SECTIONS = ["¿Qué son los estilos?", "El Modelo VARK", "Historia", "Las 4 modalidades", "Sobre el test"];

export function EstilosAprendizaje() {
    const [phase, setPhase] = useState("info");
    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState({});
    const [results, setResults] = useState(null);
    const [muted, setMuted] = useState(true);
    const [activeSection, setActiveSection] = useState(0);
    const iframeRef = useRef(null);

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

    const handleSelect = (type) => setAnswers((prev) => ({ ...prev, [current]: type }));

    const handleNext = () => {
        if (current < QUESTIONS.length - 1) setCurrent((c) => c + 1);
        else calculateResults();
    };

    const handlePrev = () => { if (current > 0) setCurrent((c) => c - 1); };

    const calculateResults = () => {
        const scores = { V: 0, A: 0, R: 0, K: 0 };
        Object.values(answers).forEach((t) => { if (t) scores[t]++; });
        const dominant = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
        setResults({ scores, dominant });
        setPhase("results");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const restart = () => {
        setPhase("info");
        setCurrent(0);
        setAnswers({});
        setResults(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const progress = ((current + (answers[current] ? 1 : 0)) / QUESTIONS.length) * 100;

    return (
        <div className="vark-app">
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

            {/* HEADER */}
            <div className="header">
                <div className="header-left">
                    <h1 className="header-title">
                        Descubre tu estilo de <em>aprendizaje</em>
                    </h1>
                    <p className="header-subtitle">
                        Conoce cómo tu mente procesa mejor la información y optimiza tu forma de estudiar con el modelo VARK.
                    </p>
                </div>
                <div className="header-right">
                    <div className="header-stat"><IoListOutline size={15} /> 12 preguntas</div>
                    <div className="header-stat"><IoTimeOutline size={15} /> ~5 minutos</div>
                    <div className="header-stat"><IoAnalyticsOutline size={15} /> Modelo VARK</div>
                </div>
            </div>

            {/* ─── INFO PHASE ─── */}
            {phase === "info" && (
                <div className="info-layout fade-in">
                    {/* SIDEBAR */}
                    <aside className="info-sidebar">
                        <div className="sidebar-label">Contenido</div>
                        <nav className="sidebar-nav">
                            {NAV_SECTIONS.map((s, i) => (
                                <div
                                    key={i}
                                    className={`sidebar-nav-item ${activeSection === i ? "active" : ""}`}
                                    onClick={() => setActiveSection(i)}
                                >
                                    <span className="sidebar-nav-dot" />
                                    {s}
                                </div>
                            ))}
                        </nav>

                        <div className="sidebar-divider" />

                        <div className="sidebar-label">Modalidades</div>
                        <div className="sidebar-vark-pills">
                            {Object.entries(VARK_DATA).map(([key, val]) => {
                                const Icon = val.icon;
                                return (
                                    <div key={key} className="sidebar-vark-pill">
                                        <span className="sidebar-vark-pill-letter" style={{ color: val.barColor }}>{key}</span>
                                        <Icon size={14} style={{ color: val.barColor }} />
                                        <span style={{ fontSize: 12, color: "#7A8090" }}>{val.name}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </aside>

                    {/* MAIN CONTENT */}
                    <main className="info-main">
                        <div className="info-banner">
                            <div className="info-chip"><IoListOutline size={16} /><span>12 preguntas</span></div>
                            <div className="info-chip"><IoTimeOutline size={16} /><span>~5 minutos</span></div>
                            <div className="info-chip"><IoFlashOutline size={16} /><span>Resultados inmediatos</span></div>
                            <div className="info-chip"><IoAnalyticsOutline size={16} /><span>Modelo VARK</span></div>
                        </div>

                        {/* Card 1: Imagen lateral derecha */}
                        <div className="card" onClick={() => setActiveSection(0)}>
                            <div className="card-inner">
                                <div className="card-body">
                                    <div className="card-tag">Fundamentos</div>
                                    <h2 className="card-title">¿Qué son los estilos de aprendizaje?</h2>
                                    <p className="card-text">
                                        Los <strong>estilos de aprendizaje</strong> son las formas preferidas mediante las cuales cada persona percibe, procesa, almacena y recupera la información. No se trata de una capacidad fija, sino de una preferencia natural que puede variar según el contexto.
                                    </p>
                                    <br />
                                    <p className="card-text">
                                        Comprender tu estilo te permite <strong>seleccionar estrategias de estudio más efectivas</strong>, reducir el esfuerzo invertido y aumentar significativamente la retención y comprensión de nuevos conocimientos.
                                    </p>
                                    <div className="tooltip-text" style={{ marginTop: 20 }}>
                                        <IoBulbOutline size={16} />
                                        <span>Adaptar los métodos de enseñanza al estilo preferido puede mejorar el rendimiento académico hasta en un 30%.</span>
                                    </div>
                                </div>
                                <div className="card-image-side">
                                    <img src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80" alt="Estudiante aprendiendo" />
                                    <div className="card-image-side-overlay" />
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Imagen lateral izquierda */}
                        <div className="card" onClick={() => setActiveSection(1)}>
                            <div className="card-inner reverse">
                                <div className="card-image-side">
                                    <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80" alt="Personas colaborando" />
                                    <div className="card-image-side-overlay" />
                                </div>
                                <div className="card-body">
                                    <div className="card-tag">El Modelo</div>
                                    <h2 className="card-title">¿Qué es el Modelo VARK?</h2>
                                    <p className="card-text">
                                        El modelo <strong>VARK</strong> (Visual, Auditivo, Lectura/Escritura y Kinestésico) es un cuestionario de preferencias de aprendizaje diseñado para ayudar a estudiantes y educadores a identificar cómo prefieren recibir y procesar nueva información.
                                    </p>
                                    <br />
                                    <p className="card-text">
                                        Es uno de los instrumentos más utilizados en contextos educativos a nivel mundial, reconocido por su simplicidad, claridad y aplicabilidad práctica en cualquier entorno de formación.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Card 3: Historia */}
                        <div className="card" onClick={() => setActiveSection(2)}>
                            <div className="card-body" style={{ padding: "40px" }}>
                                <div className="card-tag">Historia</div>
                                <h2 className="card-title">¿Quién lo creó?</h2>
                                <p className="card-text">
                                    El modelo VARK fue desarrollado en <strong>1987</strong> por el educador neozelandés <strong>Neil D. Fleming</strong>, junto con Colleen Mills. Fleming lo introdujo como herramienta para ayudar a los docentes a entender mejor cómo aprenden sus alumnos y diseñar experiencias educativas más inclusivas y efectivas.
                                </p>
                                <div className="author-card">
                                    <div className="author-avatar">N</div>
                                    <div className="author-info">
                                        <h4>Neil D. Fleming</h4>
                                        <p>Educador e investigador neozelandés. Desarrolló el cuestionario VARK en la Universidad de Lincoln, Nueva Zelanda. Su trabajo ha influido en millones de educadores y estudiantes alrededor del mundo.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Card 4: Las 4 modalidades - grid ocupa todo el ancho */}
                        <div className="card" onClick={() => setActiveSection(3)}>
                            <div className="card-body" style={{ padding: "40px" }}>
                                <div className="card-tag">Clasificación</div>
                                <h2 className="card-title">Las cuatro modalidades VARK</h2>
                                <p className="card-text" style={{ marginBottom: "24px" }}>
                                    El modelo clasifica las preferencias en cuatro grandes categorías, cada una con características y estrategias propias:
                                </p>
                                <div className="vark-grid">
                                    {Object.entries(VARK_DATA).map(([key, val]) => {
                                        const Icon = val.icon;
                                        return (
                                            <div key={key} className={`vark-card vark-${key.toLowerCase()}`}>
                                                <div className="vark-emoji"><Icon size={28} /></div>
                                                <div className="vark-letter">{key}</div>
                                                <div className="vark-name">{val.name}</div>
                                                <p className="vark-desc">{val.desc}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Card 5: Sobre el test */}
                        <div className="card" onClick={() => setActiveSection(4)}>
                            <div className="card-inner">
                                <div className="card-body">
                                    <div className="card-tag">Sobre el Test</div>
                                    <h2 className="card-title">¿Cómo funciona esta evaluación?</h2>
                                    <p className="card-text">
                                        Este test consta de <strong>12 preguntas</strong> de opción múltiple, cada una con cuatro alternativas que corresponden a las modalidades V, A, R y K. No existen respuestas correctas o incorrectas; elige siempre la opción que refleje más tu comportamiento habitual.
                                    </p>
                                    <br />
                                    <p className="card-text">
                                        Al finalizar, el sistema calculará tu <strong>perfil de preferencias</strong> mostrando la distribución de tus respuestas y destacando tu estilo dominante, junto con una descripción personalizada y recomendaciones adaptadas a ti.
                                    </p>
                                    <div className="tooltip-text" style={{ marginTop: 16 }}>
                                        <IoBarChartOutline size={16} />
                                        <span>Los resultados mostrarán un gráfico de barras con la puntuación obtenida en cada una de las cuatro categorías (V, A, R, K).</span>
                                    </div>
                                    <button
                                        className="start-btn"
                                        onClick={(e) => { e.stopPropagation(); setPhase("quiz"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                                    >
                                        Comenzar evaluación <IoArrowForwardOutline size={16} />
                                    </button>
                                </div>
                                <div className="card-image-side">
                                    <img src="https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=600&q=80" alt="Persona estudiando" />
                                    <div className="card-image-side-overlay" />
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            )}

            {/* ─── QUIZ PHASE ─── */}
            {phase === "quiz" && (
                <div className="quiz-section">
                    {/* SIDEBAR con lista de preguntas */}
                    <aside className="quiz-sidebar">
                        <div className="quiz-sidebar-label">Preguntas</div>
                        {QUESTIONS.map((_, i) => (
                            <div
                                key={i}
                                className={`quiz-q-dot ${i === current ? "current" : answers[i] ? "answered" : ""}`}
                            >
                                <div className="quiz-q-dot-circle">
                                    {answers[i] ? <IoCheckmarkOutline size={11} /> : i + 1}
                                </div>
                                <span style={{ fontSize: 11, lineHeight: 1.4 }}>
                                    {QUESTIONS[i].text.length > 38
                                        ? QUESTIONS[i].text.slice(0, 38) + "…"
                                        : QUESTIONS[i].text}
                                </span>
                            </div>
                        ))}
                    </aside>

                    {/* MAIN */}
                    <div className="quiz-main">
                        <div className="progress-wrap">
                            <div className="progress-header">
                                <span className="progress-label">Progreso</span>
                                <span className="progress-num">{current + 1} / {QUESTIONS.length}</span>
                            </div>
                            <div className="progress-bar-bg">
                                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                            </div>
                        </div>

                        <div className="question-card">
                            <div className="q-number">Pregunta {current + 1} de {QUESTIONS.length}</div>
                            <p className="q-text">{QUESTIONS[current].text}</p>
                            <div className="options-list">
                                {QUESTIONS[current].options.map((opt, i) => (
                                    <button
                                        key={i}
                                        className={`option-btn ${answers[current] === opt.type ? "selected" : ""}`}
                                        onClick={() => handleSelect(opt.type)}
                                    >
                                        <span className="option-letter">{["A", "B", "C", "D"][i]}</span>
                                        <span>{opt.text}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="nav-row">
                                <button className="nav-btn" onClick={handlePrev} disabled={current === 0}>
                                    <IoArrowBackOutline size={16} /> Anterior
                                </button>
                                <button className="nav-btn primary" onClick={handleNext} disabled={!answers[current]}>
                                    {current === QUESTIONS.length - 1 ? (
                                        <><IoCheckmarkCircleOutline size={16} /> Ver resultados</>
                                    ) : (
                                        <>Siguiente <IoArrowForwardOutline size={16} /></>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── RESULTS PHASE ─── */}
            {phase === "results" && results && (
                <div className="results-section">
                    {/* MAIN izquierda */}
                    <div className="results-main">
                        <div className="results-hero">
                            <div className="results-title">Tu estilo de aprendizaje</div>
                            <div className="results-style">
                                <em>{VARK_DATA[results.dominant].name}</em>
                            </div>
                            <div className="results-badge">
                                {results.dominant} — Perfil Dominante
                            </div>
                            <p className="results-desc">{DESCRIPTIONS[results.dominant]}</p>
                        </div>

                        {/* Gráfico barras */}
                        <div className="scores-grid">
                            {Object.entries(results.scores).map(([key, val]) => {
                                const pct = Math.round((val / QUESTIONS.length) * 100);
                                const varkInfo = VARK_DATA[key];
                                return (
                                    <div key={key} className="score-bar-card">
                                        <div className="score-letter-big" style={{ color: varkInfo.barColor }}>{key}</div>
                                        <div className="score-bar-wrap">
                                            <div
                                                className="score-bar-inner"
                                                style={{ height: `${pct}%`, background: varkInfo.barColor }}
                                            />
                                        </div>
                                        <div className="score-val">{val} pts</div>
                                        <div className="score-name">{varkInfo.name}</div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="card">
                            <div className="card-body" style={{ padding: "36px" }}>
                                <div className="card-tag">Perfil completo</div>
                                <h2 className="card-title">Distribución de tus preferencias</h2>
                                <p className="card-text">
                                    Recuerda que un buen aprendiz combina múltiples estrategias. Aunque tengas una preferencia dominante, explorar las técnicas de otras modalidades puede enriquecer aún más tu proceso de aprendizaje y hacerte más versátil en distintos contextos académicos y profesionales.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ASIDE derecha */}
                    <aside className="results-aside">
                        <div className="aside-card">
                            <div className="aside-card-title">Estrategias recomendadas</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
                                {RECOMMENDATIONS[results.dominant].map((rec, i) => (
                                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                                        <div style={{
                                            width: 20, height: 20, borderRadius: "50%",
                                            background: "#D6E8F5", display: "flex", alignItems: "center",
                                            justifyContent: "center", flexShrink: 0, marginTop: 1
                                        }}>
                                            <IoCheckmarkOutline size={11} color="#4A90C4" />
                                        </div>
                                        <span style={{ fontSize: 13, lineHeight: 1.6, color: "#7A8090", fontWeight: 300 }}>{rec}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="aside-card">
                            <div className="aside-card-title">Otras modalidades</div>
                            {Object.entries(VARK_DATA)
                                .filter(([k]) => k !== results.dominant)
                                .map(([key, val]) => {
                                    const Icon = val.icon;
                                    return (
                                        <div key={key} style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 12 }}>
                                            <Icon size={16} style={{ color: val.barColor, flexShrink: 0 }} />
                                            <div>
                                                <div style={{ fontSize: 12, fontWeight: 600, color: "#2E3440", letterSpacing: "0.5px" }}>{val.name}</div>
                                                <div style={{ fontSize: 12, color: "#B0B8C4" }}>{results.scores[key]} pts</div>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>

                        <button className="restart-btn" onClick={restart}>
                            <IoRefreshOutline size={16} /> Realizar el test nuevamente
                        </button>
                    </aside>
                </div>
            )}
        </div>
    );
}