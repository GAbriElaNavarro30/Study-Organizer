import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/resultadosTestEA.css";
import {
    IoEyeOutline,
    IoHeadsetOutline,
    IoBookOutline,
    IoHandLeftOutline,
    IoAnalyticsOutline,
    IoBulbOutline,
    IoBarChartOutline,
    IoArrowBackOutline,
    IoRefreshOutline,
    IoHomeOutline,
    IoCheckmarkCircleOutline,
    IoStarOutline,
    IoRibbonOutline,
    IoTrophyOutline,
} from "react-icons/io5";

// ─── CONFIGURACIÓN POR PERFIL ─────────────────────────────────────────────────

const PERFIL_CONFIG = {
    V: {
        nombre: "Visual",
        Icon: IoEyeOutline,
        color: "#1C5A90",
        colorLight: "#D6E8F5",
        colorMid: "#3A7CB8",
        cssKey: "v",
        descripcion:
            "Aprendes mejor cuando la información se presenta de forma visual. Los diagramas, mapas mentales, colores e imágenes son tus mejores aliados para comprender y retener conceptos.",
    },
    A: {
        nombre: "Auditivo",
        Icon: IoHeadsetOutline,
        color: "#3A6A8C",
        colorLight: "#D0E3F5",
        colorMid: "#5A8FB8",
        cssKey: "a",
        descripcion:
            "Procesas mejor la información a través del sonido y el habla. Las explicaciones orales, debates y escuchar contenido te permite conectar y recordar ideas con facilidad.",
    },
    R: {
        nombre: "Lector / Escritor",
        Icon: IoBookOutline,
        color: "#1E6A42",
        colorLight: "#C8E8CE",
        colorMid: "#3D8A5E",
        cssKey: "r",
        descripcion:
            "Tu fortaleza está en el texto. Leer, tomar notas y escribir resúmenes son tus herramientas naturales para organizar y profundizar en cualquier tema.",
    },
    K: {
        nombre: "Kinestésico",
        Icon: IoHandLeftOutline,
        color: "#7A4A0A",
        colorLight: "#EDD8B0",
        colorMid: "#A06C1A",
        cssKey: "k",
        descripcion:
            "Aprendes con la experiencia directa. La práctica, los ejercicios reales y el movimiento te permiten comprender conceptos de forma profunda y duradera.",
    },
};

const NOMBRES_PERFILES = {
    V: "Visual",
    A: "Auditivo",
    R: "Lector / Escritor",
    K: "Kinestésico",
    VA: "Visual — Auditivo",
    VR: "Visual — Lector",
    VK: "Visual — Kinestésico",
    AR: "Auditivo — Lector",
    AK: "Auditivo — Kinestésico",
    KR: "Kinestésico — Lector",
    VAR: "Visual · Auditivo · Lector",
    VAK: "Visual · Auditivo · Kinestésico",
    VRK: "Visual · Lector · Kinestésico",
    ARK: "Auditivo · Lector · Kinestésico",
    VARK: "Multimodal",
};

const NAV_SECTIONS = [
    { label: "Tu perfil", id: "sec-perfil" },
    { label: "Puntajes", id: "sec-puntajes" },
    { label: "Desglose", id: "sec-desglose" },
    { label: "Recomendaciones", id: "sec-recomendaciones" },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getLetras(perfil) {
    return perfil.split("").filter((l) => ["V", "A", "R", "K"].includes(l));
}

function getPrimary(letras) {
    return PERFIL_CONFIG[letras[0]] || PERFIL_CONFIG["V"];
}

// ─── BARRA ────────────────────────────────────────────────────────────────────

function BarraSimple({ cfg, value, animado }) {
    const pct = Math.round((value / 16) * 100);
    return (
        <div className="res-bar-row">
            <div className="res-bar-label">
                <cfg.Icon size={14} style={{ color: cfg.colorMid, flexShrink: 0 }} />
                <span>{cfg.nombre}</span>
            </div>
            <div className="res-bar-track">
                <div
                    className="res-bar-fill"
                    style={{
                        width: animado ? `${pct}%` : "0%",
                        background: `linear-gradient(90deg, ${cfg.colorMid}, ${cfg.color})`,
                    }}
                />
            </div>
            <span className="res-bar-value">
                {value}<span className="res-bar-den">/16</span>
            </span>
        </div>
    );
}

// ─── RADAR ────────────────────────────────────────────────────────────────────

function RadarChart({ puntajes, primaryColor }) {
    const size = 260;
    const cx = size / 2;
    const cy = size / 2;
    const r = 88;

    const datos = [
        { label: "Visual", key: "v", angle: -90 },
        { label: "Auditivo", key: "a", angle: 0 },
        { label: "Kinestésico", key: "k", angle: 90 },
        { label: "Lector", key: "r", angle: 180 },
    ];

    const getPoint = (angle, radius) => {
        const rad = (angle * Math.PI) / 180;
        return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
    };

    const userPoints = datos.map(({ key, angle }) =>
        getPoint(angle, ((puntajes[key] || 0) / 16) * r)
    );
    const poly = userPoints.map((p) => `${p.x},${p.y}`).join(" ");

    return (
        <svg width={size} height={size} className="res-radar">
            {[0.25, 0.5, 0.75, 1].map((lvl) => (
                <circle key={lvl} cx={cx} cy={cy} r={r * lvl}
                    fill="none" stroke="rgba(74,144,196,0.15)" strokeWidth="1" />
            ))}
            {datos.map(({ angle }) => {
                const p = getPoint(angle, r);
                return <line key={angle} x1={cx} y1={cy} x2={p.x} y2={p.y}
                    stroke="rgba(74,144,196,0.2)" strokeWidth="1" />;
            })}
            <polygon points={poly} fill={`${primaryColor}22`} stroke={primaryColor} strokeWidth="2" />
            {userPoints.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={4} fill={primaryColor} />
            ))}
            {datos.map(({ label, angle }) => {
                const p = getPoint(angle, r + 20);
                return (
                    <text key={label} x={p.x} y={p.y} textAnchor="middle"
                        dominantBaseline="middle" fontSize="11" fill="#4A5568"
                        fontFamily="'DM Sans', sans-serif">
                        {label}
                    </text>
                );
            })}
        </svg>
    );
}

// ─── LOADING ──────────────────────────────────────────────────────────────────

function LoadingState() {
    return (
        <div className="res-loading">
            <div className="res-loading-icon"><IoAnalyticsOutline size={52} /></div>
            <p className="res-loading-text">Analizando tus respuestas...</p>
            <div className="res-loading-dots"><span /><span /><span /></div>
        </div>
    );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

export function ResultadosTestEA() {
    const location = useLocation();
    const navigate = useNavigate();
    const [datos, setDatos] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [animado, setAnimado] = useState(false);
    const [activeSection, setActiveSection] = useState(0);

    // ── Cargar datos ──
    useEffect(() => {
        if (location.state?.perfil_dominante) {
            setDatos(location.state);
            setCargando(false);
            setTimeout(() => setAnimado(true), 120);
            return;
        }
        const cargar = async () => {
            try {
                const res = await fetch("http://localhost:3000/estilosaprendizaje/resultado", {
                    credentials: "include",
                });
                if (!res.ok) throw new Error();
                const json = await res.json();
                const r = json.resultado;
                setDatos({
                    perfil_dominante: r.perfil_dominante,
                    puntajes: { v: r.puntaje_v, a: r.puntaje_a, r: r.puntaje_r, k: r.puntaje_k },
                    recomendaciones: [],
                });
            } catch {
                setDatos(null);
            } finally {
                setCargando(false);
                setTimeout(() => setAnimado(true), 120);
            }
        };
        cargar();
    }, [location.state]);

    // ── Observer para nav activo ──
    useEffect(() => {
        if (!animado) return;
        const observers = [];
        NAV_SECTIONS.forEach((s, i) => {
            const el = document.getElementById(s.id);
            if (!el) return;
            const obs = new IntersectionObserver(
                (entries) => { entries.forEach((e) => { if (e.isIntersecting) setActiveSection(i); }); },
                { rootMargin: "-10% 0px -55% 0px", threshold: 0 }
            );
            obs.observe(el);
            observers.push(obs);
        });
        return () => observers.forEach((o) => o.disconnect());
    }, [animado]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const irA = (i) => {
        setActiveSection(i);
        document.getElementById(NAV_SECTIONS[i].id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    if (cargando) return <LoadingState />;

    if (!datos) {
        return (
            <div className="res-app">
                <div className="res-empty">
                    <IoBarChartOutline size={56} className="res-empty-icon" />
                    <h2 className="res-empty-title">Sin resultados aún</h2>
                    <p className="res-empty-sub">Aún no has realizado el test de estilos de aprendizaje.</p>
                    <button className="res-start-btn" onClick={() => navigate("/test-estilos-aprendizaje")}>
                        Realizar el test
                    </button>
                </div>
            </div>
        );
    }

    const { perfil_dominante, puntajes, recomendaciones } = datos;
    const letras = getLetras(perfil_dominante);
    const primary = getPrimary(letras);
    const nombrePerfil = NOMBRES_PERFILES[perfil_dominante] || "Multimodal";
    const esMultimodal = perfil_dominante === "VARK";
    const tieneRecs = recomendaciones && recomendaciones.length > 0;
    const navVisible = tieneRecs ? NAV_SECTIONS : NAV_SECTIONS.filter(s => s.id !== "sec-recomendaciones");

    return (
        <div className={`res-app ${animado ? "res-animated" : ""}`}>

            {/* ── HEADER ── */}
            <div className="res-header">
                <div className="res-header-left">
                    <button className="res-back-btn" onClick={() => navigate("/estilos-aprendizaje")}>
                        <IoArrowBackOutline size={14} /> Volver
                    </button>
                    <h1 className="res-header-title">
                        Tu estilo de <em>aprendizaje</em>
                    </h1>
                    <p className="res-header-subtitle">
                        Basado en tus 16 respuestas, el sistema experto determinó tu perfil de aprendizaje dominante.
                    </p>
                </div>
                <div className="res-header-right">
                    <div className="res-header-stat"><IoRibbonOutline size={14} /> Perfil identificado</div>
                    <div className="res-header-stat"><IoAnalyticsOutline size={14} /> Modelo VARK</div>
                    <div className="res-header-stat"><IoBulbOutline size={14} /> Sistema experto</div>
                </div>
            </div>

            {/* ── LAYOUT ── */}
            <div className="res-layout">

                {/* SIDEBAR */}
                <aside className="res-sidebar">
                    <div className="res-sidebar-label">Contenido</div>
                    <nav className="res-sidebar-nav">
                        {navVisible.map((s, i) => (
                            <div
                                key={i}
                                className={`res-sidebar-item ${activeSection === i ? "active" : ""}`}
                                onClick={() => irA(i)}
                            >
                                <span className="res-sidebar-dot" />
                                {s.label}
                            </div>
                        ))}
                    </nav>

                    <div className="res-sidebar-divider" />

                    <div className="res-sidebar-label">Perfil</div>
                    <div className="res-sidebar-pills">
                        {letras.map((l) => {
                            const cfg = PERFIL_CONFIG[l];
                            return (
                                <div key={l} className="res-sidebar-pill">
                                    <span className="res-pill-letter" style={{ color: cfg.colorMid }}>{l}</span>
                                    <cfg.Icon size={13} style={{ color: cfg.colorMid }} />
                                    <span className="res-pill-name">{cfg.nombre}</span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="res-sidebar-divider" />

                    <div className="res-sidebar-actions">
                        <button className="res-action-btn" onClick={() => navigate("/test-estilos-aprendizaje")}>
                            <IoRefreshOutline size={13} /> Repetir test
                        </button>
                        <button className="res-action-btn res-action-btn--ghost" onClick={() => navigate("/estilos-aprendizaje")}>
                            <IoHomeOutline size={13} /> Inicio
                        </button>
                    </div>
                </aside>

                {/* MAIN */}
                <main className="res-main">

                    {/* CHIPS */}
                    <div className="res-banner">
                        {letras.map((l) => {
                            const cfg = PERFIL_CONFIG[l];
                            return (
                                <div key={l} className="res-chip">
                                    <cfg.Icon size={14} style={{ color: cfg.colorMid }} />
                                    <span>{cfg.nombre}</span>
                                </div>
                            );
                        })}
                        {esMultimodal && (
                            <div className="res-chip">
                                <IoTrophyOutline size={14} style={{ color: "#A06C1A" }} /> Multimodal
                            </div>
                        )}
                    </div>

                    {/* ── TU PERFIL ── */}
                    <div id="sec-perfil" className="res-card">
                        <div className="res-card-inner">
                            <div className="res-card-body">
                                <div className="res-card-tag">
                                    <IoRibbonOutline size={11} /> Tu perfil dominante
                                </div>
                                <h2 className="res-card-title">{nombrePerfil}</h2>

                                {esMultimodal && (
                                    <p className="res-card-text">
                                        Tienes la capacidad de adaptarte a <strong>múltiples estilos</strong>. Puedes sacar provecho de casi cualquier método de enseñanza, combinando estrategias según el contexto.
                                    </p>
                                )}

                                <div className="res-perfil-grid">
                                    {letras.map((l) => {
                                        const cfg = PERFIL_CONFIG[l];
                                        return (
                                            <div key={l} className={`res-perfil-card res-perfil-${cfg.cssKey}`}>
                                                <div className="res-perfil-top">
                                                    <cfg.Icon size={24} />
                                                    <span className="res-perfil-letter">{l}</span>
                                                    <span className="res-perfil-nombre">{cfg.nombre}</span>
                                                </div>
                                                <p className="res-perfil-desc">{cfg.descripcion}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="res-card-deco">
                                {letras.map((l) => (
                                    <span key={l} className="res-deco-letter"
                                        style={{ color: PERFIL_CONFIG[l].colorMid }}>
                                        {l}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── PUNTAJES ── */}
                    <div id="sec-puntajes" className="res-card">
                        <div className="res-card-body" style={{ padding: "40px" }}>
                            <div className="res-card-tag">
                                <IoBarChartOutline size={11} /> Puntajes por dimensión
                            </div>
                            <h2 className="res-card-title">Distribución de tus respuestas</h2>
                            <p className="res-card-text" style={{ marginBottom: 28 }}>
                                Cada barra muestra cuántas de las 16 preguntas respondiste para esa modalidad.
                            </p>

                            <div className="res-charts-grid">
                                <div className="res-chart-box">
                                    <div className="res-chart-label">
                                        <IoBarChartOutline size={13} /> Comparativa
                                    </div>
                                    <div className="res-barchart">
                                        {["V", "A", "R", "K"].map((l) => (
                                            <BarraSimple
                                                key={l}
                                                cfg={PERFIL_CONFIG[l]}
                                                value={puntajes[l.toLowerCase()]}
                                                animado={animado}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="res-chart-box res-chart-box--radar">
                                    <div className="res-chart-label">
                                        <IoAnalyticsOutline size={13} /> Perfil radial
                                    </div>
                                    <RadarChart puntajes={puntajes} primaryColor={primary.colorMid} />
                                </div>
                            </div>

                            <div className="res-tooltip">
                                <IoBulbOutline size={14} />
                                <span>
                                    Las dimensiones dominantes ({letras.join(", ")}) son aquellas con mayor puntaje relativo según las reglas del sistema experto.
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ── DESGLOSE ── */}
                    <div id="sec-desglose" className="res-card">
                        <div className="res-card-body" style={{ padding: "40px" }}>
                            <div className="res-card-tag">
                                <IoStarOutline size={11} /> Desglose detallado
                            </div>
                            <h2 className="res-card-title">Las cuatro dimensiones</h2>
                            <p className="res-card-text" style={{ marginBottom: 28 }}>
                                Tu puntaje exacto en cada modalidad del modelo VARK:
                            </p>

                            <div className="res-score-grid">
                                {["V", "A", "R", "K"].map((l) => {
                                    const cfg = PERFIL_CONFIG[l];
                                    const val = puntajes[l.toLowerCase()];
                                    const isDom = letras.includes(l);
                                    return (
                                        <div key={l}
                                            className={`res-score-card res-score-${cfg.cssKey} ${isDom ? "dominant" : ""}`}>
                                            {isDom && (
                                                <div className="res-score-badge" style={{ background: cfg.colorMid }}>
                                                    <IoCheckmarkCircleOutline size={10} /> Dominante
                                                </div>
                                            )}
                                            <cfg.Icon size={26} className="res-score-icon" />
                                            <div className="res-score-letter" style={{ color: cfg.colorMid }}>{l}</div>
                                            <div className="res-score-nombre">{cfg.nombre}</div>
                                            <div className="res-score-num" style={{ color: cfg.color }}>
                                                {val}<span className="res-score-den">/16</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* ── RECOMENDACIONES ── */}
                    {tieneRecs && (
                        <div id="sec-recomendaciones" className="res-card">
                            <div className="res-card-body" style={{ padding: "40px" }}>
                                <div className="res-card-tag">
                                    <IoBulbOutline size={11} /> Recomendaciones personalizadas
                                </div>
                                <h2 className="res-card-title">Estrategias para tu perfil</h2>
                                <p className="res-card-text" style={{ marginBottom: 28 }}>
                                    El sistema experto generó estas recomendaciones basadas en tu perfil <strong>{nombrePerfil}</strong>:
                                </p>
                                <div className="res-recs">
                                    {recomendaciones.map((rec, i) => (
                                        <div key={i} className="res-rec-item"
                                            style={{ "--rec-color": primary.colorMid }}>
                                            <span className="res-rec-num"
                                                style={{ background: primary.colorMid }}>{i + 1}</span>
                                            <span className="res-rec-text">{rec}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── CTA ── */}
                    <div className="res-cta-wrapper">
                        <button className="res-start-btn"
                            onClick={() => navigate("/test-estilos-aprendizaje")}>
                            <IoRefreshOutline size={15} /> Repetir el test
                        </button>
                        <button className="res-start-btn res-start-btn--outline"
                            onClick={() => navigate("/estilos-aprendizaje")}>
                            <IoHomeOutline size={15} /> Ir al inicio
                        </button>
                    </div>

                </main>
            </div>
        </div>
    );
}