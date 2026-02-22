import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
    IoVolumeMuteOutline,
    IoMusicalNotesOutline,
} from "react-icons/io5";

import neilFleming from "../assets/imagenes/neil-fleming.jpg";
import { ResultadoPrevio } from "../components/Resultadoprevio";

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

const NAV_SECTIONS = [
    { label: "¿Qué son los estilos?", id: "seccion-fundamentos" },
    { label: "El Modelo VARK",        id: "seccion-modelo" },
    { label: "Historia",              id: "seccion-historia" },
    { label: "Las 4 modalidades",     id: "seccion-modalidades" },
    { label: "Sobre el test",         id: "seccion-test" },
];

export function EstilosAprendizaje() {
    const [phase, setPhase] = useState("info");
    const [muted, setMuted] = useState(true);
    const [activeSection, setActiveSection] = useState(0);
    const iframeRef = useRef(null);
    const scrollingRef = useRef(false);
    const mobileNavRef = useRef(null);
    const navigate = useNavigate();

    // ─── INTERSECTION OBSERVER ───
    useEffect(() => {
        if (phase !== "info") return;
        const observers = [];

        NAV_SECTIONS.forEach((section, index) => {
            const el = document.getElementById(section.id);
            if (!el) return;

            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting && !scrollingRef.current) {
                            setActiveSection(index);
                            scrollMobileNavToIndex(index);
                        }
                    });
                },
                { rootMargin: "-15% 0px -55% 0px", threshold: 0 }
            );

            observer.observe(el);
            observers.push(observer);
        });

        return () => observers.forEach((obs) => obs.disconnect());
    }, [phase]);

    const scrollMobileNavToIndex = (index) => {
        if (!mobileNavRef.current) return;
        const navEl = mobileNavRef.current;
        const items = navEl.querySelectorAll(".mobile-nav-item");
        if (items[index]) {
            const item = items[index];
            navEl.scrollTo({
                left: item.offsetLeft - navEl.offsetWidth / 2 + item.offsetWidth / 2,
                behavior: "smooth",
            });
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

    const irASeccion = (index) => {
        scrollingRef.current = true;
        setActiveSection(index);
        scrollMobileNavToIndex(index);
        const el = document.getElementById(NAV_SECTIONS[index].id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        setTimeout(() => { scrollingRef.current = false; }, 900);
    };

    const iniciarTest = () => {
        navigate("/test-estilos-aprendizaje");
    };

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
                    <div className="header-stat"><IoListOutline size={15} /> 16 preguntas</div>
                    <div className="header-stat"><IoTimeOutline size={15} /> ~5 minutos</div>
                    <div className="header-stat"><IoAnalyticsOutline size={15} /> Modelo VARK</div>
                </div>
            </div>

            {/* NAV HORIZONTAL MÓVIL */}
            {phase === "info" && (
                <nav className="mobile-nav" ref={mobileNavRef}>
                    {NAV_SECTIONS.map((s, i) => (
                        <button
                            key={i}
                            className={`mobile-nav-item ${activeSection === i ? "active" : ""}`}
                            onClick={() => irASeccion(i)}
                        >
                            {s.label}
                        </button>
                    ))}
                </nav>
            )}

            {/* INFO PHASE */}
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
                                    onClick={() => irASeccion(i)}
                                >
                                    <span className="sidebar-nav-dot" />
                                    {s.label}
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
                                        <span style={{ fontSize: 12, color: "#4A5568" }}>{val.name}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </aside>

                    {/* MAIN CONTENT */}
                    <main className="info-main">
                        <div className="info-banner">
                            <div className="info-chip"><IoListOutline size={16} /><span>16 preguntas</span></div>
                            <div className="info-chip"><IoTimeOutline size={16} /><span>~5 minutos</span></div>
                            <div className="info-chip"><IoFlashOutline size={16} /><span>Resultados inmediatos</span></div>
                            <div className="info-chip"><IoAnalyticsOutline size={16} /><span>Modelo VARK</span></div>
                        </div>

                        {/* SECCIÓN: FUNDAMENTOS */}
                        <div id="seccion-fundamentos" className="card">
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

                        {/* SECCIÓN: MODELO */}
                        <div id="seccion-modelo" className="card">
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

                        {/* SECCIÓN: HISTORIA */}
                        <div id="seccion-historia" className="card">
                            <div className="card-body" style={{ padding: "40px" }}>
                                <div className="card-tag">Historia</div>
                                <h2 className="card-title">¿Quién lo creó?</h2>
                                <p className="card-text">
                                    El modelo VARK fue desarrollado en <strong>1987</strong> por el educador neozelandés <strong>Neil D. Fleming</strong>, junto con Colleen Mills. Fleming lo introdujo como herramienta para ayudar a los docentes a entender mejor cómo aprenden sus alumnos y diseñar experiencias educativas más inclusivas y efectivas.
                                </p>
                                <div className="author-card">
                                    <div className="author-avatar">
                                        <img
                                            src={neilFleming}
                                            alt="Neil D. Fleming"
                                            onError={(e) => {
                                                e.target.style.display = "none";
                                                e.target.parentElement.textContent = "N";
                                            }}
                                        />
                                    </div>
                                    <div className="author-info">
                                        <h4>Neil D. Fleming</h4>
                                        <p>Educador e investigador neozelandés. Desarrolló el cuestionario VARK en la Universidad de Lincoln, Nueva Zelanda. Su trabajo ha influido en millones de educadores y estudiantes alrededor del mundo.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN: MODALIDADES */}
                        <div id="seccion-modalidades" className="card">
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

                        {/* SECCIÓN: SOBRE EL TEST */}
                        <div id="seccion-test" className="card">
                            <div className="card-inner">
                                <div className="card-body">
                                    <div className="card-tag">Sobre el Test</div>
                                    <h2 className="card-title">¿Cómo funciona esta evaluación?</h2>
                                    <p className="card-text">
                                        Este test consta de <strong>16 preguntas</strong> de opción múltiple, cada una con cuatro alternativas que corresponden a las modalidades V, A, R y K. No existen respuestas correctas o incorrectas; elige siempre la opción que refleje más tu comportamiento habitual.
                                    </p>
                                    <br />
                                    <p className="card-text">
                                        Al finalizar, el sistema calculará tu <strong>perfil de preferencias</strong> mostrando la distribución de tus respuestas y destacando tu estilo dominante, junto con una descripción personalizada y recomendaciones adaptadas a ti.
                                    </p>
                                    <div className="tooltip-text" style={{ marginTop: 16 }}>
                                        <IoBarChartOutline size={16} />
                                        <span>Los resultados mostrarán un gráfico de barras con la puntuación obtenida en cada una de las cuatro categorías (V, A, R, K).</span>
                                    </div>

                                    {/* ── Bloque resultado previo ── */}
                                    <ResultadoPrevio />

                                </div>
                                <div className="card-image-side">
                                    <img src="https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=600&q=80" alt="Persona estudiando" />
                                    <div className="card-image-side-overlay" />
                                </div>
                            </div>
                        </div>

                        {/* BOTÓN COMENZAR */}
                        <div className="start-btn-wrapper">
                            <button className="start-btn" onClick={iniciarTest}>
                                Comenzar evaluación <IoArrowForwardOutline size={16} />
                            </button>
                        </div>

                    </main>
                </div>
            )}
        </div>
    );
}