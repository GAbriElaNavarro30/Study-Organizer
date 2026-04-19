import { useState, useEffect, useRef, useCallback, useLayoutEffect } from "react";
import api from "../services/api";

const META_KEY = "ikpi_inscripciones_meta";

const VARK_ORDER = ['V','A','R','K','VA','VR','VK','AR','AK','RK','VAR','VAK','VRK','ARK','VARK'];
const MESES = [
    { valor: "1", label: "Enero" },    { valor: "2", label: "Febrero" },
    { valor: "3", label: "Marzo" },    { valor: "4", label: "Abril" },
    { valor: "5", label: "Mayo" },     { valor: "6", label: "Junio" },
    { valor: "7", label: "Julio" },    { valor: "8", label: "Agosto" },
    { valor: "9", label: "Septiembre" },{ valor: "10", label: "Octubre" },
    { valor: "11", label: "Noviembre" },{ valor: "12", label: "Diciembre" },
];

function dibujarGauge(svgEl, total, meta) {
    if (!svgEl) return;
    while (svgEl.firstChild) svgEl.removeChild(svgEl.firstChild);

    const cx = 150, cy = 155, R = 110, r = 78;
    const mk = (tag, attrs) => {
        const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
        Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
        return el;
    };
    const toRad = d => d * Math.PI / 180;
    const maxVal = meta
        ? Math.ceil(Math.max(meta * 1.5, total + 2, 10))
        : Math.max(total * 1.5, 10, 1);
    const angFor = v => 180 - Math.min(v / maxVal, 1) * 180;
    const pt = (a, rad) => ({
        x: cx + rad * Math.cos(toRad(a)),
        y: cy - rad * Math.sin(toRad(a)),
    });

    // Arco fondo
    svgEl.appendChild(mk("path", {
        d: `M${cx - R} ${cy} A${R} ${R} 0 0 1 ${cx + R} ${cy} L${cx + r} ${cy} A${r} ${r} 0 0 0 ${cx - r} ${cy} Z`,
        fill: "#e2e8f0",
    }));

    const angAct = angFor(total);

    if (total > 0) {
        const angFill = meta ? angFor(Math.min(total, meta)) : angAct;
        const s = toRad(180), e = toRad(angFill);
        const la = Math.abs(180 - angFill) > 180 ? 1 : 0;
        svgEl.appendChild(mk("path", {
            d: `M${cx + R * Math.cos(s)} ${cy - R * Math.sin(s)} A${R} ${R} 0 ${la} 1 ${cx + R * Math.cos(e)} ${cy - R * Math.sin(e)} L${cx + r * Math.cos(e)} ${cy - r * Math.sin(e)} A${r} ${r} 0 ${la} 0 ${cx + r * Math.cos(s)} ${cy - r * Math.sin(s)} Z`,
            fill: "#378ADD",
        }));

        if (meta && total > meta) {
            const angMeta = angFor(meta);
            const s2 = toRad(angMeta), e2 = toRad(angAct);
            const la2 = Math.abs(angMeta - angAct) > 180 ? 1 : 0;
            svgEl.appendChild(mk("path", {
                d: `M${cx + R * Math.cos(s2)} ${cy - R * Math.sin(s2)} A${R} ${R} 0 ${la2} 1 ${cx + R * Math.cos(e2)} ${cy - R * Math.sin(e2)} L${cx + r * Math.cos(e2)} ${cy - r * Math.sin(e2)} A${r} ${r} 0 ${la2} 0 ${cx + r * Math.cos(s2)} ${cy - r * Math.sin(s2)} Z`,
                fill: "#16a34a",
            }));
        }
    }

    if (meta) {
        const angM = angFor(meta);
        const mp1 = pt(angM, r - 6), mp2 = pt(angM, R + 6);
        svgEl.appendChild(mk("line", {
            x1: mp1.x, y1: mp1.y, x2: mp2.x, y2: mp2.y,
            stroke: "#f59e0b", "stroke-width": "2.5", "stroke-dasharray": "4 3",
        }));
        const ml = pt(angM, R + 20);
        const anchor = angM > 92 ? "end" : angM < 88 ? "start" : "middle";
        const mt = mk("text", {
            x: ml.x, y: ml.y,
            "text-anchor": anchor, "font-size": "10",
            fill: "#b45309", "font-weight": "500",
        });
        mt.textContent = `Meta: ${meta}`;
        svgEl.appendChild(mt);
    }

    const af = pt(angAct, R - 8), ab1 = pt(angAct + 90, 6), ab2 = pt(angAct - 90, 6);
    svgEl.appendChild(mk("polygon", {
        points: `${af.x},${af.y} ${ab1.x},${ab1.y} ${ab2.x},${ab2.y}`,
        fill: "#0369a1",
    }));
    svgEl.appendChild(mk("circle", { cx, cy, r: "7", fill: "#0369a1" }));

    const lMin = mk("text", { x: cx - R - 2, y: cy + 14, "text-anchor": "end", "font-size": "10", fill: "#94a3b8" });
    lMin.textContent = "0";
    svgEl.appendChild(lMin);
    const lMax = mk("text", { x: cx + R + 2, y: cy + 14, "text-anchor": "start", "font-size": "10", fill: "#94a3b8" });
    lMax.textContent = Math.round(maxVal);
    svgEl.appendChild(lMax);

    const vColor = meta ? (total >= meta ? "#16a34a" : "#0369a1") : "#0369a1";
    const vt = mk("text", {
        x: cx, y: cy - 20,
        "text-anchor": "middle", "font-size": "28", "font-weight": "500", fill: vColor,
    });
    vt.textContent = total;
    svgEl.appendChild(vt);
    const vs = mk("text", {
        x: cx, y: cy - 5,
        "text-anchor": "middle", "font-size": "10", fill: "#94a3b8",
    });
    vs.textContent = "inscripciones";
    svgEl.appendChild(vs);
}

export function InscripcionesKPI({ cursosTutor = [], dimensiones = [] }) {
    const svgRef = useRef(null);

    const [meta, setMeta] = useState(() => {
        const s = localStorage.getItem(META_KEY);
        const n = parseInt(s, 10);
        return (!isNaN(n) && n > 0) ? n : null;
    });
    const [editando, setEditando] = useState(false);
    const [metaInput, setMetaInput] = useState("");
    const [total, setTotal] = useState(0);
    const [cargando, setCargando] = useState(false);

    const [filtros, setFiltros] = useState({
        id_curso: "todos",
        perfil_vark: "todos",
        id_dimension: "todos",
        anio: "todos",
        mes: "todos",
    });

    const setFiltro = (k, v) =>
        setFiltros(prev => ({
            ...prev,
            [k]: v,
            ...(k === "anio" ? { mes: "todos" } : {}),
        }));

    const fetchTotal = useCallback(async (f) => {
        setCargando(true);
        try {
            const params = new URLSearchParams();
            Object.entries(f).forEach(([k, v]) => { if (v !== "todos") params.append(k, v); });
            const res = await api.get(`/cursos/estadisticas-tutor/inscripciones?${params}`);
            setTotal(res.data.total ?? 0);
        } catch (e) {
            console.error("InscripcionesKPI fetch:", e);
            setTotal(0);
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => { fetchTotal(filtros); }, [filtros, fetchTotal]);

    useLayoutEffect(() => {
        dibujarGauge(svgRef.current, total, meta);
    }, [total, meta]);

    const guardarMeta = () => {
        const n = parseInt(metaInput, 10);
        if (!isNaN(n) && n > 0) {
            localStorage.setItem(META_KEY, String(n));
            setMeta(n);
            setEditando(false);
            setMetaInput("");
        }
    };

    const eliminarMeta = () => {
        localStorage.removeItem(META_KEY);
        setMeta(null);
        setEditando(false);
    };

    const diff = meta != null ? total - meta : null;

    const badgeClass = meta == null
        ? "gauge-badge gauge-badge--pend"
        : total >= meta
            ? "gauge-badge gauge-badge--ok"
            : "gauge-badge gauge-badge--alerta";

    const badgeText = meta == null
        ? "Define una meta para activar el indicador"
        : total >= meta
            ? `Meta alcanzada${diff > 0 ? ` · +${diff} extra` : ""}`
            : `Faltan ${Math.abs(diff)} inscripciones para la meta`;

    const aniosDisponibles = Array.from(
        { length: new Date().getFullYear() - 2022 },
        (_, i) => 2023 + i
    );

    return (
        <div className="ikpi-card">
            <p className="ikpi-title">KPI de inscripciones</p>
            <p className="ikpi-subtitle">
                Filtra y establece una meta para monitorear el ritmo de inscripciones en tus cursos.
            </p>

            {/* ── Filtros ─────────────────────────────────── */}
            {/* Sin className en cada select — los estiliza .ikpi-filters select del CSS */}
            <div className="ikpi-filters">
                <select
                    value={filtros.id_curso}
                    onChange={e => setFiltro("id_curso", e.target.value)}
                >
                    <option value="todos">Todos los cursos</option>
                    {cursosTutor.map(c => (
                        <option key={c.id_curso} value={c.id_curso}>{c.titulo}</option>
                    ))}
                </select>

                <select
                    value={filtros.perfil_vark}
                    onChange={e => setFiltro("perfil_vark", e.target.value)}
                >
                    <option value="todos">Todos los perfiles</option>
                    {VARK_ORDER.map(p => <option key={p} value={p}>{p}</option>)}
                </select>

                <select
                    value={filtros.id_dimension}
                    onChange={e => setFiltro("id_dimension", e.target.value)}
                >
                    <option value="todos">Todas las dimensiones</option>
                    {dimensiones.map(d => (
                        <option key={d.id_dimension} value={d.id_dimension}>
                            {d.nombre_dimension}
                        </option>
                    ))}
                </select>

                <select
                    value={filtros.anio}
                    onChange={e => setFiltro("anio", e.target.value)}
                >
                    <option value="todos">Todos los años</option>
                    {aniosDisponibles.map(a => <option key={a} value={a}>{a}</option>)}
                </select>

                <select
                    value={filtros.mes}
                    onChange={e => setFiltro("mes", e.target.value)}
                    disabled={filtros.anio === "todos"}
                >
                    <option value="todos">Todos los meses</option>
                    {MESES.map(m => <option key={m.valor} value={m.valor}>{m.label}</option>)}
                </select>
            </div>

            {/* ── Meta ────────────────────────────────────── */}
            {!editando ? (
                <div className="ikpi-meta-row">
                    {meta ? (
                        <>
                            <span style={{ fontSize: 12, color: "#64748B" }}>
                                Meta: <strong style={{ color: "#0F172A" }}>{meta}</strong>
                            </span>
                            <button
                                className="ikpi-btn-link"
                                onClick={() => { setMetaInput(String(meta)); setEditando(true); }}
                            >
                                Editar
                            </button>
                            <button
                                className="ikpi-btn-link ikpi-btn-link--danger"
                                onClick={eliminarMeta}
                            >
                                Quitar
                            </button>
                        </>
                    ) : (
                        <button
                            className="filtros-limpiar-btn"
                            style={{ marginTop: 0 }}
                            onClick={() => { setMetaInput(""); setEditando(true); }}
                        >
                            + Establecer meta
                        </button>
                    )}
                </div>
            ) : (
                <div className="ikpi-meta-row">
                    <input
                        type="number"
                        min="1"
                        placeholder="Ej. 50"
                        value={metaInput}
                        onChange={e => setMetaInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && guardarMeta()}
                        className="dona-meta-input"
                        autoFocus
                    />
                    <span style={{ fontSize: 12, color: "#64748B", whiteSpace: "nowrap" }}>
                        inscripciones
                    </span>
                    <button
                        className="filtros-limpiar-btn"
                        style={{ marginTop: 0, width: "auto" }}
                        onClick={guardarMeta}
                    >
                        Guardar
                    </button>
                    <button
                        className="filtros-limpiar-btn"
                        style={{ marginTop: 0, width: "auto" }}
                        onClick={() => { setEditando(false); setMetaInput(""); }}
                    >
                        Cancelar
                    </button>
                </div>
            )}

            {/* ── Gauge — SIEMPRE montado ──────────────────── */}
            <div className="ikpi-gauge-wrap">
                <svg ref={svgRef} viewBox="0 0 300 190" />
                {cargando && (
                    <div className="ikpi-gauge-overlay">
                        <span className="ikpi-spinner" />
                    </div>
                )}
            </div>

            {/* ── Badge ───────────────────────────────────── */}
            <div className="ikpi-badge-row">
                <span className={badgeClass}>{badgeText}</span>
            </div>

            {/* ── Totales ─────────────────────────────────── */}
            <div className="ikpi-totales">
                <div className="ikpi-tot-item" style={{ "--tot-color": "#4A90D9" }}>
                    <span className="ikpi-tot-val">{total}</span>
                    <span className="ikpi-tot-lbl">Total filtrado</span>
                </div>
                <div className="ikpi-tot-item" style={{ "--tot-color": "#B39DDB" }}>
                    <span className="ikpi-tot-val">{meta ?? "—"}</span>
                    <span className="ikpi-tot-lbl">Meta</span>
                </div>
                <div className="ikpi-tot-item" style={{ "--tot-color": diff != null && diff >= 0 ? "#4A90D9" : "#F48FB1" }}>
                    <span
                        className="ikpi-tot-val"
                        style={{ color: diff != null ? (diff >= 0 ? "#185FA5" : "#A32D2D") : undefined }}
                    >
                        {diff != null ? (diff >= 0 ? `+${diff}` : diff) : "—"}
                    </span>
                    <span className="ikpi-tot-lbl">Diferencia</span>
                </div>
            </div>
        </div>
    );
}