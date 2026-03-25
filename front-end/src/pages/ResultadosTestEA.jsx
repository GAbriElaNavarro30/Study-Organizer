import "../styles/resultadosTestEA.css";
import {
    IoAnalyticsOutline, IoBulbOutline, IoBarChartOutline, IoArrowBackOutline,
    IoRefreshOutline, IoHomeOutline, IoCheckmarkCircleOutline,
    IoStarOutline, IoRibbonOutline, IoTrophyOutline, IoTimeOutline,
    IoCalendarOutline,
} from "react-icons/io5";
import {
    useResultadosTestEA,
    PERFIL_CONFIG,
    NOMBRES_PERFILES,
    NAV_SECTIONS,
} from "../hooks/useResultadosTestEA";

// ─── HELPER FECHA ─────────────────────────────────────────────────────────────

function formatearFecha(fechaISO) {
    if (!fechaISO) return "—";
    const d = new Date(fechaISO);
    return d.toLocaleDateString("es-MX", {
        day: "2-digit", month: "short", year: "numeric",
    }) + " · " + d.toLocaleTimeString("es-MX", {
        hour: "2-digit", minute: "2-digit",
    });
}

// ─── BARRA ────────────────────────────────────────────────────────────────────

function BarraSimple({ cfg, value, pct, animado }) {
    return (
        <div className="res-bar-row">
            <div className="res-bar-label">
                <cfg.Icon size={14} style={{ color: cfg.colorMid, flexShrink: 0 }} />
                <span>{cfg.nombre}</span>
            </div>
            <div className="res-bar-track">
                <div className="res-bar-fill"
                    style={{ width: animado ? `${pct}%` : "0%", background: `linear-gradient(90deg, ${cfg.colorMid}, ${cfg.color})` }}
                />
            </div>
            <span className="res-bar-value">{value} <span className="res-bar-den">({pct}%)</span></span>
        </div>
    );
}

// ─── RADAR ────────────────────────────────────────────────────────────────────

function RadarChart({ puntajes, primaryColor }) {
    const size = 260, cx = size / 2, cy = size / 2, r = 88;
    const datos = [
        { label: "Visual",      key: "v", angle: -90 },
        { label: "Auditivo",    key: "a", angle: 0   },
        { label: "Kinestésico", key: "k", angle: 90  },
        { label: "Lector",      key: "r", angle: 180 },
    ];
    const getPoint = (angle, radius) => {
        const rad = (angle * Math.PI) / 180;
        return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
    };
    const userPoints = datos.map(({ key, angle }) => getPoint(angle, ((puntajes[key] || 0) / 16) * r));
    const poly = userPoints.map((p) => `${p.x},${p.y}`).join(" ");
    return (
        <svg width={size} height={size} className="res-radar">
            {[0.25, 0.5, 0.75, 1].map((lvl) => (
                <circle key={lvl} cx={cx} cy={cy} r={r * lvl} fill="none" stroke="rgba(74,144,196,0.15)" strokeWidth="1" />
            ))}
            {datos.map(({ angle }) => {
                const p = getPoint(angle, r);
                return <line key={angle} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(74,144,196,0.2)" strokeWidth="1" />;
            })}
            <polygon points={poly} fill={`${primaryColor}22`} stroke={primaryColor} strokeWidth="2" />
            {userPoints.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={4} fill={primaryColor} />)}
            {datos.map(({ label, angle }) => {
                const p = getPoint(angle, r + 20);
                return <text key={label} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="#4A5568" fontFamily="'DM Sans', sans-serif">{label}</text>;
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
    const {
        // Estado
        datos,
        cargando,
        animado,
        activeSection,
        historial,
        cargandoHistorial,

        // Derivados
        perfil_dominante,
        puntajes,
        porcentajes,
        recomendaciones,
        letras,
        primary,
        nombrePerfil,
        esMultimodal,
        tieneRecs,
        navVisible,

        // Navegación
        navigate,
        irA,
    } = useResultadosTestEA();

    if (cargando) return <LoadingState />;

    if (!datos) {
        return (
            <div className="res-app">
                <div className="res-empty">
                    <IoBarChartOutline size={56} className="res-empty-icon" />
                    <h2 className="res-empty-title">Sin resultados aún</h2>
                    <p className="res-empty-sub">Aún no has realizado el test de estilos de aprendizaje.</p>
                    <button className="res-start-btn" onClick={() => navigate("/test-estilos-aprendizaje")}>Realizar el test</button>
                </div>
            </div>
        );
    }

    return (
        <div className={`res-app ${animado ? "res-animated" : ""}`}>

            {/* HEADER */}
            <div className="res-header">
                <div className="res-header-left">
                    <button className="res-back-btn" onClick={() => navigate("/estilos-aprendizaje")}>
                        <IoArrowBackOutline size={14} /> Volver
                    </button>
                    <h1 className="res-header-title">Tu estilo de <em>aprendizaje</em></h1>
                    <p className="res-header-subtitle">Basado en tus 16 respuestas, el sistema experto determinó tu perfil de aprendizaje dominante.</p>
                </div>
                <div className="res-header-right">
                    <div className="res-header-stat"><IoRibbonOutline size={14} /> Perfil identificado</div>
                    <div className="res-header-stat"><IoAnalyticsOutline size={14} /> Modelo VARK</div>
                    <div className="res-header-stat"><IoBulbOutline size={14} /> Sistema experto</div>
                </div>
            </div>

            {/* LAYOUT */}
            <div className="res-layout">
                <aside className="res-sidebar">
                    <div className="res-sidebar-label">Contenido</div>
                    <nav className="res-sidebar-nav">
                        {navVisible.map((s, i) => (
                            <div key={i} className={`res-sidebar-item ${activeSection === i ? "active" : ""}`} onClick={() => irA(i)}>
                                <span className="res-sidebar-dot" />{s.label}
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

                <main className="res-main">
                    {/* CHIPS */}
                    <div className="res-banner">
                        {letras.map((l) => {
                            const cfg = PERFIL_CONFIG[l];
                            return <div key={l} className="res-chip"><cfg.Icon size={14} style={{ color: cfg.colorMid }} /><span>{cfg.nombre}</span></div>;
                        })}
                        {esMultimodal && <div className="res-chip"><IoTrophyOutline size={14} style={{ color: "#A06C1A" }} /> Multimodal</div>}
                    </div>

                    {/* TU PERFIL */}
                    <div id="sec-perfil" className="res-card">
                        <div className="res-card-inner">
                            <div className="res-card-body">
                                <div className="res-card-tag"><IoRibbonOutline size={11} /> Tu perfil dominante</div>
                                <h2 className="res-card-title">{nombrePerfil}</h2>
                                {esMultimodal && (
                                    <p className="res-card-text">Tienes la capacidad de adaptarte a <strong>múltiples estilos</strong>. Puedes sacar provecho de casi cualquier método de enseñanza.</p>
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
                                {letras.map((l) => <span key={l} className="res-deco-letter" style={{ color: PERFIL_CONFIG[l].colorMid }}>{l}</span>)}
                            </div>
                        </div>
                    </div>

                    {/* PUNTAJES */}
                    <div id="sec-puntajes" className="res-card">
                        <div className="res-card-body" style={{ padding: "40px" }}>
                            <div className="res-card-tag"><IoBarChartOutline size={11} /> Puntajes por dimensión</div>
                            <h2 className="res-card-title">Distribución de tus respuestas</h2>
                            <p className="res-card-text" style={{ marginBottom: 28 }}>Cada barra muestra cuántas de las 16 preguntas respondiste para esa modalidad.</p>
                            <div className="res-charts-grid">
                                <div className="res-chart-box">
                                    <div className="res-chart-label"><IoBarChartOutline size={13} /> Comparativa</div>
                                    <div className="res-barchart">
                                        {["V", "A", "R", "K"].map((l) => (
                                            <BarraSimple key={l} cfg={PERFIL_CONFIG[l]} value={puntajes[l.toLowerCase()]} pct={porcentajes[l.toLowerCase()] ?? 0} animado={animado} />
                                        ))}
                                    </div>
                                </div>
                                <div className="res-chart-box res-chart-box--radar">
                                    <div className="res-chart-label"><IoAnalyticsOutline size={13} /> Perfil radial</div>
                                    <RadarChart puntajes={puntajes} primaryColor={primary.colorMid} />
                                </div>
                            </div>
                            <div className="res-tooltip">
                                <IoBulbOutline size={14} />
                                <span>Las dimensiones dominantes ({letras.join(", ")}) son aquellas con mayor puntaje relativo según las reglas del sistema experto.</span>
                            </div>
                        </div>
                    </div>

                    {/* DESGLOSE */}
                    <div id="sec-desglose" className="res-card">
                        <div className="res-card-body" style={{ padding: "40px" }}>
                            <div className="res-card-tag"><IoStarOutline size={11} /> Desglose detallado</div>
                            <h2 className="res-card-title">Las cuatro dimensiones</h2>
                            <p className="res-card-text" style={{ marginBottom: 28 }}>Tu puntaje exacto en cada modalidad del modelo VARK:</p>
                            <div className="res-score-grid">
                                {["V", "A", "R", "K"].map((l) => {
                                    const cfg   = PERFIL_CONFIG[l];
                                    const isDom = letras.includes(l);
                                    return (
                                        <div key={l} className={`res-score-card res-score-${cfg.cssKey} ${isDom ? "dominant" : ""}`}>
                                            {isDom && <div className="res-score-badge" style={{ background: cfg.colorMid }}><IoCheckmarkCircleOutline size={10} /> Dominante</div>}
                                            <cfg.Icon size={26} className="res-score-icon" />
                                            <div className="res-score-letter" style={{ color: cfg.colorMid }}>{l}</div>
                                            <div className="res-score-nombre">{cfg.nombre}</div>
                                            <div style={{ fontSize: 13, color: cfg.colorMid, marginTop: 4, fontWeight: 600 }}>{porcentajes[l.toLowerCase()] ?? 0}%</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* RECOMENDACIONES */}
                    {tieneRecs && (
                        <div id="sec-recomendaciones" className="res-card">
                            <div className="res-card-body" style={{ padding: "40px" }}>
                                <div className="res-card-tag"><IoBulbOutline size={11} /> Recomendaciones personalizadas</div>
                                <h2 className="res-card-title">Recomendaciones para tu perfil</h2>
                                <p className="res-card-text" style={{ marginBottom: 28 }}>Te sugerimos estas recomendaciones basadas en tu perfil <strong>{nombrePerfil}</strong>:</p>
                                <div className="res-recs">
                                    {Object.entries(recomendaciones).map(([letra, recs]) => {
                                        const cfg = PERFIL_CONFIG[letra];
                                        if (!cfg) return null;
                                        return (
                                            <div key={letra} className="res-rec-group" style={{ marginBottom: 28 }}>
                                                <div className="res-rec-group-header" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, color: cfg.colorMid }}>
                                                    <cfg.Icon size={16} /><strong>{cfg.nombre}</strong>
                                                </div>
                                                {recs.map((rec, i) => (
                                                    <div key={i} className="res-rec-item" style={{ "--rec-color": cfg.colorMid }}>
                                                        <span className="res-rec-num" style={{ background: cfg.colorMid }}>{i + 1}</span>
                                                        <span className="res-rec-text">{rec}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* HISTORIAL */}
                    <div id="sec-historial" className="res-card">
                        <div className="res-card-body" style={{ padding: "40px" }}>
                            <div className="res-card-tag">
                                <IoCalendarOutline size={11} /> Historial de intentos
                            </div>
                            <h2 className="res-card-title">Tu evolución en el tiempo</h2>
                            <p className="res-card-text" style={{ marginBottom: 28 }}>
                                Registro de todos tus intentos del test VARK ordenados del más reciente al más antiguo.
                            </p>

                            {cargandoHistorial ? (
                                <div className="res-historial-loading">
                                    <div className="res-loading-dots"><span /><span /><span /></div>
                                </div>
                            ) : historial.length === 0 ? (
                                <div className="res-historial-empty">
                                    <IoTimeOutline size={32} />
                                    <p>No hay intentos anteriores registrados.</p>
                                </div>
                            ) : (
                                <div className="res-historial-table-wrap">
                                    <table className="res-historial-table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Fecha y hora</th>
                                                <th>Perfil dominante</th>
                                                <th>V</th>
                                                <th>A</th>
                                                <th>R</th>
                                                <th>K</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {historial.map((item, idx) => {
                                                const letrasItem = item.perfil_dominante
                                                    ? item.perfil_dominante.split("").filter(l => ["V","A","R","K"].includes(l))
                                                    : [];
                                                const primeraCfg = PERFIL_CONFIG[letrasItem[0]] || PERFIL_CONFIG["V"];
                                                const nombreItem = NOMBRES_PERFILES[item.perfil_dominante] || item.perfil_dominante;
                                                const total = (item.puntaje_v || 0) + (item.puntaje_a || 0) + (item.puntaje_r || 0) + (item.puntaje_k || 0);
                                                const esMasReciente = idx === 0;

                                                return (
                                                    <tr key={item.id_resultado} className={esMasReciente ? "res-historial-row--actual" : ""}>
                                                        <td className="res-historial-num">
                                                            {esMasReciente
                                                                ? <span className="res-historial-badge-actual">Actual</span>
                                                                : <span className="res-historial-idx">{historial.length - idx}</span>
                                                            }
                                                        </td>
                                                        <td className="res-historial-fecha">
                                                            <IoCalendarOutline size={13} style={{ flexShrink: 0 }} />
                                                            {formatearFecha(item.fecha_intento)}
                                                        </td>
                                                        <td>
                                                            <span className="res-historial-perfil" style={{
                                                                background: primeraCfg.colorLight,
                                                                color: primeraCfg.color,
                                                                borderColor: primeraCfg.colorMid + "40",
                                                            }}>
                                                                {nombreItem}
                                                            </span>
                                                        </td>
                                                        {["v","a","r","k"].map((key) => {
                                                            const val = item[`puntaje_${key}`] || 0;
                                                            const pct = total > 0 ? Math.round((val / total) * 100) : 0;
                                                            const cfg = PERFIL_CONFIG[key.toUpperCase()];
                                                            return (
                                                                <td key={key} className="res-historial-puntaje">
                                                                    <div className="res-historial-mini-bar-wrap">
                                                                        <span className="res-historial-mini-val">{val}</span>
                                                                        <div className="res-historial-mini-track">
                                                                            <div
                                                                                className="res-historial-mini-fill"
                                                                                style={{
                                                                                    width: `${pct}%`,
                                                                                    background: cfg.colorMid,
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="res-cta-wrapper">
                        <button className="res-start-btn" onClick={() => navigate("/test-estilos-aprendizaje")}>
                            <IoRefreshOutline size={15} /> Repetir el test
                        </button>
                        <button className="res-start-btn res-start-btn--outline" onClick={() => navigate("/estilos-aprendizaje")}>
                            <IoHomeOutline size={15} /> Ir al inicio
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
}