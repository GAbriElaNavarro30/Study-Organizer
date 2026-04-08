// src/pages/HistorialResultadoCurso.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    IoArrowBackOutline, IoPersonOutline, IoPeopleOutline,
    IoTrophyOutline, IoBarChartOutline, IoTimeOutline,
} from "react-icons/io5";
import api from "../services/api";
import "../styles/HistorialResultadoCurso.css";

const NIVEL_CLASS = {
    excelente: "n-excelente", "muy-bueno": "n-muy-bueno",
    bueno: "n-bueno", regular: "n-regular",
    deficiente: "n-deficiente",
};

export function HistorialResultadoCurso() {
    const navigate = useNavigate();
    const { state } = useLocation();
    // state: { idCurso, idUsuario, nombreEstudiante, fotoPerfil }

    const [historial, setHistorial] = useState([]);
    const [estudiante, setEstudiante] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!state?.idCurso || !state?.idUsuario) {
            setError("Faltan parámetros de navegación.");
            setCargando(false);
            return;
        }
        (async () => {
            try {
                const { data } = await api.get(
                    `/cursos/cursos/${state.idCurso}/estudiantes/${state.idUsuario}/historial`
                );
                setHistorial(data.historial || []);
                setEstudiante(data.estudiante || null);
            } catch (err) {
                setError(err.response?.data?.mensaje || "No se pudo cargar el historial.");
            } finally {
                setCargando(false);
            }
        })();
    }, [state]);

    const promedio = historial.length
        ? historial.reduce((s, r) => s + Number(r.puntaje || 0), 0) / historial.length
        : 0;
    const mejorPuntaje = historial.length
        ? Math.max(...historial.map(r => Number(r.puntaje || 0)))
        : 0;
    const mejorIdx = historial.findIndex(r => Number(r.puntaje) === mejorPuntaje);
    const ultimoNivel = historial.at(-1)?.nivel || "—";

    // Para la gráfica
    const maxP = mejorPuntaje || 100;

    if (cargando) return <div className="hrc-loading"><div className="hrc-spinner" /><p>Cargando historial…</p></div>;
    if (error) return <div className="hrc-error"><p>{error}</p><button onClick={() => navigate(-1)}>Volver</button></div>;

    const est = estudiante || {};
    const iniciales = `${est.nombre?.[0] || ""}${est.apellido?.[0] || ""}`.toUpperCase();

    return (
        <div className="hrc-root">

            {/* Topbar */}
            <header className="hrc-topbar">
                <button className="hrc-back-btn" onClick={() => navigate(-1)}>
                    <IoArrowBackOutline size={15} /> Volver
                </button>
                <div>
                    <div className="hrc-topbar-title">Historial de resultados</div>
                    <div className="hrc-topbar-sub">Curso: {state?.nombreCurso || "—"}</div>
                </div>
            </header>

            <main className="hrc-main">

                {/* Hero */}
                <div className="hrc-hero">
                    <div className="hrc-avatar">
                        {est.foto_perfil
                            ? <img src={est.foto_perfil} alt={est.nombre} />
                            : iniciales || <IoPersonOutline size={22} />}
                    </div>
                    <div className="hrc-hero-info">
                        <div className="hrc-hero-name">{est.nombre} {est.apellido}</div>
                        <div className="hrc-hero-meta">
                            <span>{est.correo_electronico}</span>
                            {est.fecha_inscripcion && (
                                <span>Inscrito: {new Date(est.fecha_inscripcion).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })}</span>
                            )}
                        </div>
                        <div className="hrc-stats">
                            {[
                                { v: historial.length, l: "Intentos" },
                                { v: promedio.toFixed(1), l: "Promedio" },
                                { v: mejorPuntaje.toFixed(1), l: "Mejor puntaje" },
                                { v: ultimoNivel || "—", l: "Nivel actual" },
                            ].map(({ v, l }) => (
                                <div key={l} className="hrc-stat-chip">
                                    <div className="hrc-sv">{v}</div>
                                    <div className="hrc-sl">{l}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Gráfica */}
                {historial.length > 0 && (
                    <>
                        <div className="hrc-sec-title"><IoBarChartOutline size={13} /> Evolución de puntajes</div>
                        <div className="hrc-chart-card">
                            <div className="hrc-chart-inner">
                                {historial.map((r, i) => {
                                    const pct = (Number(r.puntaje) / maxP) * 110;
                                    const esMejor = i === mejorIdx;
                                    const esUltimo = i === historial.length - 1;
                                    return (
                                        <div key={i} className="hrc-bar-wrap">
                                            <div className="hrc-bar-val">{Number(r.puntaje).toFixed(0)}</div>
                                            <div
                                                className={`hrc-bar ${esMejor ? "best" : esUltimo ? "latest" : ""}`}
                                                style={{ height: `${Math.max(pct, 6)}px` }}
                                            />
                                            <div className="hrc-bar-lbl">
                                                {new Date(r.fecha).toLocaleDateString("es-MX", { day: "2-digit", month: "short" })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="hrc-chart-legend">
                                <span><span className="hrc-legend-dot best" />Mejor puntaje</span>
                                <span><span className="hrc-legend-dot latest" />Último intento</span>
                                <span><span className="hrc-legend-dot" />Otros intentos</span>
                            </div>
                        </div>
                    </>
                )}

                {/* Tabla */}
                <div className="hrc-sec-title"><IoTimeOutline size={13} /> Todos los intentos</div>
                <div className="hrc-tl-card">
                    <table className="hrc-table">
                        <thead>
                            <tr>
                                <th></th>
                                <th>#</th>
                                <th>Puntaje</th>
                                <th>Nivel</th>
                                <th>Fecha</th>
                                <th>Duración</th>
                            </tr>
                        </thead>
                        <tbody>
                            {historial.map((r, i) => {
                                const esMejor = i === mejorIdx;
                                const esUltimo = i === historial.length - 1;
                                return (
                                    <tr key={i} className={esMejor ? "hrc-row-best" : ""}>
                                        <td>
                                            <div className={`hrc-dot ${esMejor ? "best" : esUltimo ? "latest" : ""}`} />
                                        </td>
                                        <td className="hrc-td-num">{i + 1}</td>
                                        <td>
                                            <div className="hrc-pb-wrap">
                                                <span className="hrc-pb-val">{Number(r.puntaje).toFixed(1)}</span>
                                                <div className="hrc-pb-bar">
                                                    <div className="hrc-pb-fill" style={{ width: `${Math.min(r.puntaje, 100)}%` }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`hrc-nivel-pill ${NIVEL_CLASS[r.nivel] || "n-sin-nivel"}`}>
                                                {r.nivel || "Sin nivel"}
                                            </span>
                                        </td>
                                        <td className="hrc-td-muted">
                                            {r.fecha
                                                ? new Date(r.fecha).toLocaleString("es-MX", {
                                                    day: "2-digit", month: "short", year: "numeric",
                                                    hour: "2-digit", minute: "2-digit", hour12: true,
                                                })
                                                : "—"}
                                        </td>
                                        <td className="hrc-td-muted">{r.duracion_minutos ? `${r.duracion_minutos} min` : "—"}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

            </main>
        </div>
    );
}