// src/pages/MetodosEstudio/MetodosEstudioHistorial.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import {
  IoCalendarOutline, IoArrowForwardOutline, IoRefreshOutline,
  IoHomeOutline, IoBarChartOutline, IoTimeOutline,
  IoTrophyOutline, IoAlertCircleOutline,
} from "react-icons/io5";
import "../styles/metodos-estudio-historial.css";

// ── Helpers de nivel (por puntaje numérico) ──
const nivelColor = (p) =>
  p >= 95 ? "#1A6E3C" : p >= 80 ? "#2E8B57" : p >= 65 ? "#2B7AB8" : p >= 50 ? "#A05A00" : "#B03030";

const nivelLabel = (p) =>
  p >= 95 ? "Excelente" : p >= 80 ? "Muy bueno" : p >= 65 ? "Bueno" : p >= 50 ? "Regular" : "Deficiente";

const nivelCssKey = (p) =>
  p >= 95 ? "excelente" : p >= 80 ? "muy-bueno" : p >= 65 ? "bueno" : p >= 50 ? "regular" : "deficiente";

// ── Puntaje con 2 decimales sin redondeo ──
const formatPuntaje = (p) => (Math.floor(Number(p) * 100) / 100).toFixed(2);

const formatFecha = (f) => new Date(f).toLocaleString("es-MX", {
  day: "2-digit", month: "short", year: "numeric",
  hour: "2-digit", minute: "2-digit",
});

function LoadingState() {
  return (
    <div className="meh-loading">
      <div className="meh-loading-icon"><IoBarChartOutline size={52} /></div>
      <p className="meh-loading-text">Cargando historial...</p>
      <div className="meh-loading-dots"><span /><span /><span /></div>
    </div>
  );
}

export function MetodosEstudioHistorial() {
  const navigate = useNavigate();

  const [intentos, setIntentos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [animado, setAnimado] = useState(false);

  useEffect(() => {
    api.get("/metodosestudio/historial")
      .then(({ data }) => setIntentos(data.historial || []))
      .catch(() => { })
      .finally(() => {
        setCargando(false);
        setTimeout(() => setAnimado(true), 120);
      });
  }, []);

  if (cargando) return <LoadingState />;

  const mejorIntento = intentos.length
    ? intentos.reduce((a, b) =>
      Number(b.puntaje_global || 0) > Number(a.puntaje_global || 0) ? b : a
    )
    : null;

  return (
    <div className={`meh-app ${animado ? "meh-animated" : ""}`}>

      {/* HEADER */}
      <div className="meh-header">
        <div className="meh-header-left">
          <button className="meh-back-btn" onClick={() => navigate("/metodos-estudio")}>
            ← Volver
          </button>
          <h1 className="meh-header-title">Historial de <em>Métodos de Estudio</em></h1>
          <p className="meh-header-subtitle">
            Registro de todos tus intentos ordenados del más reciente al más antiguo.
          </p>
        </div>
        <div className="meh-header-right">
          <div className="meh-header-stat"><IoBarChartOutline size={14} /> {intentos.length} intentos</div>
          <div className="meh-header-stat"><IoTimeOutline size={14} /> Test CHTE y LASSI</div>
          {mejorIntento && (
            <div className="meh-header-stat">
              <IoTrophyOutline size={14} /> Mejor: {formatPuntaje(mejorIntento.puntaje_global || 0)}%
            </div>
          )}
        </div>
      </div>

      <div className="meh-main">

        {/* Chips resumen */}
        {intentos.length > 0 && (
          <div className="meh-banner">
            <div className="meh-chip">
              <IoCalendarOutline size={14} />
              <span>{intentos.length} {intentos.length === 1 ? "intento" : "intentos"}</span>
            </div>
            {mejorIntento && (
              <div className="meh-chip">
                <IoTrophyOutline size={14} />
                <span>Mejor: {formatPuntaje(mejorIntento.puntaje_global || 0)}%</span>
              </div>
            )}
            <div className="meh-chip">
              <IoTimeOutline size={14} />
              <span>Último: {formatFecha(intentos[0]?.fecha_intento)}</span>
            </div>
          </div>
        )}

        {/* Sin intentos */}
        {intentos.length === 0 ? (
          <div className="meh-card meh-empty">
            <IoAlertCircleOutline size={52} className="meh-empty-icon" />
            <h2 className="meh-empty-title">Sin intentos aún</h2>
            <p className="meh-empty-sub">Aún no has realizado el test de métodos de estudio.</p>
            <button className="meh-start-btn" onClick={() => navigate("/test-metodos-estudio")}>
              Realizar el test <IoArrowForwardOutline size={15} />
            </button>
          </div>
        ) : (
          <>
            <div className="meh-card">
              <div className="meh-card-body">
                <div className="meh-card-tag">
                  <IoCalendarOutline size={11} /> Todos los intentos
                </div>
                <h2 className="meh-card-title">Tu evolución en el tiempo</h2>
                <p className="meh-card-text" style={{ marginBottom: 24 }}>
                  Haz clic en cualquier intento para ver el detalle de tus resultados.
                </p>
                <div className="meh-table-wrap">
                  <table className="meh-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Fecha y hora</th>
                        <th>Nivel</th>
                        <th>Puntaje global</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {intentos.map((intento, idx) => {
                        const puntaje = Number(intento.puntaje_global || 0);
                        const esMasReciente = idx === 0;
                        return (
                          <tr
                            key={intento.id_intento}
                            className={`meh-table-row ${esMasReciente ? "meh-row--actual" : ""}`}
                            onClick={() => navigate("/resultado-metodos-estudio", {
                              state: { id_intento: intento.id_intento },
                            })}
                          >
                            <td className="meh-col-num">
                              {esMasReciente
                                ? <span className="meh-badge-actual">Actual</span>
                                : <span className="meh-idx">{intentos.length - idx}</span>
                              }
                            </td>
                            <td className="meh-col-fecha">
                              <IoCalendarOutline size={13} style={{ flexShrink: 0 }} />
                              {formatFecha(intento.fecha_intento)}
                            </td>
                            <td>
                              <span className={`meh-nivel-pill meh-nivel-${nivelCssKey(puntaje)}`}>
                                {nivelLabel(puntaje)}
                              </span>
                            </td>
                            <td className="meh-col-puntaje">
                              <div className="meh-mini-bar-wrap">
                                <span className="meh-mini-val">{formatPuntaje(puntaje)}%</span>
                                <div className="meh-mini-track">
                                  <div
                                    className="meh-mini-fill"
                                    style={{ width: `${puntaje}%`, background: nivelColor(puntaje) }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="meh-col-arrow">
                              <IoArrowForwardOutline size={16} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="meh-cta-wrapper">
              <button className="meh-start-btn" onClick={() => navigate("/test-metodos-estudio")}>
                <IoRefreshOutline size={15} /> Nuevo intento
              </button>
              <button className="meh-start-btn meh-start-btn--outline" onClick={() => navigate("/metodos-estudio")}>
                <IoHomeOutline size={15} /> Ir al inicio
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}