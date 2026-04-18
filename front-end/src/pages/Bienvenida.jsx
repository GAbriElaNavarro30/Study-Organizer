import "../styles/bienvenida.css";
import inspiracion from "../assets/imagenes/fondo-frases.jpeg";
import { useState } from "react";
import { useBienvenida } from "../hooks/useBienvenida";
import { Doughnut, Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler);

const MESES_NOMBRES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const COLORES_GENERO = {
    hombre: "#b3d9f2",   // azul cielo
    mujer:  "#f4a7c3",   // rosa pastel
    otro:   "#a8d8b9",   // verde menta
};

const COLORES_ROL = {
    Administrador: "#ffbaee",   // rosa
    Tutor:         "#d38afd",   // lila
    Estudiante:    "#addbff",   // azul cielo
};

const donutOpts = {
    cutout: "72%",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (c) => ` ${c.label}: ${c.raw}` } },
    },
    elements: {
        arc: { hoverOffset: 0 }
    },
};

const lineaOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (c) => ` Registros: ${c.raw}` } },
    },
    scales: {
        x: {
            grid: { color: "rgba(0,0,0,.05)" },
            ticks: { font: { size: 11 }, color: "#888", maxRotation: 45, autoSkip: false },
        },
        y: {
            grid: { color: "rgba(0,0,0,.05)" },
            beginAtZero: true,
            ticks: { precision: 0, font: { size: 11 }, color: "#888" },
        },
    },
};

export function Bienvenida() {
    const {
        usuario,
        datos,
        cargandoDashboard,
        mesSeleccionado,
        setMesSeleccionado,
        anioSeleccionado,
        setAnioSeleccionado,
        aniosDisponibles,
        cargarDatos,
    } = useBienvenida();

    const [hoverGenero, setHoverGenero] = useState(false);
    const [hoverRol, setHoverRol]       = useState(false);

    /* ---- cálculos ---- */
    const df = datos.filter((r) => {
        const okMes  = mesSeleccionado  === 0 || r.mes  === mesSeleccionado;
        const okAnio = anioSeleccionado === 0 || r.anio === anioSeleccionado;
        return okMes && okAnio;
    });

    const cnt        = (campo, valor) => df.filter((r) => r[campo] === valor).length;
    const total      = df.length;
    const hombres    = cnt("genero", "hombre");
    const mujeres    = cnt("genero", "mujer");
    const otro       = total - hombres - mujeres;
    const admins     = cnt("rol", "Administrador");
    const tutores    = cnt("rol", "Tutor");
    const estudiantes= cnt("rol", "Estudiante");

    const calcularLinea = () => {
        if (mesSeleccionado !== 0) {
            const years = anioSeleccionado === 0 ? aniosDisponibles : [anioSeleccionado];
            return {
                labels: years.map((y) => `${MESES_NOMBRES[mesSeleccionado - 1]} ${y}`),
                data:   years.map((y) => datos.filter((r) => r.mes === mesSeleccionado && r.anio === y).length),
            };
        }
        if (anioSeleccionado !== 0) {
            return {
                labels: MESES_NOMBRES,
                data:   MESES_NOMBRES.map((_, i) => datos.filter((r) => r.mes === i + 1 && r.anio === anioSeleccionado).length),
            };
        }
        const byMonth = {};
        datos.forEach((r) => {
            const k = `${r.anio}-${String(r.mes).padStart(2, "0")}`;
            byMonth[k] = (byMonth[k] || 0) + 1;
        });
        const keys = Object.keys(byMonth).sort();
        return {
            labels: keys.map((k) => { const [y, m] = k.split("-"); return `${MESES_NOMBRES[parseInt(m) - 1]} ${y.slice(2)}`; }),
            data:   keys.map((k) => byMonth[k]),
        };
    };

    const linea = calcularLinea();

    const donutGeneroData = {
        labels: ["Hombres", "Mujeres", "Otro"],
        datasets: [{ data: [hombres, mujeres, otro], backgroundColor: [COLORES_GENERO.hombre, COLORES_GENERO.mujer, COLORES_GENERO.otro], borderWidth: 0, hoverOffset: 0 }],
    };

    const donutRolData = {
        labels: ["Administrador", "Tutor", "Estudiante"],
        datasets: [{ data: [admins, tutores, estudiantes], backgroundColor: [COLORES_ROL.Administrador, COLORES_ROL.Tutor, COLORES_ROL.Estudiante], borderWidth: 0, hoverOffset: 0 }],
    };

    const lineaData = {
        labels: linea.labels,
        datasets: [{
            label: "Registros",
            data: linea.data,
            borderColor: "#3a7ebf",
            backgroundColor: "rgba(91,155,213,0.13)",
            tension: 0.4,
            fill: true,
            pointBackgroundColor: "#3a7ebf",
            pointRadius: 4,
            borderWidth: 2,
        }],
    };

    const pct = (n) => (total ? Math.round((n / total) * 100) : 0);

    /* ---- render ---- */
    return (
        <main className="bienvenida-container">

            {/* ── Tarjeta perfil ── */}
            <section className="bienvenida-perfil">
                <div className="perfil-foto">
                    <div className="perfil-foto-ring">
                        <img src={usuario?.foto_perfil} alt="Foto de perfil" />
                    </div>
                </div>
                <div className="perfil-info">
                    <h2 className="perfil-saludo">
                        Bienvenid@, <span className="perfil-nombre">{usuario?.nombre} {usuario?.apellido}</span>
                    </h2>
                    <span className="perfil-rol">{usuario?.rol_texto}</span>
                    <p className="perfil-descripcion">{usuario?.descripcion}</p>
                </div>
                <div className="perfil-deco-circle perfil-deco-1"></div>
                <div className="perfil-deco-circle perfil-deco-2"></div>
            </section>

            {/* ── Frase ── */}
            <section className="bienvenida-frase-principal">
                <p>
                    Disfruta de tu experiencia con <strong>Study Organizer</strong>,
                    un espacio diseñado para ti, con calma, organización y claridad.
                </p>
            </section>

            {/* ── Dashboard (solo admin) ── */}
            {usuario?.rol === 1 && (
                <section className="adm-dashboard">

                    {/* Encabezado + filtros */}
                    <div className="adm-header">
                        <div>
                            <h3 className="adm-title">Dashboard de Usuarios</h3>
                            <p className="adm-sub">Resumen de registros del sistema</p>
                        </div>
                        <div className="adm-filters">
                            <div className="adm-filter-group">
                                <label>Mes</label>
                                <select value={mesSeleccionado} onChange={(e) => setMesSeleccionado(Number(e.target.value))}>
                                    <option value={0}>Todos</option>
                                    {MESES_NOMBRES.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                                </select>
                            </div>
                            <div className="adm-filter-group">
                                <label>Año</label>
                                <select value={anioSeleccionado} onChange={(e) => setAnioSeleccionado(Number(e.target.value))}>
                                    <option value={0}>Todos</option>
                                    {aniosDisponibles.map((y) => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                            {/*<button className="adm-refresh-btn" onClick={cargarDatos}>↻ Actualizar</button>*/}
                        </div>
                    </div>

                    {cargandoDashboard ? (
                        <div className="adm-loading"><div className="adm-spinner"></div><p>Cargando datos...</p></div>
                    ) : (
                        <>
                            {/* KPIs */}
                            <div className="adm-kpi-grid">
                                <div className="adm-kpi-card adm-kpi-total">
                                    <p className="adm-kpi-label">Total registros</p>
                                    <p className="adm-kpi-value">{total}</p>
                                </div>
                                {[
                                    { color: COLORES_GENERO.hombre, label: "Hombres",     val: hombres,     p: pct(hombres) },
                                    { color: COLORES_GENERO.mujer,  label: "Mujeres",     val: mujeres,     p: pct(mujeres) },
                                    { color: COLORES_ROL.Administrador, label: "Admins",  val: admins,      p: pct(admins) },
                                    { color: COLORES_ROL.Tutor,     label: "Tutores",     val: tutores,     p: pct(tutores) },
                                    { color: COLORES_ROL.Estudiante,label: "Estudiantes", val: estudiantes, p: pct(estudiantes) },
                                ].map((k) => (
                                    <div key={k.label} className="adm-kpi-card">
                                        <p className="adm-kpi-label">
                                            <span className="adm-dot" style={{ background: k.color }}></span>
                                            {k.label}
                                        </p>
                                        <p className="adm-kpi-value">{k.val}</p>
                                        <p className="adm-kpi-pct">{k.p}%</p>
                                    </div>
                                ))}
                            </div>

                            {/* Donas */}
                            <div className="adm-donuts-row">

                                {/* Género */}
                                <div className="adm-chart-card">
                                    <p className="adm-card-title">Por género</p>
                                    <div className="adm-donut-wrap">
                                        <div
                                            className="adm-donut-canvas-wrap"
                                            onMouseEnter={() => setHoverGenero(true)}
                                            onMouseLeave={() => setHoverGenero(false)}
                                        >
                                            <Doughnut data={donutGeneroData} options={donutOpts} />
                                            {!hoverGenero && (
                                                <div className="adm-donut-center">
                                                    <span className="adm-donut-total">{total}</span>
                                                    <span className="adm-donut-label">total</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="adm-legend">
                                            {[
                                                { color: COLORES_GENERO.hombre, label: "Hombres", val: hombres },
                                                { color: COLORES_GENERO.mujer,  label: "Mujeres",  val: mujeres },
                                                { color: COLORES_GENERO.otro,   label: "Otro",     val: otro },
                                            ].map((item) => (
                                                <div key={item.label} className="adm-legend-item">
                                                    <span className="adm-legend-sq" style={{ background: item.color }}></span>
                                                    <span className="adm-legend-text">{item.label}</span>
                                                    <span className="adm-legend-val">{item.val}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Rol */}
                                <div className="adm-chart-card">
                                    <p className="adm-card-title">Por rol</p>
                                    <div className="adm-donut-wrap">
                                        <div
                                            className="adm-donut-canvas-wrap"
                                            onMouseEnter={() => setHoverRol(true)}
                                            onMouseLeave={() => setHoverRol(false)}
                                        >
                                            <Doughnut data={donutRolData} options={donutOpts} />
                                            {!hoverRol && (
                                                <div className="adm-donut-center">
                                                    <span className="adm-donut-total">{total}</span>
                                                    <span className="adm-donut-label">total</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="adm-legend">
                                            {[
                                                { color: COLORES_ROL.Administrador, label: "Admin",      val: admins },
                                                { color: COLORES_ROL.Tutor,         label: "Tutor",      val: tutores },
                                                { color: COLORES_ROL.Estudiante,    label: "Estudiante", val: estudiantes },
                                            ].map((item) => (
                                                <div key={item.label} className="adm-legend-item">
                                                    <span className="adm-legend-sq" style={{ background: item.color }}></span>
                                                    <span className="adm-legend-text">{item.label}</span>
                                                    <span className="adm-legend-val">{item.val}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Línea */}
                            <div className="adm-chart-card">
                                <p className="adm-card-title">Evolución de registros</p>
                                {linea.labels.length === 0 ? (
                                    <p className="adm-empty">Sin datos para el período seleccionado</p>
                                ) : (
                                    <div className="adm-line-wrap">
                                        <Line data={lineaData} options={lineaOpts} />
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </section>
            )}

        </main>
    );
}