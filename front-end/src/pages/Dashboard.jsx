import { useState, useEffect, useContext, useRef } from "react";
import {
    IoPerson,
    IoHappyOutline,
    IoBookOutline,
    IoGridOutline,
    IoSchoolOutline,
    IoNotificationsOutline,
    IoWarningOutline,
    IoCheckmarkCircleOutline,
    IoAddOutline,
    IoCloseOutline,
    IoTrendingUpOutline,
    IoLeafOutline,
    IoWaterOutline,
    IoFlameOutline,
} from "react-icons/io5";
import { AuthContext } from "../context/AuthContext";
import "../styles/dashboard.css";
import { ModalNuevaEmocion } from "../components/ModalNuevaEmocion";
import inspiracion from "../assets/imagenes/fondo-frases.jpeg";
import { BannerApoyoEmocional } from "../components/BannerApoyoEmocional";

/* ─── Paleta de colores para la dona ─── */
const DONA_COLORES = [
    "#38bdf8", "#0ea5e9", "#0284c7", "#7dd3fc",
    "#bae6fd", "#075985", "#0369a1", "#93c5fd",
    "#1e40af", "#e0f2fe",
];

/* ─── Emociones base con clasificación ─── */
const EMOCIONES_BASE = [
    { label: "Tranquilo/a", clasif: "neutra" },
    { label: "Feliz", clasif: "positiva" },
    { label: "Motivado/a", clasif: "positiva" },
    { label: "Ansioso/a", clasif: "negativa" },
    { label: "Cansado/a", clasif: "negativa" },
    { label: "Estresado/a", clasif: "negativa" },
];

const CLASIFS = ["negativa", "neutra", "positiva"];
const CLASIF_LABELS = {
    negativa: "Negativa",
    neutra: "Neutra",
    positiva: "Positiva",
};

const MESES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

/* ── Helper para formatear fecha y hora ── */
function formatearFechaHora(fechaRaw) {
    const fecha = new Date(fechaRaw);
    const fechaStr = fecha.toLocaleDateString("es-MX", {
        day: "2-digit", month: "2-digit", year: "numeric",
    });
    const horaStr = fecha.toLocaleTimeString("es-MX", {
        hour: "2-digit", minute: "2-digit",
    });
    return `${fechaStr} · ${horaStr}`;
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

    const aniosDisponibles = [...new Set(historial.map(h => new Date(h.fecha).getFullYear()))].sort();

    const datosFiltrados = historial.filter(h => {
        const d = new Date(h.fecha);
        if (filtroEmo && h.emo !== filtroEmo) return false;
        if (filtroMes !== "" && d.getMonth() !== Number(filtroMes)) return false;
        if (filtroAnio && d.getFullYear() !== Number(filtroAnio)) return false;
        return true;
    });

    const conteos = {};
    datosFiltrados.forEach(h => { conteos[h.emo] = (conteos[h.emo] || 0) + 1; });
    const entradas = Object.entries(conteos).sort((a, b) => b[1] - a[1]);
    const total = datosFiltrados.length;
    const dominante = entradas[0]?.[0] || "—";
    const positivas = datosFiltrados.filter(h => h.clasif === "positiva").length;
    const dificiles = datosFiltrados.filter(h => h.clasif === "negativa" || h.clasif === "critica").length;

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
    }, [filtroEmo, filtroMes, filtroAnio, historial]);

    return (
        <div className="dona-card">
            <div className="dona-header">
                <div>
                    <h3 className="sec-title">Registro emocional</h3>
                    <p className="sec-sub">Distribución de emociones según los filtros seleccionados</p>
                </div>
            </div>

            <div className="dona-filtros">
                <select value={filtroEmo} onChange={e => setFiltroEmo(e.target.value)}>
                    <option value="">Todas las emociones</option>
                    {EMOCIONES_BASE.map(em => (
                        <option key={em.label}>{em.label}</option>
                    ))}
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
                                    <span
                                        className="dona-leg-dot"
                                        style={{ background: DONA_COLORES[i % DONA_COLORES.length] }}
                                    />
                                    <div className="dona-leg-info">
                                        <span className="dona-leg-name">{e[0]}</span>
                                        <div className="dona-leg-track">
                                            <div
                                                className="dona-leg-fill"
                                                style={{
                                                    width: `${pct}%`,
                                                    background: DONA_COLORES[i % DONA_COLORES.length],
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <span className="dona-leg-count">{e[1]}</span>
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
                    <span className="dona-kpi-label">Positivas / difíciles</span>
                    <span className="dona-kpi-val dona-kpi-val--sm">{positivas} / {dificiles}</span>
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

    const nivelANum = { bajo: 1, medio: 2, alto: 3 };
    const NIVEL_COLORES = {
        positiva: "#a8e6cf",
        negativa: "#ffd6e0",
        //critica: "#d4b8e0",
        neutra: "#fff5a0",
    };

    useEffect(() => {
        if (!canvasRef.current || typeof window.Chart === "undefined") return;
        if (chartRef.current) chartRef.current.destroy();

        const labels = ultimos7.map(d => d.dia);
        const valores = ultimos7.map(d => d.reg ? (nivelANum[d.reg.nivel] ?? 2) : 0);
        const colores = ultimos7.map(d =>
            d.reg ? (NIVEL_COLORES[d.reg.clasif] ?? "#d4b8e0") : "#eff6ff"
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
                        max: 3,
                        ticks: {
                            stepSize: 1,
                            callback: v => ["", "Bajo", "Medio", "Alto"][v] ?? "",
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
                                const nivel = ["", "Bajo", "Medio", "Alto"][ctx.parsed.y] ?? "";
                                return ` ${d.reg.emo} · ${nivel}`;
                            },
                        },
                    },
                },
            },
        });

        return () => { if (chartRef.current) chartRef.current.destroy(); };
    }, [historial]);

    const conReg = ultimos7.filter(d => d.reg);
    const conteos = {};
    conReg.forEach(d => { conteos[d.reg.emo] = (conteos[d.reg.emo] || 0) + 1; });
    const dom = Object.entries(conteos).sort((a, b) => b[1] - a[1])[0];

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
                    {ultimos7.map(d => d.reg ? `${d.dia}: ${d.reg.emo} (${d.reg.nivel})` : `${d.dia}: sin registro`).join(", ")}
                </canvas>
            </div>

            {dom && (
                <div className="semana-dominante">
                    <IoTrendingUpOutline size={14} />
                    Predomina esta semana: <strong>{dom[0]}</strong>
                </div>
            )}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════
   DASHBOARD PRINCIPAL
══════════════════════════════════════════════════════════════ */
export function Dashboard() {
    const { usuario, refrescarUsuario } = useContext(AuthContext);

    // ══ 1. TODOS LOS USESTATE ══
    const [modalOtraVisible, setModalOtraVisible] = useState(false);
    const [pendienteRegistro, setPendienteRegistro] = useState(null);
    const [emociones, setEmociones] = useState([]);
    const [emocionSeleccionada, setEmocionSeleccionada] = useState(null);
    const [mostrarInput, setMostrarInput] = useState(false);
    const [emocionNueva, setEmocionNueva] = useState("");
    const [selClasif, setSelClasif] = useState(null);
    const [historial, setHistorial] = useState([]);
    const [modalVisible, setModalVisible] = useState(true);
    const [frase, setFrase] = useState("");
    const [fraseHoy, setFraseHoy] = useState(null);
    const [mostrarAlertaFrase, setMostrarAlertaFrase] = useState(false);
    const [vark, setVark] = useState(null);
    const [estudio, setEstudio] = useState(null);
    const [cargandoVark, setCargandoVark] = useState(true);
    const [cargandoMe, setCargandoMe] = useState(true);
    const [cursosEstudiante, setCursosEstudiante] = useState([]);
    const [hoy, setHoy] = useState(
        new Date().toLocaleDateString("sv-SE", { timeZone: "America/Mexico_City" })
    );
    const [tipBienvenida, setTipBienvenida] = useState(null);

    // ══ 2. DERIVACIONES (dependen de los estados) ══
    const emocionHoy = historial.find(h => h.fecha === hoy) || null;

    const mostrarAlerta = (() => {
        const sorted = [...historial].sort((a, b) => a.fecha > b.fecha ? -1 : 1).slice(0, 3);
        return sorted.length >= 3 && sorted.every(h => h.clasif === "negativa" || h.clasif === "critica");
    })();

    // ══ 3. FUNCIONES ══
    const seleccionarEmocion = (id_emocion, label, clasif) => {
        if (emocionHoy) return;
        setPendienteRegistro({ id_emocion, label, clasif });
    };

    const confirmarRegistro = async (nivel) => {
        if (!pendienteRegistro) return;
        const { id_emocion, label, clasif } = pendienteRegistro;

        try {
            const res = await fetch("http://localhost:3000/dashboard/emociones/registrar-dia", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_emocion, nivel }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.mensaje);
                setPendienteRegistro(null);
                return;
            }

            setHistorial(prev => [...prev, { fecha: hoy, emo: label, clasif, nivel }]);
            setEmocionSeleccionada(label);
            setPendienteRegistro(null);

            if (data.frase) {
                setFraseHoy(data.frase);
                setMostrarAlertaFrase(data.mostrar_alerta_frase ?? false);
            }

        } catch (error) {
            console.error("Error al registrar emoción:", error);
        }
    };

    const confirmarRegistro_conNivel = async (id_emocion, label, clasif, nivel) => {
        try {
            const res = await fetch("http://localhost:3000/dashboard/emociones/registrar-dia", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_emocion, nivel }),
            });
            const data = await res.json();
            if (!res.ok) { console.warn(data.mensaje); return; }
            setHistorial(prev => [...prev, { fecha: hoy, emo: label, clasif, nivel }]);
            setEmocionSeleccionada(label);
            setModalVisible(false);
            if (data.frase) {
                setFraseHoy(data.frase);
                setMostrarAlertaFrase(data.mostrar_alerta_frase ?? false);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleNuevaEmocionGuardada = ({ label, clasif, nivel, id }) => {
        setEmociones(prev => [...prev, { label, clasif, nivel, id_emocion: id }]);
        confirmarRegistro_conNivel(id, label, clasif, nivel);
    };

    const agregarEmocion = () => {
        if (!emocionNueva.trim() || !selClasif) return;
        const nueva = { label: emocionNueva.trim(), clasif: selClasif };
        setEmociones(prev => [...prev, nueva]);
        setEmocionNueva("");
        setSelClasif(null);
        setMostrarInput(false);
    };

    // ══ 4. TODOS LOS USEEFFECT ══
    useEffect(() => { refrescarUsuario(); }, []);
    useEffect(() => { window.scrollTo(0, 0); }, []);

    // Reemplaza este useEffect:
    useEffect(() => {
        if (!emocionHoy) return;
        const cargarFrase = async () => {
            try {
                const res = await fetch("http://localhost:3000/dashboard/frase-hoy", {
                    credentials: "include",
                });
                if (!res.ok) return;
                const data = await res.json();
                if (data.frase) {
                    setFraseHoy(data.frase);
                }
            } catch (error) {
                console.error("Error al cargar frase del día:", error);
            }
        };
        cargarFrase();
    }, [emocionHoy]); // ← aquí estaba el bug, tenía [hoy]

    useEffect(() => {
        const verificar = async () => {
            try {
                const res = await fetch("http://localhost:3000/dashboard/emociones/verificar-hoy", {
                    credentials: "include",
                });
                if (!res.ok) return;
                const data = await res.json();
                if (data.registrado) {
                    setHistorial(prev => {
                        const yaEsta = prev.find(h => h.fecha === hoy);
                        if (yaEsta) return prev;
                        return [...prev, {
                            fecha: hoy,
                            emo: data.emocion,
                            clasif: data.categoria,
                            nivel: data.nivel   // ← ¿ya viene aquí? si no, agrégalo
                        }];
                    });
                }
            } catch (error) {
                console.error("Error al verificar registro de hoy:", error);
            }
        };
        verificar();
    }, []);

    useEffect(() => {
        const cargarHistorial = async () => {
            try {
                const res = await fetch("http://localhost:3000/dashboard/emociones/historial", {
                    credentials: "include",
                });
                if (!res.ok) return;
                const data = await res.json();
                const normalizado = data.historial.map(h => ({
                    fecha: h.fecha_registro.slice(0, 10),
                    emo: h.nombre_emocion,
                    clasif: h.categoria,
                    nivel: h.nivel ?? "medio",   // ← agregar el fallback
                }));
                setHistorial(normalizado);
            } catch (error) {
                console.error("Error al cargar historial:", error);
            }
        };
        cargarHistorial();
    }, []);

    useEffect(() => {
        const cargar = async () => {
            try {
                const res = await fetch("http://localhost:3000/dashboard/emociones", {
                    credentials: "include",
                });
                if (!res.ok) return;
                const data = await res.json();
                setEmociones(data.emociones.map(e => ({
                    label: e.nombre_emocion,
                    clasif: e.categoria,
                    id_emocion: e.id_emocion,
                })));
            } catch (error) {
                console.error("Error al cargar emociones:", error);
            }
        };
        cargar();
    }, []);

    // Función reutilizable fuera del useEffect
    const cargarTipBienvenida = async () => {
        try {
            const res = await fetch("http://localhost:3000/dashboard/tip-frase", {
                credentials: "include",
            });
            if (!res.ok) return;
            const data = await res.json();
            if (data.texto) setTipBienvenida(data.texto);
        } catch (error) {
            console.error("Error al cargar tip de bienvenida:", error);
        }
    };

    // Reemplaza el useEffect del tip que ya tienes por este:
    useEffect(() => {
        cargarTipBienvenida();
    }, []);

    // Y el useEffect de medianoche queda así:
    useEffect(() => {
        const calcularMsHastaMedianoche = () => {
            const ahora = new Date();
            const manana = new Date();
            manana.setDate(ahora.getDate() + 1);
            manana.setHours(0, 0, 0, 0);
            return manana - ahora;
        };

        const timeout = setTimeout(() => {
            setHoy(new Date().toLocaleDateString("sv-SE", { timeZone: "America/Mexico_City" }));
            setEmocionSeleccionada(null);
            setPendienteRegistro(null);
            setModalVisible(true);
            setFraseHoy(null);
            setTipBienvenida(null);      // ← limpia la frase vieja
            cargarTipBienvenida();       // ← carga la nueva del día siguiente
        }, calcularMsHastaMedianoche());

        return () => clearTimeout(timeout);
    }, [hoy]);

    useEffect(() => {
        if (emocionHoy) setModalVisible(false);
    }, [emocionHoy]);

    useEffect(() => {
        const cargar = async () => {
            try {
                const res = await fetch("http://localhost:3000/cursos/inscripciones/mis-cursos-resultados", {
                    credentials: "include",
                });
                if (!res.ok) return;
                const data = await res.json();
                setCursosEstudiante(data.cursos || []);
            } catch (error) {
                console.error("Error al cargar cursos:", error);
            }
        };
        cargar();
    }, []);

    useEffect(() => {
        const cargar = async () => {
            try {
                const res = await fetch("http://localhost:3000/estilosaprendizaje/resultado-guardado", {
                    credentials: "include",
                });
                if (!res.ok) return;
                const data = await res.json();
                setVark({
                    fecha: formatearFechaHora(data.fecha_intento),
                    resultado: data.nombre_perfil,
                    detalle: {
                        visual: data.porcentajes.v,
                        auditivo: data.porcentajes.a,
                        lector: data.porcentajes.r,
                        kinestesico: data.porcentajes.k,
                    },
                });
            } catch (error) {
                console.error("Error al cargar resultado VARK:", error);
            } finally {
                setCargandoVark(false);
            }
        };
        cargar();
    }, []);

    useEffect(() => {
        const cargar = async () => {
            try {
                const res = await fetch("http://localhost:3000/metodosestudio/ultimo-resultado", {
                    credentials: "include",
                });
                if (!res.ok) return;
                const data = await res.json();
                setEstudio({
                    fecha: formatearFechaHora(data.fecha_intento),
                    resultado: data.nivel_global,
                    compatibilidad: Math.round(data.puntaje_global),
                    dimensiones: data.resultados_por_dimension,
                });
            } catch (error) {
                console.error("Error al cargar resultado ME:", error);
            } finally {
                setCargandoMe(false);
            }
        };
        cargar();
    }, []);

    // ══ 5. RENDER ══
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

            {/* ── ALERTA ESPECIALISTA ── */}
            {mostrarAlerta && (
                <div className="alerta-box">
                    <IoWarningOutline size={20} color="#ea580c" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                        <p className="alerta-titulo">Se detectaron emociones difíciles consecutivas</p>
                        <p className="alerta-body">Hemos notado que has registrado emociones negativas o críticas varios días seguidos. Te invitamos a hablar con un orientador o especialista de bienestar. Pedir ayuda es una señal de fortaleza.</p>
                    </div>
                </div>
            )}

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

                        {/* ── SELECTOR DE NIVEL ── */}
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

                        {mostrarInput && (
                            <div className="otra-form">
                                <input
                                    type="text"
                                    placeholder="Escribe cómo te sientes..."
                                    value={emocionNueva}
                                    onChange={e => setEmocionNueva(e.target.value)}
                                />
                                <div className="clasif-label">Clasificación:</div>
                                <div className="clasif-row">
                                    {CLASIFS.map(c => (
                                        <button
                                            key={c}
                                            className={`clasif-btn clasif-btn--${c} ${selClasif === c ? "clasif-btn--sel" : ""}`}
                                            onClick={() => setSelClasif(c)}
                                        >
                                            {CLASIF_LABELS[c]}
                                        </button>
                                    ))}
                                </div>
                                <div className="otra-actions">
                                    <button className="btn-primary" onClick={agregarEmocion}>
                                        Guardar emoción
                                    </button>
                                    <button
                                        className="btn-ghost"
                                        onClick={() => { setMostrarInput(false); setEmocionNueva(""); setSelClasif(null); }}
                                    >
                                        <IoCloseOutline size={14} style={{ marginRight: 4 }} />
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </section>

            {/* ── VISTA SEMANAL ── */}
            <section className="card">
                <VistaSemanal historial={historial} />
            </section>

            {/* ── KPI DONA ── */}
            <DonaEmociones historial={historial} />

            {/* ── RESULTADOS DE TESTS ── */}
            <section className="card">
                <h3 className="sec-title">
                    <IoBookOutline size={17} style={{ marginRight: 6 }} />
                    Resultados de evaluaciones
                </h3>

                <div className="tests-layout">

                    {/* ── COLUMNA IZQUIERDA: VARK + CURSOS ── */}
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
                                <span>Puntaje por curso</span>
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

                    {/* ── COLUMNA DERECHA: MÉTODOS DE ESTUDIO ── */}
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

            {/* ── FRASE DEL DÍA (sistema experto) ── */}
            {/* ── FRASE DEL DÍA (sistema experto) ── */}
            <section className="bienvenida-inspiracion">
                <img src={inspiracion} alt="Inspiración" />
                <div className="inspiracion-overlay">
                    <p>
                        {fraseHoy
                            ? `"${fraseHoy}"`
                            : tipBienvenida
                                ? `"${tipBienvenida}"`
                                : "Disfruta de tu experiencia con Study Organizer..."
                        }
                    </p>
                </div>
            </section>

            <ModalNuevaEmocion
                visible={modalOtraVisible}
                onClose={() => setModalOtraVisible(false)}
                onGuardar={handleNuevaEmocionGuardada}
            />

            <BannerApoyoEmocional
                visible={mostrarAlertaFrase}
            />

        </main>
    );
}