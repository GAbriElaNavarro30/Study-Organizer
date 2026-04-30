import { useState, useEffect, useRef } from "react";
import { 
    IoPerson,
    IoHappyOutline,
    IoBookOutline,
    IoGridOutline,
    IoSchoolOutline,
    IoWarningOutline,
    IoCheckmarkCircleOutline,
    IoAddOutline,
    IoTrendingUpOutline,
    IoLeafOutline,
    IoWaterOutline,
    IoFlameOutline,
    IoSparklesOutline,
    IoAlertCircleOutline,
    IoArrowUpOutline,
    IoArrowDownOutline,
    IoRemoveOutline,
} from "react-icons/io5";
import "../styles/dashboard.css";
import { ModalNuevaEmocion } from "../components/ModalNuevaEmocion";
import { ModalAlertaEspecialista } from "../components/ModalAlertaEspecialista";
import { useDashboard } from "../hooks/useDashboard";
import logo from "../assets/imagenes/logotipo.png";
import { CustomAlert } from "../components/CustomAlert";

/* ─── Paleta de colores para la dona ─── */
const DONA_COLORES = [
    "#38bdf8", "#0ea5e9", "#0284c7", "#7dd3fc",
    "#bae6fd", "#075985", "#0369a1", "#93c5fd",
    "#1e40af", "#e0f2fe",
];

const CLASIF_LABELS = {
    negativa: "Negativa",
    neutra: "Neutra",
    positiva: "Positiva",
};

const MESES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];


/* ══════════════════════════════════════════════════════════════
   COMPONENTE GAUGE KPI
══════════════════════════════════════════════════════════════ */

function GaugeKPI({ total, meta, filtroClasif }) {
    const svgRef = useRef(null);

    const superaMeta = total > meta;
    const alcanzaMeta = total === meta;
    const diff = Math.abs(total - meta);

    const interpretacion = (() => {
        if (filtroClasif === "positiva") {
            if (superaMeta) return { estado: "en-tendencia", icono: <IoArrowUpOutline size={13} />, badge: `Excelente — ${diff} registros extra sobre la meta` };
            if (alcanzaMeta) return { estado: "en-tendencia", icono: <IoCheckmarkCircleOutline size={13} />, badge: `Meta alcanzada exactamente` };
            return { estado: "fuera", icono: <IoArrowDownOutline size={13} />, badge: `Fuera de tendencia — faltan ${diff} registros` };
        }
        if (filtroClasif === "negativa") {
            if (superaMeta) return { estado: "alerta", icono: <IoAlertCircleOutline size={13} />, badge: `Alerta — ${diff} registros de más en emociones negativas` };
            if (alcanzaMeta) return { estado: "alerta", icono: <IoAlertCircleOutline size={13} />, badge: `Alerta — alcanzaste el límite de emociones negativas` };
            return { estado: "en-tendencia", icono: <IoCheckmarkCircleOutline size={13} />, badge: `Controlado — ${diff} registros por debajo de la meta` };
        }
        if (superaMeta) return { estado: "neutro-ok", icono: <IoArrowUpOutline size={13} />, badge: `Superado — ${diff} registros extra` };
        if (alcanzaMeta) return { estado: "neutro-ok", icono: <IoCheckmarkCircleOutline size={13} />, badge: `Meta alcanzada exactamente` };
        return { estado: "neutro-pend", icono: <IoRemoveOutline size={13} />, badge: `En progreso — faltan ${diff} registros` };
    })();

    const COLORES_ARCO = {
        "en-tendencia": { principal: "#38bdf8", exceso: "#16a34a" },
        "fuera": { principal: "#38bdf8", exceso: "#38bdf8" },
        "alerta": { principal: "#38bdf8", exceso: "#dc2626" },
        "neutro-ok": { principal: "#38bdf8", exceso: "#0369a1" },
        "neutro-pend": { principal: "#38bdf8", exceso: "#38bdf8" },
    };

    const COLORES_BADGE = {
        "en-tendencia": "gauge-badge--ok",
        "fuera": "gauge-badge--pend",
        "alerta": "gauge-badge--alerta",
        "neutro-ok": "gauge-badge--neutro",
        "neutro-pend": "gauge-badge--pend",
    };

    const coloresArco = COLORES_ARCO[interpretacion.estado];

    useEffect(() => {
        if (!svgRef.current) return;

        const svg = svgRef.current;
        const W = 280, H = 175;
        const cx = W / 2, cy = 148;
        const R = 110, r = 78;
        const DEG_MIN = 180, DEG_MAX = 0;

        const maxValor = Math.ceil(Math.max(meta * 1.5, total + 2, 10));

        const degToRad = d => (d * Math.PI) / 180;
        const valorAAngulo = val => DEG_MIN - Math.min(val / maxValor, 1) * 180;
        const polarToXY = (angleDeg, radio) => ({
            x: cx + radio * Math.cos(degToRad(angleDeg)),
            y: cy - radio * Math.sin(degToRad(angleDeg)),
        });

        const mk = (tag, attrs) => {
            const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
            Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
            return el;
        };

        while (svg.firstChild) svg.removeChild(svg.firstChild);
        svg.setAttribute("viewBox", `0 0 ${W} ${H}`);

        const anguloMeta = valorAAngulo(meta);
        const anguloActual = valorAAngulo(total);

        const bgPath = (() => {
            const s = degToRad(DEG_MIN), e = degToRad(DEG_MAX);
            return `M ${cx + R * Math.cos(s)} ${cy - R * Math.sin(s)}
                    A ${R} ${R} 0 0 1 ${cx + R * Math.cos(e)} ${cy - R * Math.sin(e)}
                    L ${cx + r * Math.cos(e)} ${cy - r * Math.sin(e)}
                    A ${r} ${r} 0 0 0 ${cx + r * Math.cos(s)} ${cy - r * Math.sin(s)} Z`;
        })();
        svg.appendChild(mk("path", { d: bgPath, fill: "#e2e8f0" }));

        const anguloHastaMenor = valorAAngulo(Math.min(total, meta));
        if (Math.min(total, meta) > 0) {
            const s = degToRad(DEG_MIN), e = degToRad(anguloHastaMenor);
            const largeArc = Math.abs(DEG_MIN - anguloHastaMenor) > 180 ? 1 : 0;
            svg.appendChild(mk("path", {
                d: `M ${cx + R * Math.cos(s)} ${cy - R * Math.sin(s)}
                    A ${R} ${R} 0 ${largeArc} 1 ${cx + R * Math.cos(e)} ${cy - R * Math.sin(e)}
                    L ${cx + r * Math.cos(e)} ${cy - r * Math.sin(e)}
                    A ${r} ${r} 0 ${largeArc} 0 ${cx + r * Math.cos(s)} ${cy - r * Math.sin(s)} Z`,
                fill: coloresArco.principal,
            }));
        }

        if (superaMeta || alcanzaMeta) {
            const s = degToRad(anguloMeta), e = degToRad(anguloActual);
            const largeArc = Math.abs(anguloMeta - anguloActual) > 180 ? 1 : 0;
            svg.appendChild(mk("path", {
                d: `M ${cx + R * Math.cos(s)} ${cy - R * Math.sin(s)}
                    A ${R} ${R} 0 ${largeArc} 1 ${cx + R * Math.cos(e)} ${cy - R * Math.sin(e)}
                    L ${cx + r * Math.cos(e)} ${cy - r * Math.sin(e)}
                    A ${r} ${r} 0 ${largeArc} 0 ${cx + r * Math.cos(s)} ${cy - r * Math.sin(s)} Z`,
                fill: coloresArco.exceso,
            }));
        }

        const mp1 = polarToXY(anguloMeta, r - 6);
        const mp2 = polarToXY(anguloMeta, R + 6);
        svg.appendChild(mk("line", {
            x1: mp1.x, y1: mp1.y, x2: mp2.x, y2: mp2.y,
            stroke: "#f59e0b", "stroke-width": "2.5", "stroke-dasharray": "4 3",
        }));

        const metaLbl = polarToXY(anguloMeta, R + 22);
        const anchorMeta = anguloMeta > 90 ? "end" : anguloMeta < 90 ? "start" : "middle";
        const metaTxt = mk("text", {
            x: metaLbl.x, y: metaLbl.y,
            "text-anchor": anchorMeta,
            "font-size": "10", fill: "#b45309", "font-weight": "600",
        });
        metaTxt.textContent = `Meta: ${meta}`;
        svg.appendChild(metaTxt);

        const agujaFin = polarToXY(anguloActual, R - 8);
        const agujaBase1 = polarToXY(anguloActual + 90, 6);
        const agujaBase2 = polarToXY(anguloActual - 90, 6);
        svg.appendChild(mk("polygon", {
            points: `${agujaFin.x},${agujaFin.y} ${agujaBase1.x},${agujaBase1.y} ${agujaBase2.x},${agujaBase2.y}`,
            fill: "#0369a1",
        }));
        svg.appendChild(mk("circle", { cx, cy, r: "7", fill: "#0369a1" }));

        const lblMin = mk("text", { x: cx - R - 2, y: cy + 14, "text-anchor": "end", "font-size": "10", fill: "#94a3b8" });
        lblMin.textContent = "0";
        svg.appendChild(lblMin);

        const lblMax = mk("text", { x: cx + R + 2, y: cy + 14, "text-anchor": "start", "font-size": "10", fill: "#94a3b8" });
        lblMax.textContent = maxValor;
        svg.appendChild(lblMax);

        const colorValor = {
            "en-tendencia": "#16a34a",
            "fuera": "#0369a1",
            "alerta": "#dc2626",
            "neutro-ok": "#0369a1",
            "neutro-pend": "#0369a1",
        }[interpretacion.estado];

        const valTxt = mk("text", {
            x: cx, y: cy - 18,
            "text-anchor": "middle", "font-size": "26", "font-weight": "700",
            fill: colorValor,
        });
        valTxt.textContent = total;
        svg.appendChild(valTxt);

        const valSub = mk("text", {
            x: cx, y: cy - 4,
            "text-anchor": "middle", "font-size": "10", fill: "#94a3b8",
        });
        valSub.textContent = "registros";
        svg.appendChild(valSub);

    }, [total, meta, filtroClasif]);

    return (
        <div className="gauge-wrap">
            <svg ref={svgRef} className="gauge-svg" />
            <div className="gauge-footer">
                <span className={`gauge-badge ${COLORES_BADGE[interpretacion.estado]}`}>
                    <span style={{ marginRight: 5, display: "inline-flex", alignItems: "center" }}>
                        {interpretacion.icono}
                    </span>
                    {interpretacion.badge}
                </span>
            </div>
        </div>
    );
}


/* ══════════════════════════════════════════════════════════════
   COMPONENTE DONA
══════════════════════════════════════════════════════════════ */

function DonaEmociones({ historial }) {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);
    const [filtroEmo, setFiltroEmo] = useState("");
    const [filtroMes, setFiltroMes] = useState("");
    const [filtroAnio, setFiltroAnio] = useState("");
    const [filtroNivel, setFiltroNivel] = useState("");
    const [filtroClasif, setFiltroClasif] = useState("");

    const META_KEY = "dona_meta";
    const [metaInput, setMetaInput] = useState("");
    const [metaGuardada, setMetaGuardada] = useState(null);
    const [editandoMeta, setEditandoMeta] = useState(false);

    useEffect(() => {
        const guardada = localStorage.getItem(META_KEY);
        if (guardada !== null) {
            const num = parseInt(guardada, 10);
            if (!isNaN(num) && num > 0) setMetaGuardada(num);
        }
    }, []);

    const guardarMeta = () => {
        const num = parseInt(metaInput, 10);
        if (isNaN(num) || num <= 0) return;
        localStorage.setItem(META_KEY, String(num));
        setMetaGuardada(num);
        setMetaInput("");
        setEditandoMeta(false);
    };

    const eliminarMeta = () => {
        localStorage.removeItem(META_KEY);
        setMetaGuardada(null);
        setEditandoMeta(false);
        setMetaInput("");
    };

    const aniosDisponibles = [...new Set(historial.map(h => new Date(h.fecha).getFullYear()))].sort();
    const emocionesDisponibles = [...new Set(historial.map(h => h.emo))].sort();

    const datosFiltrados = historial.filter(h => {
        const d = new Date(h.fecha);
        if (filtroEmo && h.emo !== filtroEmo) return false;
        if (filtroMes !== "" && d.getMonth() !== Number(filtroMes)) return false;
        if (filtroAnio && d.getFullYear() !== Number(filtroAnio)) return false;
        if (filtroNivel && h.nivel !== filtroNivel) return false;
        if (filtroClasif && h.clasif !== filtroClasif) return false;
        return true;
    });

    const conteos = {};
    datosFiltrados.forEach(h => { conteos[h.emo] = (conteos[h.emo] || 0) + 1; });
    const entradas = Object.entries(conteos).sort((a, b) => b[1] - a[1]);
    const total = datosFiltrados.length;
    const dominante = entradas[0]?.[0] || "—";
    const positivas = datosFiltrados.filter(h => h.clasif === "positiva").length;
    const dificiles = datosFiltrados.filter(h => h.clasif === "negativa").length;

    useEffect(() => {
        if (!canvasRef.current) return;
        if (typeof window.Chart === "undefined") return;
        if (chartRef.current) { chartRef.current.destroy(); }
        if (total === 0) return;

        const labels = entradas.map(e => e[0]);
        const values = entradas.map(e => e[1]);
        const colors = labels.map((_, i) => DONA_COLORES[i % DONA_COLORES.length]);

        chartRef.current = new window.Chart(canvasRef.current, {
            type: "doughnut",
            data: {
                labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors,
                    borderColor: "#ffffff",
                    borderWidth: 3,
                    hoverOffset: 6,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "68%",
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: ctx => {
                                const pct = Math.round(ctx.parsed / total * 100);
                                return ` ${ctx.label}: ${ctx.parsed} (${pct}%)`;
                            },
                        },
                    },
                },
            },
        });

        return () => { if (chartRef.current) chartRef.current.destroy(); };
    }, [filtroEmo, filtroMes, filtroAnio, filtroNivel, filtroClasif, historial]);

    return (
        <div className="dona-card">

            <div className="dona-gauge-section">
                <div className="dona-gauge-header">
                    <span className="dona-gauge-titulo">
                        <IoTrendingUpOutline size={14} style={{ marginRight: 5 }} />
                        KPI de tendencia
                    </span>
                    {metaGuardada && !editandoMeta && (
                        <div style={{ display: "flex", gap: 10 }}>
                            <button className="dona-meta-btn-link" onClick={() => { setMetaInput(String(metaGuardada)); setEditandoMeta(true); }}>Editar meta</button>
                            <button className="dona-meta-btn-link dona-meta-btn-link--danger" onClick={eliminarMeta}>Quitar</button>
                        </div>
                    )}
                </div>

                {!metaGuardada && !editandoMeta && (
                    <div className="dona-gauge-empty">
                        <p>Define una meta de registros para ver el indicador de tendencia.</p>
                        <button className="dona-meta-set-btn" onClick={() => setEditandoMeta(true)}>
                            + Establecer meta
                        </button>
                    </div>
                )}

                {editandoMeta && (
                    <div className="dona-meta-form" style={{ marginTop: 8 }}>
                        <input
                            type="number"
                            min="1"
                            placeholder="Ej. 20"
                            value={metaInput}
                            onChange={e => setMetaInput(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && guardarMeta()}
                            className="dona-meta-input"
                            autoFocus
                        />
                        <span className="dona-meta-form-label">registros</span>
                        <button className="dona-meta-confirm-btn" onClick={guardarMeta}>Guardar</button>
                        <button className="dona-meta-cancel-btn" onClick={() => { setEditandoMeta(false); setMetaInput(""); }}>Cancelar</button>
                    </div>
                )}

                {metaGuardada && !editandoMeta && (
                    <GaugeKPI total={total} meta={metaGuardada} filtroClasif={filtroClasif} />
                )}
            </div>

            <div className="dona-header">
                <div>
                    <h3 className="sec-title">Registro emocional</h3>
                    <p className="sec-sub">Distribución de emociones según los filtros seleccionados</p>
                </div>
            </div>

            <div className="dona-filtros">
                <select value={filtroEmo} onChange={e => setFiltroEmo(e.target.value)}>
                    <option value="">Todas las emociones</option>
                    {emocionesDisponibles.map(emo => (
                        <option key={emo} value={emo}>{emo}</option>
                    ))}
                </select>
                <select value={filtroClasif} onChange={e => setFiltroClasif(e.target.value)}>
                    <option value="">Todas las categorías</option>
                    <option value="positiva">Positiva</option>
                    <option value="neutra">Neutra</option>
                    <option value="negativa">Negativa</option>
                </select>
                <select value={filtroNivel} onChange={e => setFiltroNivel(e.target.value)}>
                    <option value="">Todos los niveles</option>
                    <option value="bajo">Bajo</option>
                    <option value="medio">Medio</option>
                    <option value="alto">Alto</option>
                    <option value="critico">Crítico</option>
                </select>
                <select value={filtroMes} onChange={e => setFiltroMes(e.target.value)}>
                    <option value="">Todos los meses</option>
                    {MESES.map((m, i) => (
                        <option key={i} value={i}>{m}</option>
                    ))}
                </select>
                <select value={filtroAnio} onChange={e => setFiltroAnio(e.target.value)}>
                    <option value="">Todos los años</option>
                    {aniosDisponibles.map(a => (
                        <option key={a}>{a}</option>
                    ))}
                </select>
            </div>

            {total === 0 ? (
                <div className="dona-empty">No hay registros para los filtros seleccionados.</div>
            ) : (
                <div className="dona-body">
                    <div className="dona-wrap">
                        <canvas
                            ref={canvasRef}
                            role="img"
                            aria-label={`Gráfica de dona. Total ${total} registros. Dominante: ${dominante}.`}
                        >
                            {entradas.map(e => `${e[0]}: ${e[1]}`).join(", ")}
                        </canvas>
                        <div className="dona-center">
                            <span className="dona-center-num">{total}</span>
                            <span className="dona-center-label">registros</span>
                        </div>
                    </div>
                    <div className="dona-legend">
                        {entradas.map((e, i) => {
                            const pct = Math.round(e[1] / total * 100);
                            return (
                                <div className="dona-leg-row" key={e[0]}>
                                    <span className="dona-leg-dot" style={{ background: DONA_COLORES[i % DONA_COLORES.length] }} />
                                    <div className="dona-leg-info">
                                        <span className="dona-leg-name">{e[0]}</span>
                                        <div className="dona-leg-track">
                                            <div className="dona-leg-fill" style={{ width: `${pct}%`, background: DONA_COLORES[i % DONA_COLORES.length] }} />
                                        </div>
                                    </div>
                                    <span className="dona-leg-count">{e[1]} <span className="dona-leg-pct">({pct}%)</span></span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="dona-kpis">
                <div className="dona-kpi-item">
                    <span className="dona-kpi-label">Total registros</span>
                    <span className="dona-kpi-val">{total}</span>
                </div>
                <div className="dona-kpi-item">
                    <span className="dona-kpi-label">Emoción dominante</span>
                    <span className="dona-kpi-val dona-kpi-val--sm">{dominante}</span>
                </div>
                <div className="dona-kpi-item">
                    <span className="dona-kpi-label">Positivas / Neutras / Negativas</span>
                    <span className="dona-kpi-val dona-kpi-val--sm">
                        {positivas} ({total ? Math.round(positivas / total * 100) : 0}%)
                        {" · "}
                        {datosFiltrados.filter(h => h.clasif === "neutra").length} ({total ? Math.round(datosFiltrados.filter(h => h.clasif === "neutra").length / total * 100) : 0}%)
                        {" · "}
                        {dificiles} ({total ? Math.round(dificiles / total * 100) : 0}%)
                    </span>
                </div>
            </div>
        </div>
    );
}


/* ══════════════════════════════════════════════════════════════
   VISTA SEMANAL
══════════════════════════════════════════════════════════════ */
function VistaSemanal({ historial }) {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);
    const hoy = new Date();

    const ultimos7 = Array.from({ length: 7 }, (_, i) => {
        const fecha = new Date(hoy);
        fecha.setDate(hoy.getDate() - (6 - i));
        const key = fecha.toLocaleDateString("sv-SE", { timeZone: "America/Mexico_City" });
        const diaSemana = fecha.toLocaleDateString("es-MX", {
            weekday: "short",
            timeZone: "America/Mexico_City",
        });
        const diaLabel = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1).replace(".", "");
        const reg = historial.find(h => h.fecha === key);
        return { dia: diaLabel, fecha: key, reg };
    });

    const nivelANum = { bajo: 1, medio: 2, alto: 3, critico: 4 };
    const NIVEL_COLORES = {
        positiva: "#a8e6cf",
        negativa: "#ffd6e0",
        neutra: "#fff5a0",
    };

    useEffect(() => {
        if (!canvasRef.current || typeof window.Chart === "undefined") return;
        if (chartRef.current) chartRef.current.destroy();

        const labels = ultimos7.map(d => d.dia);
        const valores = ultimos7.map(d => d.reg ? (nivelANum[d.reg.nivel] ?? 2) : 0);
        const colores = ultimos7.map(d =>
            d.reg ? (NIVEL_COLORES[d.reg.clasif] ?? "#e2e8f0") : "#eff6ff"
        );

        chartRef.current = new window.Chart(canvasRef.current, {
            type: "bar",
            data: {
                labels,
                datasets: [{
                    label: "Intensidad",
                    data: valores,
                    backgroundColor: colores,
                    borderRadius: 6,
                    borderSkipped: false,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        min: 0,
                        max: 4,
                        ticks: {
                            stepSize: 1,
                            callback: v => ["", "Bajo", "Medio", "Alto", "Crítico"][v] ?? "",
                            color: "#64748b",
                            font: { size: 11 },
                        },
                        grid: { color: "#f1f5f9" },
                        border: { display: false },
                    },
                    x: {
                        ticks: { color: "#64748b", font: { size: 12 } },
                        grid: { display: false },
                        border: { display: false },
                    },
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: ctx => {
                                const d = ultimos7[ctx.dataIndex];
                                if (!d.reg) return " Sin registro";
                                const nivel = ["", "Bajo", "Medio", "Alto", "Crítico"][ctx.parsed.y] ?? "";
                                return ` ${d.reg.emo} · ${nivel}`;
                            },
                        },
                    },
                },
            },
        });

        return () => { if (chartRef.current) chartRef.current.destroy(); };
    }, [historial]);

    return (
        <div className="semana-section">
            <h4 className="sec-title-sm">Últimos 7 días</h4>
            <div className="semana-leyenda">
                {Object.entries(NIVEL_COLORES).map(([clasif, color]) => (
                    <span key={clasif} className="semana-ley-item">
                        <span className="semana-ley-dot" style={{ background: color }} />
                        {clasif.charAt(0).toUpperCase() + clasif.slice(1)}
                    </span>
                ))}
            </div>
            <div style={{ position: "relative", width: "100%", height: "180px" }}>
                <canvas
                    ref={canvasRef}
                    role="img"
                    aria-label="Gráfico de barras con intensidad emocional de los últimos 7 días"
                >
                    {ultimos7.map(d => d.reg
                        ? `${d.dia}: ${d.reg.emo} (${d.reg.nivel})`
                        : `${d.dia}: sin registro`
                    ).join(", ")}
                </canvas>
            </div>
        </div>
    );
}


/* ══════════════════════════════════════════════════════════════
   DASHBOARD PRINCIPAL
══════════════════════════════════════════════════════════════ */
export function Dashboard() {
    const {
        usuario,
        modalOtraVisible,
        setModalOtraVisible,
        pendienteRegistro,
        setPendienteRegistro,
        emocionSeleccionada,
        emociones,
        historial,
        fraseHoy,
        vark,
        estudio,
        cargandoVark,
        cargandoMe,
        cursosEstudiante,
        alertasEspecialista,
        mostrarAlertaEspecialista,
        emocionHoy,
        seleccionarEmocion,
        confirmarRegistro,
        handleNuevaEmocionGuardada,
        cerrarAlertaEspecialista,
        alertData,
        handleCloseAlert,
    } = useDashboard();

    return (
        <main className="dashboard-container">

            {/* ── PERFIL ── */}
            <section className="perfil-card">
                <div className="perfil-avatar">
                    {usuario?.foto_perfil
                        ? <img src={usuario.foto_perfil} alt="Foto de perfil" />
                        : <IoPerson size={38} color="#0ea5e9" />
                    }
                </div>
                <div className="perfil-info">
                    <h2>Bienvenid@, {usuario?.nombre ?? "Sofía"} {usuario?.apellido ?? "Martínez"}</h2>
                    <span className="perfil-rol">{usuario?.rol_texto ?? "Estudiante"}</span>
                    <p className="perfil-desc">{usuario?.descripcion ?? ""}</p>
                </div>
            </section>

            <section className="frase-estatica">
                <span className="frase-comilla">"</span>
                <p>
                    Disfruta de tu experiencia con Study Organizer, un espacio diseñado para ti, con calma, organización y claridad.
                </p>
            </section>

            {/* ── REGISTRO DE EMOCIONES ── */}
            <section className="card" id="emociones-section">
                <div className="sec-title">
                    <IoHappyOutline size={17} style={{ marginRight: 6 }} />
                    ¿Cómo te sientes hoy?
                </div>
                <p className="sec-sub">Selecciona la opción que mejor describa tu estado emocional — solo una emoción por día</p>

                {emocionHoy ? (
                    <div className="emocion-registrada">
                        <IoCheckmarkCircleOutline size={18} color="#0ea5e9" />
                        <span>
                            Ya realizaste tu registro de hoy:{" "}
                            <strong>{emocionHoy.emo}</strong>{" "}
                            <span className={`clasif-tag clasif-tag--${emocionHoy.clasif}`}>
                                {CLASIF_LABELS[emocionHoy.clasif]}
                            </span>
                            {emocionHoy.nivel && (
                                <span className={`clasif-tag clasif-tag--nivel-${emocionHoy.nivel}`}>
                                    {emocionHoy.nivel.charAt(0).toUpperCase() + emocionHoy.nivel.slice(1)}
                                </span>
                            )}
                        </span>
                    </div>
                ) : (
                    <>
                        <div className="chips-container">
                            {emociones.map((e, i) => (
                                <button
                                    key={i}
                                    className={`chip ${emocionSeleccionada === e.label ? "chip--active" : ""}`}
                                    onClick={() => seleccionarEmocion(e.id_emocion, e.label, e.clasif)}
                                >
                                    {e.label}
                                </button>
                            ))}
                            <button
                                className="chip chip--otro"
                                onClick={() => setModalOtraVisible(true)}
                            >
                                <IoAddOutline size={14} style={{ marginRight: 4 }} />
                                Otra
                            </button>
                        </div>

                        {pendienteRegistro && (
                            <div className="nivel-selector">
                                <p className="nivel-selector-titulo">
                                    ¿Con qué intensidad te sientes <strong>{pendienteRegistro.label}</strong>?
                                </p>
                                <div className="nivel-selector-opciones">
                                    {[
                                        { value: "bajo", label: "Bajo", desc: "Apenas perceptible", Icon: IoLeafOutline },
                                        { value: "medio", label: "Medio", desc: "Notablemente presente", Icon: IoWaterOutline },
                                        { value: "alto", label: "Alto", desc: "Muy intenso", Icon: IoFlameOutline },
                                        ...(pendienteRegistro.clasif === "negativa"
                                            ? [{ value: "critico", label: "Crítico", desc: "Abrumador", Icon: IoWarningOutline }]
                                            : []
                                        ),
                                    ].map(n => (
                                        <button
                                            key={n.value}
                                            className="nivel-selector-btn"
                                            onClick={() => confirmarRegistro(n.value)}
                                        >
                                            <n.Icon size={22} />
                                            <span className="nivel-selector-label">{n.label}</span>
                                            <span className="nivel-selector-desc">{n.desc}</span>
                                        </button>
                                    ))}
                                </div>
                                <button
                                    className="nivel-selector-cancelar"
                                    onClick={() => setPendienteRegistro(null)}
                                >
                                    Cancelar
                                </button>
                            </div>
                        )}
                    </>
                )}
            </section>

            {/* ── REFLEXIÓN DEL DÍA ── */}
            {emocionHoy && fraseHoy && (
                <section className="card reflexion-card">
                    <div className="reflexion-header">
                        <div className="reflexion-icon">
                            <IoSparklesOutline size={14} color="#0ea5e9" />
                        </div>
                        <span className="reflexion-label">Mensaje para ti</span>
                    </div>
                    <p className="reflexion-texto">"{fraseHoy}"</p>
                </section>
            )}

            {/* ── VISTA SEMANAL ── */}
            <section className="card">
                <VistaSemanal historial={historial} />
            </section>

            {/* ── KPI DONA ── */}
            <DonaEmociones historial={historial} />

            {/* ── ALERTAS DE ESPECIALISTA ── */}
            {alertasEspecialista.length > 0 && (
                <section className="card alertas-card">
                    <h3 className="sec-title">
                        <IoWarningOutline size={17} style={{ marginRight: 6 }} color="#f59e0b" />
                        Momentos que merecen atención
                    </h3>
                    <p className="sec-sub">
                        Estos son los periodos en los que tu bienestar emocional estuvo más comprometido.
                    </p>
                    <div className="alertas-list">
                        {alertasEspecialista.map(a => (
                            <div
                                key={a.id_alerta}
                                className={`alerta-row ${!a.vista ? "alerta-row--nueva" : ""}`}
                            >
                                <div className="alerta-row-icono">
                                    <IoWarningOutline size={16} color={a.vista ? "#94a3b8" : "#f59e0b"} />
                                </div>
                                <div className="alerta-row-info">
                                    <span className="alerta-row-fecha">
                                        {new Date(a.fecha_alerta).toLocaleDateString("es-MX", {
                                            day: "2-digit",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </span>
                                    <span className="alerta-row-desc">
                                        {a.dias_consecutivos} días consecutivos de alta intensidad emocional
                                    </span>
                                </div>
                                {!a.vista && <span className="alerta-row-badge">Nueva</span>}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ── RESULTADOS DE TESTS ── */}
            <section className="card">
                <h3 className="sec-title">
                    <IoBookOutline size={17} style={{ marginRight: 6 }} />
                    Resultados de evaluaciones
                </h3>

                <div className="tests-layout">
                    <div className="tests-col-left">

                        {/* VARK */}
                        <div className="test-card">
                            <div className="test-card-header">
                                <IoGridOutline size={14} color="#0ea5e9" />
                                <span>Test VARK</span>
                            </div>
                            {cargandoVark ? (
                                <p className="test-sin">Cargando resultado...</p>
                            ) : vark ? (
                                <>
                                    <div className="test-resultado">{vark.resultado}</div>
                                    <div className="test-fecha">{vark.fecha}</div>
                                    <div className="test-barras">
                                        {Object.entries(vark.detalle).map(([k, v]) => (
                                            <div key={k}>
                                                <div className="test-barra-label">
                                                    <span>{k.charAt(0).toUpperCase() + k.slice(1)}</span>
                                                    <span>{v}%</span>
                                                </div>
                                                <div className="barra-track">
                                                    <div className="barra-fill" style={{ width: `${v}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <p className="test-sin">Sin realizar</p>
                            )}
                        </div>

                        {/* CURSOS */}
                        <div className="test-card">
                            <div className="test-card-header">
                                <IoSchoolOutline size={14} color="#0ea5e9" />
                                <span>Último puntaje por curso</span>
                            </div>
                            <div className="cursos-list">
                                {cursosEstudiante.length === 0 ? (
                                    <p className="test-sin">No estás inscrito en ningún curso aún.</p>
                                ) : (
                                    cursosEstudiante.map((c) => (
                                        <div key={c.id_curso} className="curso-row">
                                            <span className="curso-nombre">{c.titulo}</span>
                                            <span className={`curso-nivel nivel-${c.nivel ?? "sin"}`}>
                                                {c.nivel ?? "Sin completar"}
                                            </span>
                                            <span className="curso-puntaje">
                                                {c.puntaje != null
                                                    ? <>{Math.round(c.puntaje)}<span className="curso-max">/100</span></>
                                                    : <span className="curso-max">—</span>
                                                }
                                            </span>
                                            <div className="barra-track curso-barra">
                                                <div className="barra-fill" style={{ width: `${c.puntaje ?? 0}%` }} />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>

                    <div className="tests-col-right">
                        <div className="test-card test-card--tall">
                            <div className="test-card-header">
                                <IoGridOutline size={14} color="#0ea5e9" />
                                <span>Métodos de estudio</span>
                            </div>
                            {cargandoMe ? (
                                <p className="test-sin">Cargando resultado...</p>
                            ) : estudio ? (
                                <>
                                    <div className="test-resultado">{estudio.resultado}</div>
                                    <div className="test-fecha">{estudio.fecha}</div>
                                    <div className="test-global-wrap">
                                        <span className="test-compat-label">Puntaje global</span>
                                        <span className="test-compat-pct">{estudio.compatibilidad}%</span>
                                        <div className="barra-track">
                                            <div className="barra-fill" style={{ width: `${estudio.compatibilidad}%` }} />
                                        </div>
                                    </div>
                                    {estudio.dimensiones?.length > 0 && (
                                        <div className="test-barras">
                                            {estudio.dimensiones.map((d) => (
                                                <div key={d.id_dimension ?? d.nombre_dimension}>
                                                    <div className="test-barra-label">
                                                        <span>{d.nombre_dimension}</span>
                                                        <span>{Math.round(d.puntaje)}%</span>
                                                    </div>
                                                    <div className="barra-track">
                                                        <div className="barra-fill" style={{ width: `${Math.round(d.puntaje)}%` }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="test-sin">Sin realizar</p>
                            )}
                        </div>
                    </div>

                </div>
            </section>

            <ModalNuevaEmocion
                visible={modalOtraVisible}
                onClose={() => setModalOtraVisible(false)}
                onGuardar={handleNuevaEmocionGuardada}
            />

            <ModalAlertaEspecialista
                visible={mostrarAlertaEspecialista}
                onClose={cerrarAlertaEspecialista}
            />

            {alertData.visible && (
                <CustomAlert
                    type={alertData.type}
                    title={alertData.title}
                    message={alertData.message}
                    logo={logo}
                    onClose={handleCloseAlert}
                />
            )}

        </main>
    );
}