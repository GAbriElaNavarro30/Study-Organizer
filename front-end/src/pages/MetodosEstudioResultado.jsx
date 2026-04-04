// src/pages/MetodosEstudio/MetodosEstudioResultado.jsx
import { useState } from "react";
import {
  IoAnalyticsOutline, IoBulbOutline, IoBarChartOutline,
  IoArrowBackOutline, IoRefreshOutline, IoHomeOutline,
  IoAlertCircleOutline, IoCheckmarkCircleOutline,
  IoBookOutline, IoChevronDownOutline, IoChevronUpOutline,
  IoCalendarOutline,
} from "react-icons/io5";
import "../styles/metodos-resultado-test.css";
import { useMetodosEstudioResultado } from "../hooks/useMetodosEstudioResultado.js";

const VARK_LABELS = { V: "Visual", A: "Auditivo", R: "Lector / Escritor", K: "Kinestésico" };
const VARK_COLORS = { V: "#2B7AB8", A: "#2E8B57", R: "#A05A00", K: "#6B5B95" };

// ── Helpers de nivel ──
const nivelColor = (nivel) => ({
  excelente: "#1A6E3C",
  muy_bueno: "#2E8B57",
  bueno: "#2B7AB8",
  regular: "#A05A00",
  deficiente: "#B03030",
}[nivel] || "#4A5A6E");

const nivelLabel = (nivel) => ({
  excelente: "Excelente",
  muy_bueno: "Muy bueno",
  bueno: "Bueno",
  regular: "Regular",
  deficiente: "Deficiente",
}[nivel] || nivel);

const nivelCssKey = (nivel) => ({
  excelente: "excelente",
  muy_bueno: "muy-bueno",
  bueno: "bueno",
  regular: "regular",
  deficiente: "deficiente",
}[nivel] || "regular");

// ── Puntaje con 2 decimales, sin redondeo ──
const formatPuntaje = (p) => (Math.floor(Number(p) * 100) / 100).toFixed(2);

// ── Radar SVG ──
function RadarChart({ resultados, primaryColor = "#2B7AB8" }) {
  const cx = 160, cy = 160, r = 110;
  const dims = Object.entries(resultados);
  const n = dims.length;
  if (n === 0) return null;

  const angulo = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const punto = (i, radio) => ({
    x: cx + radio * Math.cos(angulo(i)),
    y: cy + radio * Math.sin(angulo(i)),
  });

  const poligono = dims.map(([, info], i) => {
    const p = punto(i, (info.puntaje / 100) * r);
    return `${p.x},${p.y}`;
  }).join(" ");

  return (
    <svg viewBox="0 0 320 320" className="mer-radar">
      {[25, 50, 75, 100].map((pct) => (
        <polygon
          key={pct}
          points={dims.map((_, i) => { const p = punto(i, (pct / 100) * r); return `${p.x},${p.y}`; }).join(" ")}
          fill="none" stroke="rgba(43,122,184,0.15)" strokeWidth="1"
        />
      ))}
      {dims.map((_, i) => {
        const p = punto(i, r);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(43,122,184,0.15)" strokeWidth="1" />;
      })}
      <polygon points={poligono} fill={`${primaryColor}25`} stroke={primaryColor} strokeWidth="2" />
      {dims.map(([, info], i) => {
        const p = punto(i, (info.puntaje / 100) * r);
        return <circle key={i} cx={p.x} cy={p.y} r="5" fill={primaryColor} />;
      })}
      {dims.map(([, info], i) => {
        const p = punto(i, r + 22);
        const anchor = p.x < cx - 5 ? "end" : p.x > cx + 5 ? "start" : "middle";
        const nombre = info.nombre?.length > 14 ? info.nombre.slice(0, 14) + "…" : info.nombre;
        return (
          <text key={i} x={p.x} y={p.y} textAnchor={anchor} fontSize="9" fill="#2E3D52" fontFamily="DM Sans, sans-serif">
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
        <div
          className="mer-barra-fill"
          style={{
            width: animado ? `${puntaje}%` : "0%",
            background: nivelColor(nivel),
          }}
        />
      </div>
      <span className="mer-barra-pct">{formatPuntaje(puntaje)}%</span>
    </div>
  );
}

// ── Sección expandible recomendaciones ──
function SeccionRecs({ dimension, recs, perfil_vark }) {
  const [abierta, setAbierta] = useState(false);
  const generales = recs.filter((r) => r.estilo_vark === "general");
  const vark = recs.filter((r) => r.estilo_vark !== "general");

  return (
    <div className="mer-rec-section">
      <button className="mer-rec-toggle" onClick={() => setAbierta((v) => !v)}>
        <span>{dimension}</span>
        {abierta ? <IoChevronUpOutline size={16} /> : <IoChevronDownOutline size={16} />}
      </button>
      {abierta && (
        <div className="mer-rec-body">
          {generales.length > 0 && (
            <>
              <p className="mer-rec-cat">Recomendaciones generales</p>
              <ul className="mer-rec-list">
                {generales.map((r, i) => (
                  <li key={i}>
                    <IoCheckmarkCircleOutline size={14} className="mer-rec-check" /> {r.texto}
                  </li>
                ))}
              </ul>
            </>
          )}
          {vark.length > 0 && (
            <>
              <p className="mer-rec-cat">
                Según tu perfil VARK ({perfil_vark.split("").map((l) => VARK_LABELS[l] || l).join(" · ")})
              </p>
              <ul className="mer-rec-list mer-rec-vark">
                {vark.map((r, i) => (
                  <li key={i}>
                    <span
                      className="mer-vark-pill"
                      style={{ background: VARK_COLORS[r.estilo_vark] || "#2B7AB8" }}
                    >
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

// ── Loading ──
function LoadingState() {
  return (
    <div className="mer-loading">
      <div className="mer-loading-icon"><IoAnalyticsOutline size={52} /></div>
      <p className="mer-loading-text">Analizando tus resultados...</p>
      <div className="mer-loading-dots"><span /><span /><span /></div>
    </div>
  );
}

// ══════════════════════════════════════════════
// COMPONENTE PRINCIPAL — solo vista
// ══════════════════════════════════════════════
export function MetodosEstudioResultado() {
  const {
    cargando,
    animado,
    activeSection,
    puntaje_global,
    nivel_global,
    resultados_por_dimension,
    errores_detectados,
    recomendaciones,
    cursosRecomendados,
    perfil_vark,
    tieneMejoras,
    tieneRecs,
    dimOrdenadas,
    sidebarSections,
    navigate,
    irASeccion,
  } = useMetodosEstudioResultado();

  if (cargando) return <LoadingState />;

  return (
    <div className={`mer-app ${animado ? "mer-animated" : ""}`}>

      {/* ── HEADER ── */}
      <div className="mer-header">
        <div className="mer-header-left">
          <button className="mer-back-btn" onClick={() => navigate("/metodos-estudio")}>
            <IoArrowBackOutline size={14} /> Volver
          </button>
          <h1 className="mer-header-title">Tus <em>resultados</em></h1>
          <p className="mer-header-subtitle">
            Análisis completo de tus hábitos de estudio basado en el modelo CHTE y LASSI.
          </p>
        </div>
        <div className="mer-header-right">
          <div className="mer-header-stat"><IoBarChartOutline size={14} /> Análisis CHTE y LASSI</div>
          {perfil_vark && (
            <div className="mer-header-stat">
              <IoAnalyticsOutline size={14} /> Perfil: {perfil_vark.split("").map((l) => VARK_LABELS[l] || l).join(" · ")}
            </div>
          )}
        </div>
      </div>

      {/* ── LAYOUT ── */}
      <div className="mer-layout">

        {/* ── SIDEBAR ── */}
        <aside className="mer-sidebar">
          <div className="mer-sidebar-label">Contenido</div>
          <nav className="mer-sidebar-nav">
            {sidebarSections.map((s, i) => (
              <div
                key={i}
                className={`mer-sidebar-item ${activeSection === s.id ? "mer-sidebar-item--active" : ""}`}
                onClick={() => irASeccion(s.id)}
              >
                <span className="mer-sidebar-dot" /> {s.label}
              </div>
            ))}
          </nav>
          <div className="mer-sidebar-divider" />
          <div className="mer-sidebar-actions">
            <button className="mer-action-btn" onClick={() => navigate("/test-metodos-estudio")}>
              <IoRefreshOutline size={13} /> Repetir test
            </button>
            <button className="mer-action-btn mer-action-btn--ghost" onClick={() => navigate("/metodos-estudio")}>
              <IoHomeOutline size={13} /> Inicio
            </button>
            <button className="mer-action-btn mer-action-btn--ghost" onClick={() => navigate("/historial-metodos-estudio")}>
              <IoCalendarOutline size={13} /> Ver historial
            </button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="mer-main">

          {/* ── CHIPS ── */}
          <div className="mer-banner">
            <div className="mer-chip">
              <IoBarChartOutline size={14} />
              <span>Puntaje: {formatPuntaje(puntaje_global)}%</span>
            </div>
            <div className={`mer-chip mer-chip--nivel-${nivelCssKey(nivel_global)}`}>
              <IoAnalyticsOutline size={14} />
              <span>{nivelLabel(nivel_global)}</span>
            </div>
            {perfil_vark && (
              <div className="mer-chip">
                <IoBulbOutline size={14} />
                <span>VARK: {perfil_vark.split("").map((l) => VARK_LABELS[l] || l).join(" · ")}</span>
              </div>
            )}
            {tieneMejoras && (
              <div className="mer-chip mer-chip--warn">
                <IoAlertCircleOutline size={14} />
                <span>
                  {errores_detectados.length} posible{errores_detectados.length !== 1 ? "s" : ""} mejora{errores_detectados.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>

          {/* ── RESUMEN GLOBAL ── */}
          <div id="mer-resumen" className="mer-card">
            <div className="mer-card-inner">
              <div className="mer-card-body">
                <div className="mer-card-tag"><IoBarChartOutline size={11} /> Resumen global</div>
                <h2 className="mer-card-title">Tu puntuación general</h2>
                <p className="mer-card-text">
                  Obtuviste un puntaje global de <strong>{formatPuntaje(puntaje_global)}%</strong>,
                  lo que corresponde a un nivel{" "}
                  <strong className={`mer-nivel-${nivelCssKey(nivel_global)}`}>{nivelLabel(nivel_global)}</strong>{" "}
                  en tus hábitos de estudio.
                </p>
                {perfil_vark && (
                  <p className="mer-card-text mer-card-text--spaced">
                    Tus recomendaciones han sido personalizadas según tu perfil VARK dominante:{" "}
                    <strong>{perfil_vark.split("").map((l) => VARK_LABELS[l] || l).join(" · ")}</strong>.
                  </p>
                )}
              </div>
              <div className="mer-card-deco">
                <div className={`mer-score-ring mer-score-ring--${nivelCssKey(nivel_global)}`}>
                  <span className={`mer-score-num mer-nivel-${nivelCssKey(nivel_global)}`}>
                    {formatPuntaje(puntaje_global)}
                  </span>
                  <span className="mer-score-label">/ 100</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── POR DIMENSIÓN ── */}
          <div id="mer-dims" className="mer-card">
            <div className="mer-card-body">
              <div className="mer-card-tag"><IoAnalyticsOutline size={11} /> Por dimensión</div>
              <h2 className="mer-card-title">Distribución por dimensión</h2>
              <p className="mer-card-text mer-card-text--spaced-lg">
                Cada barra representa tu puntaje en esa dimensión del CHTE y LASSI.
              </p>
              <div className="mer-charts-grid">
                <div className="mer-chart-box">
                  <div className="mer-chart-label"><IoBarChartOutline size={13} /> Comparativa</div>
                  <div className="mer-barchart">
                    {dimOrdenadas.map(([id, info]) => (
                      <BarraDimension
                        key={id}
                        nombre={info.nombre}
                        puntaje={info.puntaje}
                        nivel={info.nivel}
                        animado={animado}
                      />
                    ))}
                  </div>
                </div>
                <div className="mer-chart-box mer-chart-box--radar">
                  <div className="mer-chart-label"><IoAnalyticsOutline size={13} /> Perfil radial</div>
                  <RadarChart resultados={resultados_por_dimension} />
                </div>
              </div>
            </div>
          </div>

          {/* ── POSIBLES MEJORAS ── */}
          {tieneMejoras && (
            <div id="mer-errores" className="mer-card">
              <div className="mer-card-body">
                <div className="mer-card-tag mer-tag-warn">
                  <IoAlertCircleOutline size={11} /> Posibles mejoras
                </div>
                <h2 className="mer-card-title">Áreas de oportunidad</h2>
                <p className="mer-card-text mer-card-text--spaced-lg">
                  El sistema experto identificó los siguientes aspectos que podrías trabajar para mejorar tus hábitos:
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

          {/* ── SIN MEJORAS ── */}
          {!tieneMejoras && (
            <div className="mer-card">
              <div className="mer-card-body mer-card-body--centered">
                <IoCheckmarkCircleOutline size={48} className="mer-success-icon" />
                <h2 className="mer-card-title">¡Excelentes hábitos!</h2>
                <p className="mer-card-text">
                  No se detectaron hábitos negativos frecuentes en tus respuestas.
                  Sigue así y consulta las recomendaciones para seguir creciendo.
                </p>
              </div>
            </div>
          )}

          {/* ── RECOMENDACIONES ── */}
          {tieneRecs && (
            <div id="mer-recs" className="mer-card">
              <div className="mer-card-body">
                <div className="mer-card-tag"><IoBulbOutline size={11} /> Recomendaciones</div>
                <h2 className="mer-card-title">Recomendaciones personalizadas</h2>

                {(!perfil_vark || perfil_vark === "VARK") && (
                  <div className="mer-vark-aviso">
                    <IoAlertCircleOutline size={16} />
                    <span>
                      Aún no has realizado el test de Estilos de Aprendizaje.
                      Se recomienda realizarlo para recibir recomendaciones
                      personalizadas según tu perfil VARK.
                    </span>
                    <button
                      className="mer-vark-aviso-btn"
                      onClick={() => navigate("/test-estilos-aprendizaje")}
                    >
                      Ir al test VARK
                    </button>
                  </div>
                )}

                <p className="mer-card-text mer-card-text--spaced-lg">
                  Haz clic en cada dimensión para ver las sugerencias adaptadas a tu perfil.
                </p>
                {Object.entries(recomendaciones).map(([dim, recs]) => (
                  <SeccionRecs key={dim} dimension={dim} recs={recs} perfil_vark={perfil_vark || "VARK"} />
                ))}
              </div>
            </div>
          )}

          {/* ── CURSOS RECOMENDADOS ── */}
          <div id="mer-cursos" className="mer-card">
            <div className="mer-card-body mer-card-body--centered">
              <div className="mer-card-tag mer-card-tag--centered">
                <IoBookOutline size={11} /> Cursos recomendados
              </div>

              {cursosRecomendados?.length > 0 ? (
                <>
                  <h2 className="mer-card-title">
                    Tienes {cursosRecomendados.length} curso{cursosRecomendados.length !== 1 ? "s" : ""} recomendado{cursosRecomendados.length !== 1 ? "s" : ""}
                  </h2>
                  <p className="mer-card-text mer-card-text--narrow mer-card-text--spaced-lg">
                    Basados en tu perfil{" "}
                    {perfil_vark && (
                      <strong>{perfil_vark.split("").map((l) => VARK_LABELS[l] || l).join(" · ")}</strong>
                    )}{" "}
                    y las dimensiones donde puedes mejorar.
                  </p>
                  <div className="mer-cursos-cta">
                    <button className="mer-start-btn" onClick={() => navigate("/cursos")}>
                      <IoBookOutline size={15} /> Ver cursos recomendados
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="mer-card-title">0 cursos recomendados</h2>

                  {(!perfil_vark || perfil_vark === "VARK") ? (
                    <>
                      <p className="mer-card-text mer-card-text--narrow mer-card-text--spaced-lg">
                        Para recibir recomendaciones de cursos necesitas completar primero
                        el test de Estilos de Aprendizaje.
                      </p>
                      <div className="mer-cursos-vark-cta">
                        <button
                          className="mer-start-btn mer-start-btn--vark"
                          onClick={() => navigate("/test-estilos-aprendizaje")}
                        >
                          <IoBookOutline size={15} /> Realizar test VARK
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="mer-card-text mer-card-text--narrow">
                      Por el momento no encontramos cursos que coincidan con tu perfil{" "}
                      <strong>{perfil_vark.split("").map((l) => VARK_LABELS[l] || l).join(" · ")}</strong>{" "}
                      y las dimensiones que puedes mejorar. Pronto habrá más cursos disponibles.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ── CTA ── */}
          <div className="mer-cta-wrapper">
            <button className="mer-start-btn" onClick={() => navigate("/test-metodos-estudio")}>
              <IoRefreshOutline size={15} /> Repetir el test
            </button>
            <button className="mer-start-btn mer-start-btn--outline" onClick={() => navigate("/metodos-estudio")}>
              <IoHomeOutline size={15} /> Inicio
            </button>
            <button className="mer-start-btn mer-start-btn--outline" onClick={() => navigate("/historial-metodos-estudio")}>
              <IoCalendarOutline size={15} /> Ver historial
            </button>
          </div>

        </main>
      </div>
    </div>
  );
}