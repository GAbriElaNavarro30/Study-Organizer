// src/pages/MetodosEstudio/MetodosEstudioResultado.jsx
import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api.js";
import {
  IoAnalyticsOutline, IoBulbOutline, IoBarChartOutline,
  IoArrowBackOutline, IoRefreshOutline, IoHomeOutline,
  IoAlertCircleOutline, IoCheckmarkCircleOutline,
  IoBookOutline, IoChevronDownOutline, IoChevronUpOutline,
  IoCalendarOutline,
} from "react-icons/io5";
import "../styles/metodos-resultado-test.css";

const VARK_LABELS = { V: "Visual", A: "Auditivo", R: "Lector / Escritor", K: "Kinestésico" };
const VARK_COLORS = { V: "#898AC4", A: "#89A8B2", R: "#A2AADB", K: "#B3C8CF" };

const nivelColor = (nivel) => ({ alto: "#4caf7d", medio: "#e9a84c", bajo: "#e05c5c" }[nivel] || "#898AC4");
const nivelLabel = (nivel) => ({ alto: "Sólido", medio: "En desarrollo", bajo: "Requiere atención" }[nivel] || nivel);
const nivelCssKey = (nivel) => ({ alto: "alto", medio: "medio", bajo: "bajo" }[nivel] || "medio");

// ── Radar SVG ──
function RadarChart({ resultados, primaryColor = "#898AC4" }) {
  const cx = 160, cy = 160, r = 110;
  const dims = Object.entries(resultados);
  const n = dims.length;
  if (n === 0) return null;

  const angulo = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const punto  = (i, radio) => ({ x: cx + radio * Math.cos(angulo(i)), y: cy + radio * Math.sin(angulo(i)) });

  const poligono = dims.map(([, info], i) => {
    const p = punto(i, (info.puntaje / 100) * r);
    return `${p.x},${p.y}`;
  }).join(" ");

  return (
    <svg viewBox="0 0 320 320" className="mer-radar">
      {[25, 50, 75, 100].map(pct => (
        <polygon key={pct}
          points={dims.map((_, i) => { const p = punto(i, (pct/100)*r); return `${p.x},${p.y}`; }).join(" ")}
          fill="none" stroke="rgba(137,138,196,0.2)" strokeWidth="1"
        />
      ))}
      {dims.map((_, i) => {
        const p = punto(i, r);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(137,138,196,0.2)" strokeWidth="1"/>;
      })}
      <polygon points={poligono} fill={`${primaryColor}30`} stroke={primaryColor} strokeWidth="2"/>
      {dims.map(([, info], i) => {
        const p = punto(i, (info.puntaje / 100) * r);
        return <circle key={i} cx={p.x} cy={p.y} r="5" fill={primaryColor}/>;
      })}
      {dims.map(([, info], i) => {
        const p      = punto(i, r + 22);
        const anchor = p.x < cx - 5 ? "end" : p.x > cx + 5 ? "start" : "middle";
        const nombre = info.nombre?.length > 14 ? info.nombre.slice(0, 14) + "…" : info.nombre;
        return (
          <text key={i} x={p.x} y={p.y} textAnchor={anchor} fontSize="9" fill="#4A5568" fontFamily="DM Sans, sans-serif">
            {nombre}
          </text>
        );
      })}
    </svg>
  );
}

// ── Barra dimensión ──
function BarraDimension({ nombre, puntaje, nivel, animado }) {
  return (
    <div className="mer-barra-dim">
      <div className="mer-barra-header">
        <span className="mer-barra-nombre">{nombre}</span>
        <span className={`mer-barra-nivel mer-nivel-${nivelCssKey(nivel)}`}>{nivelLabel(nivel)}</span>
      </div>
      <div className="mer-barra-track">
        <div className="mer-barra-fill" style={{ width: animado ? `${puntaje}%` : "0%", background: nivelColor(nivel) }}/>
      </div>
      <span className="mer-barra-pct">{puntaje}%</span>
    </div>
  );
}

// ── Sección expandible recomendaciones ──
function SeccionRecs({ dimension, recs, perfil_vark }) {
  const [abierta, setAbierta] = useState(false);
  const generales = recs.filter(r => r.estilo_vark === "general");
  const vark      = recs.filter(r => r.estilo_vark !== "general");

  return (
    <div className="mer-rec-section">
      <button className="mer-rec-toggle" onClick={() => setAbierta(v => !v)}>
        <span>{dimension}</span>
        {abierta ? <IoChevronUpOutline size={16}/> : <IoChevronDownOutline size={16}/>}
      </button>
      {abierta && (
        <div className="mer-rec-body">
          {generales.length > 0 && (
            <>
              <p className="mer-rec-cat">Recomendaciones generales</p>
              <ul className="mer-rec-list">
                {generales.map((r, i) => (
                  <li key={i}><IoCheckmarkCircleOutline size={14} className="mer-rec-check"/> {r.texto}</li>
                ))}
              </ul>
            </>
          )}
          {vark.length > 0 && (
            <>
              <p className="mer-rec-cat">
                Según tu perfil VARK ({perfil_vark.split("").map(l => VARK_LABELS[l] || l).join(" · ")})
              </p>
              <ul className="mer-rec-list mer-rec-vark">
                {vark.map((r, i) => (
                  <li key={i}>
                    <span className="mer-vark-pill" style={{ background: VARK_COLORS[r.estilo_vark] || "#C0C9EE" }}>
                      {r.estilo_vark}
                    </span>
                    {r.texto}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="mer-loading">
      <div className="mer-loading-icon"><IoAnalyticsOutline size={52}/></div>
      <p className="mer-loading-text">Analizando tus resultados...</p>
      <div className="mer-loading-dots"><span/><span/><span/></div>
    </div>
  );
}

export function MetodosEstudioResultado() {
  const location = useLocation();
  const navigate = useNavigate();

  const [datos,    setDatos]    = useState(location.state?.puntaje_global !== undefined ? location.state : null);
  const [cargando, setCargando] = useState(!datos);
  const [animado,  setAnimado]  = useState(false);

  useEffect(() => {
    if (!datos) cargarResultado();
    else setTimeout(() => setAnimado(true), 120);
  }, []);

  const cargarResultado = async () => {
    const id_intento = location.state?.id_intento;
    if (!id_intento) { navigate("/metodos-estudio"); return; }
    try {
      const { data } = await api.get(`/metodos-estudio/resultado/${id_intento}`);
      setDatos(data);
    } catch {
      navigate("/metodos-estudio");
    } finally {
      setCargando(false);
      setTimeout(() => setAnimado(true), 120);
    }
  };

  if (cargando || !datos) return <LoadingState/>;

  const {
    puntaje_global,
    nivel_global,
    resultados_por_dimension = {},
    errores_detectados = [],
    recomendaciones = {},
    perfil_vark,
  } = datos;

  const dimOrdenadas = Object.entries(resultados_por_dimension).sort((a, b) => Number(a[0]) - Number(b[0]));
  const tieneRecs    = Object.keys(recomendaciones).length > 0;

  return (
    <div className={`mer-app ${animado ? "mer-animated" : ""}`}>

      {/* HEADER */}
      <div className="mer-header">
        <div className="mer-header-left">
          <button className="mer-back-btn" onClick={() => navigate("/metodos-estudio")}>
            <IoArrowBackOutline size={14}/> Volver
          </button>
          <h1 className="mer-header-title">Tus <em>resultados</em></h1>
          <p className="mer-header-subtitle">
            Análisis completo de tus hábitos de estudio basado en el modelo CHTE.
          </p>
        </div>
        <div className="mer-header-right">
          <div className="mer-header-stat"><IoBarChartOutline size={14}/> Análisis CHTE</div>
          <div className="mer-header-stat"><IoBulbOutline     size={14}/> Sistema experto</div>
          {perfil_vark && (
            <div className="mer-header-stat">
              <IoAnalyticsOutline size={14}/> Perfil {perfil_vark}
            </div>
          )}
        </div>
      </div>

      {/* LAYOUT */}
      <div className="mer-layout">

        {/* SIDEBAR */}
        <aside className="mer-sidebar">
          <div className="mer-sidebar-label">Contenido</div>
          <nav className="mer-sidebar-nav">
            {[
              { label: "Resumen global",     id: "mer-resumen"  },
              { label: "Por dimensión",      id: "mer-dims"     },
              ...(errores_detectados.length > 0 ? [{ label: "Errores detectados", id: "mer-errores" }] : []),
              ...(tieneRecs ? [{ label: "Recomendaciones", id: "mer-recs" }] : []),
            ].map((s, i) => (
              <div key={i} className="mer-sidebar-item"
                onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}>
                <span className="mer-sidebar-dot"/> {s.label}
              </div>
            ))}
          </nav>
          <div className="mer-sidebar-divider"/>
          <div className="mer-sidebar-actions">
            <button className="mer-action-btn" onClick={() => navigate("/test-metodos-estudio")}>
              <IoRefreshOutline size={13}/> Repetir test
            </button>
            <button className="mer-action-btn mer-action-btn--ghost" onClick={() => navigate("/historial-metodos-estudio")}>
              <IoCalendarOutline size={13}/> Ver historial
            </button>
            <button className="mer-action-btn mer-action-btn--ghost" onClick={() => navigate("/metodos-estudio")}>
              <IoHomeOutline size={13}/> Inicio
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="mer-main">

          {/* CHIPS */}
          <div className="mer-banner">
            <div className="mer-chip"><IoBarChartOutline size={14}/><span>Puntaje: {Math.round(puntaje_global)}%</span></div>
            <div className="mer-chip" style={{ color: nivelColor(nivel_global) }}>
              <IoAnalyticsOutline size={14}/><span>{nivelLabel(nivel_global)}</span>
            </div>
            {perfil_vark && (
              <div className="mer-chip">
                <IoBulbOutline size={14}/>
                <span>VARK: {perfil_vark.split("").map(l => VARK_LABELS[l] || l).join(" · ")}</span>
              </div>
            )}
            {errores_detectados.length > 0 && (
              <div className="mer-chip mer-chip--warn">
                <IoAlertCircleOutline size={14}/>
                <span>{errores_detectados.length} error{errores_detectados.length !== 1 ? "es" : ""} detectado{errores_detectados.length !== 1 ? "s" : ""}</span>
              </div>
            )}
          </div>

          {/* ── RESUMEN GLOBAL ── */}
          <div id="mer-resumen" className="mer-card">
            <div className="mer-card-inner">
              <div className="mer-card-body">
                <div className="mer-card-tag"><IoBarChartOutline size={11}/> Resumen global</div>
                <h2 className="mer-card-title">Tu puntuación general</h2>
                <p className="mer-card-text">
                  Obtuviste un puntaje global de <strong>{Math.round(puntaje_global)}%</strong>, 
                  lo que corresponde a un nivel <strong style={{ color: nivelColor(nivel_global) }}>{nivelLabel(nivel_global)}</strong> en
                  tus hábitos de estudio.
                </p>
                {perfil_vark && (
                  <p className="mer-card-text" style={{ marginTop: 12 }}>
                    Tus recomendaciones han sido personalizadas según tu perfil VARK dominante:{" "}
                    <strong>{perfil_vark.split("").map(l => VARK_LABELS[l] || l).join(" · ")}</strong>.
                  </p>
                )}
              </div>
              <div className="mer-card-deco">
                <div className="mer-score-ring" style={{ borderColor: nivelColor(nivel_global) }}>
                  <span className="mer-score-num" style={{ color: nivelColor(nivel_global) }}>
                    {Math.round(puntaje_global)}
                  </span>
                  <span className="mer-score-label">/ 100</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── POR DIMENSIÓN ── */}
          <div id="mer-dims" className="mer-card">
            <div className="mer-card-body" style={{ padding: "40px" }}>
              <div className="mer-card-tag"><IoAnalyticsOutline size={11}/> Por dimensión</div>
              <h2 className="mer-card-title">Distribución por dimensión</h2>
              <p className="mer-card-text" style={{ marginBottom: 28 }}>
                Cada barra representa tu puntaje en esa dimensión del CHTE.
              </p>
              <div className="mer-charts-grid">
                <div className="mer-chart-box">
                  <div className="mer-chart-label"><IoBarChartOutline size={13}/> Comparativa</div>
                  <div className="mer-barchart">
                    {dimOrdenadas.map(([id, info]) => (
                      <BarraDimension key={id} nombre={info.nombre} puntaje={info.puntaje} nivel={info.nivel} animado={animado}/>
                    ))}
                  </div>
                </div>
                <div className="mer-chart-box mer-chart-box--radar">
                  <div className="mer-chart-label"><IoAnalyticsOutline size={13}/> Perfil radial</div>
                  <RadarChart resultados={resultados_por_dimension}/>
                </div>
              </div>
            </div>
          </div>

          {/* ── ERRORES DETECTADOS ── */}
          {errores_detectados.length > 0 && (
            <div id="mer-errores" className="mer-card">
              <div className="mer-card-body" style={{ padding: "40px" }}>
                <div className="mer-card-tag mer-tag-warn"><IoAlertCircleOutline size={11}/> Errores detectados</div>
                <h2 className="mer-card-title">Hábitos a mejorar</h2>
                <p className="mer-card-text" style={{ marginBottom: 24 }}>
                  El sistema experto identificó los siguientes patrones negativos en tus respuestas:
                </p>
                <div className="mer-errores-grid">
                  {errores_detectados.map((e, i) => (
                    <div key={i} className="mer-error-card">
                      <p className="mer-error-dim">{e.dimension}</p>
                      <p className="mer-error-msg">{e.mensaje}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── SIN ERRORES ── */}
          {errores_detectados.length === 0 && (
            <div className="mer-card">
              <div className="mer-card-body" style={{ padding: "40px", textAlign: "center" }}>
                <IoCheckmarkCircleOutline size={48} style={{ color: "#4caf7d", marginBottom: 12 }}/>
                <h2 className="mer-card-title">¡Excelente!</h2>
                <p className="mer-card-text">No se detectaron errores significativos en tus hábitos de estudio.</p>
              </div>
            </div>
          )}

          {/* ── RECOMENDACIONES ── */}
          {tieneRecs && (
            <div id="mer-recs" className="mer-card">
              <div className="mer-card-body" style={{ padding: "40px" }}>
                <div className="mer-card-tag"><IoBulbOutline size={11}/> Recomendaciones</div>
                <h2 className="mer-card-title">Recomendaciones personalizadas</h2>
                <p className="mer-card-text" style={{ marginBottom: 20 }}>
                  Haz clic en cada dimensión para ver las sugerencias adaptadas a tu perfil.
                </p>
                {Object.entries(recomendaciones).map(([dim, recs]) => (
                  <SeccionRecs key={dim} dimension={dim} recs={recs} perfil_vark={perfil_vark || "VARK"}/>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mer-cta-wrapper">
            <button className="mer-start-btn" onClick={() => navigate("/test-metodos-estudio")}>
              <IoRefreshOutline size={15}/> Repetir el test
            </button>
            <button className="mer-start-btn mer-start-btn--outline" onClick={() => navigate("/historial-metodos-estudio")}>
              <IoCalendarOutline size={15}/> Ver historial
            </button>
            <button className="mer-start-btn mer-start-btn--outline" onClick={() => navigate("/cursos")}>
              <IoBookOutline size={15}/> Ver cursos
            </button>
          </div>

        </main>
      </div>
    </div>
  );
}