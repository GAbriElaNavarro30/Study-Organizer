import {
    IoSchool, IoEye, IoArchive, IoPeople, IoTrendingUp, IoStar,
    IoBarChart, IoPieChart, IoCalendar, IoMedal, IoBookmarks,
    IoStatsChart, IoCheckmarkCircle, IoHandRight, IoTrophy,
    IoPersonAdd, IoCheckmarkDone, IoTimeOutline,
} from "react-icons/io5";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend,
    Area, AreaChart,
} from "recharts";
import { useDashboardTutor } from "../hooks/useDashboardTutor";
import "../styles/DashboardTutor.css";

const COLORS_VARK = [
    "#4A90D9", // Azul
    "#B39DDB", // Lila
    "#F48FB1", // Rosa palo
    "#80CBC4", // Menta
    "#FFAB91", // Durazno
    "#A5D6A7", // Verde suave
    "#FFD54F", // Amarillo suave
    "#90CAF9", // Azul claro
    "#CE93D8", // Morado claro
    "#EF9A9A", // Rojo suave
    "#80DEEA", // Cyan claro
    "#BCAAA4", // Marrón suave
    "#F0A8D0", // Rosa chicle suave
    "#C5E1A5", // Verde lima suave
    "#FFF176", // Amarillo muy claro
];
const COLORS_DIM = ["#4A90D9", "#B39DDB", "#F48FB1", "#80CBC4", "#FFB74D", "#A5D6A7"];
const COLORS_NIVEL = {
    "Básico": "#F48FB1", // rosa palo
    "Intermedio": "#B39DDB", // lila
    "Avanzado": "#4A90D9", // azul
    "Experto": "#3A7BD5", // azul oscuro
    "Excelente": "#3A7BD5",
    "Muy bueno": "#4A90D9",
    "Bueno": "#B39DDB", // lila
    "Regular": "#F48FB1", // rosa
    "Deficiente": "#FFAB91", // durazno suave
};
const VARK_ORDER = ['V', 'A', 'R', 'K', 'VA', 'VR', 'VK', 'AR', 'AK', 'RK', 'VAR', 'VAK', 'VRK', 'ARK', 'VARK'];

// ── KPI Card ─────────────────────────────────────────────────
function KPICard({ icon: Icon, label, value, sublabel, color, trend }) {
    return (
        <div className="kpi-card" style={{ "--kpi-color": color }}>
            <div className="kpi-icon-wrap"><Icon size={26} /></div>
            <div className="kpi-body">
                <span className="kpi-value">{value}</span>
                <span className="kpi-label">{label}</span>
                {sublabel && <span className="kpi-sub">{sublabel}</span>}
            </div>
            {trend !== undefined && (
                <div className={`kpi-trend ${trend >= 0 ? "up" : "down"}`}>
                    <IoTrendingUp size={14} />
                    <span>{Math.abs(trend)}%</span>
                </div>
            )}
        </div>
    );
}

// ── Tooltip personalizado ─────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
    if (active && payload && payload.length) {
        return (
            <div className="chart-tooltip">
                <p className="tooltip-label">{label}</p>
                {payload.map((p, i) => (
                    <p key={i} style={{ color: p.color }}>
                        {p.name}: <strong>{p.value}</strong>
                    </p>
                ))}
            </div>
        );
    }
    return null;
}

// ── Tasa de finalización ──────────────────────────────────────
function FinalizacionRow({ titulo, inscritos, completados, tasa, index }) {
    const color = tasa >= 70 ? "#4A90D9" : tasa >= 40 ? "#B39DDB" : "#F48FB1";
    return (
        <div className="fin-row">
            <span className="fin-num">{index + 1}</span>
            <span className="fin-titulo" title={titulo}>{titulo}</span>
            <span className="fin-meta">{completados}/{inscritos}</span>
            <div className="fin-bar-wrap">
                <div className="fin-bar-fill" style={{ width: `${Math.min(tasa, 100)}%`, background: color }} />
            </div>
            <span className="fin-tasa" style={{ color }}>{tasa ?? 0}%</span>
        </div>
    );
}

// ── Feed de actividad reciente ────────────────────────────────
function ActividadItem({ tipo, actor, recurso, fecha }) {
    const Icon = tipo === "inscripcion" ? IoPersonAdd : IoCheckmarkDone;
    const color = tipo === "inscripcion" ? "#4A90D9" : "#3A7BD5";
    const accion = tipo === "inscripcion" ? "se inscribió en" : "completó";

    const diff = Math.round((Date.now() - new Date(fecha)) / 60000);
    const tiempo = diff < 60
        ? `hace ${diff} min`
        : diff < 1440
            ? `hace ${Math.round(diff / 60)} h`
            : `hace ${Math.round(diff / 1440)} días`;

    return (
        <div className="act-item">
            <div className="act-icon" style={{ background: `${color}18`, color }}>
                <Icon size={14} />
            </div>
            <div className="act-body">
                <span className="act-actor">{actor}</span>
                <span className="act-texto"> {accion} </span>
                <span className="act-recurso">{recurso}</span>
            </div>
            <span className="act-tiempo">
                <IoTimeOutline size={11} /> {tiempo}
            </span>
        </div>
    );
}

// ── Componente principal ──────────────────────────────────────
export function DashboardTutor({ tutor, estadisticas }) {
    const {
        animado,
        setFotoError,
        usuario,
        initials,
        mostrarFoto,
        stats,
        cursoFiltroNivel, setCursoFiltroNivel,
        mesFiltroNivel, setMesFiltroNivel,
        anioFiltroNivel, setAnioFiltroNivel,
        mesesDisponibles,
        aniosDisponibles,
        dataNiveles,
        cargandoNiveles,
        promedio_general,
        mejor_curso,
        tasa_global,
    } = useDashboardTutor(tutor, estadisticas);

    return (
        <div className={`dash-root ${animado ? "loaded" : ""}`}>

            {/* ── HEADER ───────────────────────────────────── */}
            <section className="dash-welcome">
                <div className="welcome-left">
                    <div className="avatar-wrap">
                        {mostrarFoto
                            ? <img src={usuario.foto_perfil} alt="avatar" className="avatar-img" onError={() => setFotoError(true)} />
                            : <span className="avatar-initials">{initials}</span>}
                        <span className="avatar-badge"><IoCheckmarkCircle size={16} /></span>
                    </div>
                    <div className="welcome-text">
                        <p className="welcome-greeting"><IoHandRight size={15} /> Bienvenido de vuelta</p>
                        <h1 className="welcome-name">{usuario.nombre} {usuario.apellido}</h1>
                        <span className="welcome-role"><IoSchool size={13} /> {usuario.rol || "Tutor"}</span>
                        {usuario.descripcion && <p className="welcome-desc">{usuario.descripcion}</p>}
                    </div>
                </div>
                <div className="welcome-right">
                    <div className="welcome-date">
                        <IoCalendar size={15} />
                        <span>{new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
                    </div>
                    <div className="welcome-stat-mini">
                        <IoStatsChart size={18} />
                        <span>Promedio general: <strong>{promedio_general}%</strong></span>
                    </div>
                    <div className="welcome-stat-mini">
                        <IoCheckmarkDone size={18} />
                        <span>Tasa de finalización: <strong>{tasa_global}%</strong></span>
                    </div>
                </div>
            </section>

            {/* ── KPIs ─────────────────────────────────────── */}
            <section className="dash-section">
                <h2 className="section-title"><IoBarChart size={18} /> Resumen general</h2>
                <div className="kpi-grid">
                    <KPICard icon={IoBookmarks} label="Cursos totales" value={stats.total_cursos} color="#4A90D9" trend={12} />
                    <KPICard icon={IoEye} label="Cursos publicados" value={stats.cursos_publicados} color="#B39DDB" />
                    <KPICard icon={IoArchive} label="Cursos archivados" value={stats.cursos_archivados} color="#F48FB1" />
                    <KPICard icon={IoPeople} label="Total estudiantes" value={stats.total_estudiantes} color="#80CBC4" trend={8} />
                    <KPICard icon={IoStar} label="Promedio general" value={`${promedio_general}%`} color="#B39DDB" />
                    <KPICard icon={IoCheckmarkDone} label="Tasa finalización" value={`${tasa_global}%`} color="#4A90D9" />
                </div>
            </section>

            {/* ── INSCRIPCIONES POR MES ────────────────────── */}
            <section className="dash-section">
                <h2 className="section-title"><IoTrendingUp size={18} /> Inscripciones por mes</h2>
                <div className="chart-card wide">
                    <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={stats.inscripciones_mes} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gradArea" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4A90D9" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#4A90D9" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E8F1FB" />
                            <XAxis dataKey="mes" tick={{ fill: "#6B8BAF", fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis
                                tick={{ fill: "#6B8BAF", fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                                allowDecimals={false}
                                tickFormatter={(v) => Number.isInteger(v) ? v : ""}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="total" name="Inscritos"
                                stroke="#4A90D9" strokeWidth={2.5}
                                fill="url(#gradArea)"
                                dot={{ fill: "#4A90D9", r: 4 }} activeDot={{ r: 6 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </section>

            {/* ── NIVELES + ACTIVIDAD RECIENTE ─────────────── */}
            <section className="dash-section">
                <h2 className="section-title"><IoPieChart size={18} /> Niveles de desempeño y actividad</h2>
                <div className="charts-row">

                    {/* Pie — distribución de niveles con filtro por curso */}
                    <div className="chart-card">

                        {/* Cabecera con select */}
                        <div className="niveles-header">
                            <h3 className="chart-subtitle niveles-subtitle">
                                Distribución de niveles alcanzados
                            </h3>
                            <div className="niveles-filtros">
                                <select
                                    value={cursoFiltroNivel}
                                    onChange={e => setCursoFiltroNivel(e.target.value)}
                                    className="niveles-select"
                                >
                                    <option value="todos">Todos los cursos</option>
                                    {stats.cursos_tutor.map(c => (
                                        <option key={c.id_curso} value={c.id_curso}>{c.titulo}</option>
                                    ))}
                                </select>

                                <select
                                    value={anioFiltroNivel}
                                    onChange={e => { setAnioFiltroNivel(e.target.value); setMesFiltroNivel("todos"); }}
                                    className="niveles-select"
                                >
                                    <option value="todos">Todos los años</option>
                                    {aniosDisponibles.map(a => (
                                        <option key={a} value={a}>{a}</option>
                                    ))}
                                </select>

                                <select
                                    value={mesFiltroNivel}
                                    onChange={e => setMesFiltroNivel(e.target.value)}
                                    className="niveles-select"
                                    disabled={anioFiltroNivel === "todos"}  // mes solo tiene sentido con año
                                >
                                    <option value="todos">Todos los meses</option>
                                    {mesesDisponibles.map(m => (
                                        <option key={m.valor} value={m.valor}>{m.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Contenido */}
                        {cargandoNiveles ? (
                            <div className="empty-state">
                                <IoStatsChart size={32} />
                                <p>Cargando...</p>
                            </div>
                        ) : dataNiveles.length === 0 ? (
                            <div className="empty-state">
                                <IoStatsChart size={32} />
                                <p>Sin resultados aún</p>
                                <span>
                                    {cursoFiltroNivel === "todos"
                                        ? "Los niveles aparecerán cuando los alumnos completen cursos"
                                        : "Este curso aún no tiene alumnos con resultado registrado"}
                                </span>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={230}>
                                <PieChart>
                                    <Pie
                                        data={dataNiveles}
                                        dataKey="total"
                                        nameKey="nivel"
                                        cx="50%" cy="50%"
                                        innerRadius={52} outerRadius={85}
                                        paddingAngle={4}
                                    >
                                        {dataNiveles.map((entry, i) => (
                                            <Cell key={i} fill={COLORS_NIVEL[entry.nivel] || COLORS_VARK[i % COLORS_VARK.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(v, n) => [`${v} alumnos`, n]} />
                                    <Legend
                                        iconType="circle" iconSize={9}
                                        formatter={v => <span className="legend-label">{v}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Feed — actividad reciente */}
                    <div className="chart-card">
                        <h3 className="chart-subtitle">Actividad reciente</h3>
                        {stats.actividad_reciente.length === 0 ? (
                            <div className="empty-state">
                                <IoTimeOutline size={32} />
                                <p>Sin actividad aún</p>
                                <span>Aquí verás inscripciones y finalizaciones en tiempo real</span>
                            </div>
                        ) : (
                            <div className="act-feed">
                                {stats.actividad_reciente.map((item, i) => (
                                    <ActividadItem key={i} {...item} />
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </section>

            {/* ── TASA DE FINALIZACIÓN ─────────────────────── */}
            <section className="dash-section">
                <h2 className="section-title"><IoCheckmarkDone size={18} /> Tasa de finalización por curso</h2>
                <div className="chart-card wide">
                    <div className="fin-head">
                        <span>#</span>
                        <span>Curso</span>
                        <span>Completados</span>
                        <span>Progreso</span>
                        <span>Tasa</span>
                    </div>
                    {stats.finalizacion_cursos.length === 0 ? (
                        <div className="empty-state empty-state--padded">
                            <IoBookmarks size={32} />
                            <p>Sin datos aún</p>
                            <span>La tasa de finalización aparece cuando los alumnos completen el contenido</span>
                        </div>
                    ) : (
                        stats.finalizacion_cursos.map((c, i) => (
                            <FinalizacionRow key={i} {...c} index={i} />
                        ))
                    )}
                </div>
            </section>

            {/* ── VARK + DIMENSIONES ───────────────────────── */}
            <section className="dash-section">
                <h2 className="section-title"><IoPieChart size={18} /> Distribución VARK y Dimensiones</h2>

                <div className="charts-row charts-row--mb">
                    <div className="chart-card">
                        <h3 className="chart-subtitle">Perfil VARK — cursos por perfil</h3>
                        <ResponsiveContainer width="100%" height={230}>
                            <PieChart>
                                <Pie
                                    data={[...stats.vark].sort((a, b) => VARK_ORDER.indexOf(a.perfil) - VARK_ORDER.indexOf(b.perfil))}
                                    dataKey="cursos" nameKey="perfil"
                                    cx="50%" cy="50%" innerRadius={52} outerRadius={85} paddingAngle={4}
                                >
                                    {[...stats.vark]
                                        .sort((a, b) => VARK_ORDER.indexOf(a.perfil) - VARK_ORDER.indexOf(b.perfil))
                                        .map((_, i) => <Cell key={i} fill={COLORS_VARK[i % COLORS_VARK.length]} />)}
                                </Pie>
                                <Tooltip formatter={(v, n) => [`${v} cursos`, n]} />
                                <Legend
                                    iconType="circle" iconSize={9}
                                    payload={[...stats.vark]
                                        .filter(v => Number(v.cursos) > 0)
                                        .sort((a, b) => VARK_ORDER.indexOf(a.perfil) - VARK_ORDER.indexOf(b.perfil))
                                        .map((entry, i) => ({ value: entry.perfil, type: "circle", color: COLORS_VARK[i % COLORS_VARK.length] }))}
                                    formatter={v => <span className="legend-label">{v}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="chart-card">
                        <h3 className="chart-subtitle">Estudiantes inscritos por perfil VARK</h3>
                        <ResponsiveContainer width="100%" height={230}>
                            <BarChart
                                data={[...stats.vark].sort((a, b) => VARK_ORDER.indexOf(a.perfil) - VARK_ORDER.indexOf(b.perfil))}
                                margin={{ top: 5, right: 10, left: -20, bottom: 5 }} barSize={18}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#E8F1FB" vertical={false} />
                                <XAxis dataKey="perfil" tick={{ fill: "#6B8BAF", fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis
                                    tick={{ fill: "#6B8BAF", fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                    allowDecimals={false}
                                    tickFormatter={(v) => Number.isInteger(v) ? v : ""}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F0F7FF" }} />
                                <Bar dataKey="estudiantes" name="Estudiantes" radius={[6, 6, 0, 0]}>
                                    {[...stats.vark]
                                        .sort((a, b) => VARK_ORDER.indexOf(a.perfil) - VARK_ORDER.indexOf(b.perfil))
                                        .map((_, i) => <Cell key={i} fill={COLORS_VARK[i % COLORS_VARK.length]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="charts-row">
                    <div className="chart-card">
                        <h3 className="chart-subtitle">Cursos por dimensión</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={stats.dimensiones} layout="vertical" margin={{ top: 5, right: 20, left: 8, bottom: 5 }} barSize={16}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E8F1FB" horizontal={false} />
                                <XAxis type="number" allowDecimals={false} tick={{ fill: "#6B8BAF", fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis type="category" dataKey="nombre" width={190} tick={{ fill: "#6B8BAF", fontSize: 11, textAnchor: "end" }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F0F7FF" }} />
                                <Bar dataKey="cursos" name="Cursos" radius={[0, 6, 6, 0]}>
                                    {stats.dimensiones.map((_, i) => <Cell key={i} fill={COLORS_DIM[i % COLORS_DIM.length]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="chart-card">
                        <h3 className="chart-subtitle">Estudiantes por dimensión</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={stats.dimensiones} layout="vertical" margin={{ top: 5, right: 20, left: 8, bottom: 5 }} barSize={16}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E8F1FB" horizontal={false} />
                                <XAxis type="number" allowDecimals={false} tick={{ fill: "#6B8BAF", fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis type="category" dataKey="nombre" width={190} tick={{ fill: "#6B8BAF", fontSize: 11, textAnchor: "end" }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F0F7FF" }} />
                                <Bar dataKey="estudiantes" name="Estudiantes" radius={[0, 6, 6, 0]}>
                                    {stats.dimensiones.map((_, i) => <Cell key={i} fill={COLORS_DIM[i % COLORS_DIM.length]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>

            {/* ── PROMEDIOS POR CURSO ──────────────────────── */}
            <section className="dash-section">
                <h2 className="section-title"><IoStatsChart size={18} /> Promedio de alumnos por curso</h2>
                <div className="charts-row">
                    <div className="chart-card medium">
                        <h3 className="chart-subtitle">Puntaje promedio</h3>
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={stats.promedios_cursos} margin={{ top: 5, right: 10, left: -20, bottom: 40 }} barSize={22}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E8F1FB" vertical={false} />
                                <XAxis dataKey="titulo" tick={{ fill: "#6B8BAF", fontSize: 10, angle: -25, textAnchor: "end" }} axisLine={false} tickLine={false} interval={0} />
                                <YAxis domain={[0, 100]} tick={{ fill: "#6B8BAF", fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F0F7FF" }} />
                                <Bar dataKey="promedio" name="Promedio %" radius={[6, 6, 0, 0]}>
                                    {stats.promedios_cursos.map((c, i) => (
                                        <Cell key={i} fill={c.promedio >= 85 ? "#4A90D9" : c.promedio >= 70 ? "#B39DDB" : "#F48FB1"} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="chart-card medium">
                        <h3 className="chart-subtitle">Ranking de cursos</h3>
                        <div className="ranking-table">
                            <div className="ranking-head">
                                <span>#</span><span>Curso</span><span>Alumnos</span><span>Promedio</span>
                            </div>
                            {[...stats.promedios_cursos].sort((a, b) => b.promedio - a.promedio).map((c, i) => (
                                <div key={i} className={`ranking-row ${i === 0 ? "best" : ""}`}>
                                    <span className="rank-pos">
                                        {i === 0 ? <IoMedal size={16} color="#F0A500" /> : i + 1}
                                    </span>
                                    <span className="rank-titulo">{c.titulo}</span>
                                    <span className="rank-alumnos"><IoPeople size={12} /> {c.estudiantes}</span>
                                    <span className="rank-score rank-score--dynamic" style={{ color: c.promedio >= 85 ? "#3A7BD5" : c.promedio >= 70 ? "#4A90D9" : "#87CEEB" }}>
                                        {c.promedio}%
                                        <div className="score-bar">
                                            <div className="score-fill" style={{ width: `${c.promedio}%`, background: c.promedio >= 85 ? "#4A90D9" : "#B39DDB" }} />
                                        </div>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── MEJOR CURSO ─────────────────────────────── */}
            {mejor_curso && (
                <section className="dash-section">
                    <div className="best-course-banner">
                        <IoTrophy size={36} color="#F0A500" />
                        <div>
                            <p className="best-label"><IoMedal size={13} /> Curso con mejor promedio</p>
                            <h3 className="best-titulo">{mejor_curso.titulo}</h3>
                            <p className="best-meta">
                                <IoPeople size={13} /> {mejor_curso.estudiantes} estudiantes &nbsp;·&nbsp;
                                <IoStar size={13} /> Promedio: <strong>{mejor_curso.promedio}%</strong>
                            </p>
                        </div>
                    </div>
                </section>
            )}

        </div>
    );
}