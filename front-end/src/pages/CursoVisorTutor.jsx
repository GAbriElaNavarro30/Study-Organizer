// src/pages/CursoVisorTutor.jsx
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    IoArrowBackOutline, IoBookOutline, IoChevronDownOutline,
    IoChevronUpOutline, IoCheckmarkCircle, IoEllipseOutline,
    IoHelpCircleOutline, IoSparkles,
    IoEyeOutline, IoLayersOutline, IoAlertCircleOutline,
    IoPeopleOutline, IoBarChartOutline, IoPersonOutline,
    IoTrophyOutline, IoTimeOutline, IoSchoolOutline,
} from "react-icons/io5";
import api from "../services/api";
import "../styles/CursoVisorTutor.css";

const VARK_COLORS = {
    V:    { bg: "#DBEAFE", text: "#1D4ED8", label: "Visual" },
    A:    { bg: "#FEF9C3", text: "#854D0E", label: "Auditivo" },
    R:    { bg: "#DCFCE7", text: "#15803D", label: "Lectura/Escritura" },
    K:    { bg: "#FCE7F3", text: "#9D174D", label: "Kinestésico" },
    VA:   { bg: "#EEF2FF", text: "#4338CA", label: "Visual-Auditivo" },
    VR:   { bg: "#ECFDF5", text: "#065F46", label: "Visual-Lectura" },
    VK:   { bg: "#F3E8FF", text: "#6B21A8", label: "Visual-Kinestésico" },
    AR:   { bg: "#FFFBEB", text: "#B45309", label: "Auditivo-Lectura" },
    AK:   { bg: "#FFF1F2", text: "#BE123C", label: "Auditivo-Kinestésico" },
    RK:   { bg: "#F0FDF4", text: "#166534", label: "Lectura-Kinestésico" },
    VAR:  { bg: "#EFF6FF", text: "#1E40AF", label: "V-A-Lectura" },
    VAK:  { bg: "#F5F3FF", text: "#5B21B6", label: "V-A-Kinestésico" },
    VRK:  { bg: "#ECFEFF", text: "#155E75", label: "V-L-Kinestésico" },
    ARK:  { bg: "#FFF7ED", text: "#9A3412", label: "A-L-Kinestésico" },
    VARK: { bg: "#F0F9FF", text: "#0369A1", label: "Multimodal" },
};

const TABS = [
    { key: "contenido",    label: "Contenido",    icon: IoBookOutline },
    { key: "estudiantes",  label: "Estudiantes",  icon: IoPeopleOutline },
    { key: "resultados",   label: "Resultados",   icon: IoBarChartOutline },
];

/* ── Pregunta de quiz (solo lectura) ─────────────────────── */
const PreguntaVisor = ({ preg, index }) => {
    const [seleccionada, setSeleccionada] = useState(null);
    const respondida = seleccionada !== null;

    return (
        <div className="vct-pregunta">
            <p className="vct-pregunta__texto">
                <span className="vct-pregunta__num">P{index + 1}.</span> {preg.texto_pregunta}
            </p>
            <div className="vct-opciones">
                {preg.opciones.map((op) => {
                    const esElegida = seleccionada === op._id || seleccionada === String(op.id_opcion);
                    const esCorrecta = op.es_correcta;
                    let cls = "vct-opcion";
                    if (respondida) {
                        if (esCorrecta) cls += " vct-opcion--correcta";
                        else if (esElegida) cls += " vct-opcion--incorrecta";
                    } else if (esElegida) {
                        cls += " vct-opcion--seleccionada";
                    }
                    return (
                        <button
                            key={op._id || op.id_opcion}
                            className={cls}
                            onClick={() => !respondida && setSeleccionada(op._id || String(op.id_opcion))}
                        >
                            <span className="vct-opcion__radio">
                                {respondida && esCorrecta
                                    ? <IoCheckmarkCircle size={16} />
                                    : <IoEllipseOutline size={16} />}
                            </span>
                            {op.texto_opcion}
                        </button>
                    );
                })}
            </div>
            {respondida && (
                <p className={`vct-feedback ${preg.opciones.find(o => (o._id || String(o.id_opcion)) === seleccionada)?.es_correcta ? "vct-feedback--ok" : "vct-feedback--err"}`}>
                    {preg.opciones.find(o => (o._id || String(o.id_opcion)) === seleccionada)?.es_correcta
                        ? "✓ Respuesta correcta"
                        : "✗ Respuesta incorrecta"}
                </p>
            )}
        </div>
    );
};

/* ── Sección expandible ──────────────────────────────────── */
const SeccionVisor = ({ sec, index }) => {
    const [abierta, setAbierta] = useState(index === 0);

    return (
        <div className={`vct-seccion ${abierta ? "vct-seccion--abierta" : ""}`}>
            <button className="vct-seccion__header" onClick={() => setAbierta(v => !v)}>
                <div className="vct-seccion__header-left">
                    <span className="vct-seccion__num">{String(index + 1).padStart(2, "0")}</span>
                    <div>
                        <p className="vct-seccion__titulo">{sec.titulo_seccion || "Sin título"}</p>
                        <p className="vct-seccion__meta">
                            {sec.contenidos?.length || 0} bloque{sec.contenidos?.length !== 1 ? "s" : ""}
                            {sec.preguntas?.length > 0 && ` · ${sec.preguntas.length} pregunta${sec.preguntas.length !== 1 ? "s" : ""}`}
                        </p>
                    </div>
                </div>
                {abierta ? <IoChevronUpOutline size={18} /> : <IoChevronDownOutline size={18} />}
            </button>

            {abierta && (
                <div className="vct-seccion__body">
                    {sec.contenidos?.map((con) => (
                        <div key={con._id || con.id_contenido} className="vct-bloque">
                            <h4 className="vct-bloque__titulo">{con.titulo}</h4>
                            {con.contenido && <p className="vct-bloque__texto">{con.contenido}</p>}
                            {(con.imagen_url || con.imagen_cropped_preview) && (
                                <div className="vct-bloque__img-wrap">
                                    <img
                                        src={con.imagen_url || con.imagen_cropped_preview}
                                        alt={con.titulo}
                                        className="vct-bloque__img"
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                    {sec.preguntas?.length > 0 && (
                        <div className="vct-quiz">
                            <div className="vct-quiz__header">
                                <IoHelpCircleOutline size={16} />
                                <span>Cuestionario de la sección</span>
                            </div>
                            {sec.preguntas.map((preg, pi) => (
                                <PreguntaVisor key={preg._id || preg.id_test} preg={preg} index={pi} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

/* ── Tab: Estudiantes ────────────────────────────────────── */
const TabEstudiantes = ({ idCurso }) => {
    const [estudiantes, setEstudiantes] = useState([]);
    const [cargando, setCargando]       = useState(true);
    const [error, setError]             = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get(`/cursos/cursos/${idCurso}/estudiantes`);
                setEstudiantes(data.estudiantes || []);
            } catch (err) {
                setError(err.response?.data?.mensaje || "No se pudieron cargar los estudiantes.");
            } finally {
                setCargando(false);
            }
        })();
    }, [idCurso]);

    if (cargando) return <div className="vct-tab-loading"><div className="vct-spinner" /><p>Cargando estudiantes…</p></div>;
    if (error)    return <div className="vct-tab-error"><IoAlertCircleOutline size={22} /><p>{error}</p></div>;
    if (estudiantes.length === 0) return (
        <div className="vct-empty">
            <IoSchoolOutline size={32} />
            <p>Ningún estudiante inscrito aún.</p>
        </div>
    );

    return (
        <div className="vct-table-wrap">
            <table className="vct-table">
                <thead>
                    <tr>
                        <th>Estudiante</th>
                        <th>Correo</th>
                        <th>Perfil VARK</th>
                        <th>Fecha de inscripción</th>
                    </tr>
                </thead>
                <tbody>
                    {estudiantes.map((e) => (
                        <tr key={e.id_usuario}>
                            <td>
                                <div className="vct-student-cell">
                                    <div className="vct-avatar">
                                        {e.foto_perfil
                                            ? <img src={e.foto_perfil} alt={e.nombre} />
                                            : <IoPersonOutline size={16} />}
                                    </div>
                                    <span>{e.nombre} {e.apellido}</span>
                                </div>
                            </td>
                            <td className="vct-td-muted">{e.correo_electronico}</td>
                            <td>
                                {e.perfil_vark
                                    ? <span className="vct-vark-pill"
                                        style={{ background: VARK_COLORS[e.perfil_vark]?.bg || "#F1F5F9", color: VARK_COLORS[e.perfil_vark]?.text || "#64748B" }}>
                                        {e.perfil_vark}
                                    </span>
                                    : <span className="vct-td-muted">—</span>}
                            </td>
                            <td className="vct-td-muted">
                                {e.fecha_inscripcion
                                    ? new Date(e.fecha_inscripcion).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })
                                    : "—"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

/* ── Tab: Resultados ─────────────────────────────────────── */
const TabResultados = ({ idCurso }) => {
    const [resultados, setResultados] = useState([]);
    const [cargando, setCargando]     = useState(true);
    const [error, setError]           = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get(`/cursos/cursos/${idCurso}/resultados`);
                setResultados(data.resultados || []);
            } catch (err) {
                setError(err.response?.data?.mensaje || "No se pudieron cargar los resultados.");
            } finally {
                setCargando(false);
            }
        })();
    }, [idCurso]);

    if (cargando) return <div className="vct-tab-loading"><div className="vct-spinner" /><p>Cargando resultados…</p></div>;
    if (error)    return <div className="vct-tab-error"><IoAlertCircleOutline size={22} /><p>{error}</p></div>;
    if (resultados.length === 0) return (
        <div className="vct-empty">
            <IoTrophyOutline size={32} />
            <p>Aún no hay resultados registrados.</p>
        </div>
    );

    const promedio = resultados.reduce((s, r) => s + Number(r.puntaje || 0), 0) / resultados.length;

    return (
        <div>
            {/* Resumen */}
            <div className="vct-resultados-stats">
                <div className="vct-stat-card">
                    <IoPeopleOutline size={18} />
                    <p className="vct-stat-card__val">{resultados.length}</p>
                    <p className="vct-stat-card__lbl">Evaluados</p>
                </div>
                <div className="vct-stat-card">
                    <IoTrophyOutline size={18} />
                    <p className="vct-stat-card__val">{promedio.toFixed(1)}</p>
                    <p className="vct-stat-card__lbl">Prom. puntaje</p>
                </div>
                <div className="vct-stat-card">
                    <IoBarChartOutline size={18} />
                    <p className="vct-stat-card__val">
                        {Math.max(...resultados.map(r => Number(r.puntaje || 0))).toFixed(1)}
                    </p>
                    <p className="vct-stat-card__lbl">Puntaje más alto</p>
                </div>
            </div>

            {/* Tabla */}
            <div className="vct-table-wrap">
                <table className="vct-table">
                    <thead>
                        <tr>
                            <th>Estudiante</th>
                            <th>Puntaje</th>
                            <th>Nivel</th>
                            <th>Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
                        {resultados.map((r, i) => (
                            <tr key={i}>
                                <td>
                                    <div className="vct-student-cell">
                                        <div className="vct-avatar">
                                            {r.foto_perfil
                                                ? <img src={r.foto_perfil} alt={r.nombre} />
                                                : <IoPersonOutline size={16} />}
                                        </div>
                                        <span>{r.nombre} {r.apellido}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="vct-puntaje-wrap">
                                        <span className="vct-puntaje-val">{Number(r.puntaje || 0).toFixed(1)}</span>
                                        <div className="vct-puntaje-bar">
                                            <div className="vct-puntaje-fill" style={{ width: `${Math.min(r.puntaje, 100)}%` }} />
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className={`vct-nivel-pill vct-nivel--${r.nivel || "sin-nivel"}`}>
                                        {r.nivel || "Sin nivel"}
                                    </span>
                                </td>
                                <td className="vct-td-muted">
                                    {r.fecha
                                        ? new Date(r.fecha).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })
                                        : "—"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
═══════════════════════════════════════════════════════════ */
export function CursoVisorTutor() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const id  = searchParams.get("id");
    const tabParam = searchParams.get("tab");

    const [curso, setCurso]       = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError]       = useState(null);
    const [tabActiva, setTabActiva] = useState(
        TABS.find(t => t.key === tabParam)?.key || "contenido"
    );

    const cambiarTab = (key) => {
        setTabActiva(key);
        setSearchParams({ id, tab: key });
    };

    useEffect(() => {
        if (!id) { setError("No se especificó un curso."); setCargando(false); return; }
        (async () => {
            try {
                setCargando(true);
                const { data } = await api.get(`/cursos/cursos/${id}`);
                if (!data.ok) throw new Error(data.mensaje);
                setCurso(data.curso);
            } catch (err) {
                setError(err.response?.data?.mensaje || err.message);
            } finally {
                setCargando(false);
            }
        })();
    }, [id]);

    if (cargando) return (
        <div className="vct-root">
            <div className="vct-loading">
                <div className="vct-spinner" />
                <p>Cargando vista previa…</p>
            </div>
        </div>
    );

    if (error || !curso) return (
        <div className="vct-root">
            <div className="vct-error">
                <IoAlertCircleOutline size={32} />
                <p>{error || "Curso no encontrado."}</p>
                <button className="vct-back-btn" onClick={() => navigate("/cursos-tutor")}>
                    Volver
                </button>
            </div>
        </div>
    );

    const vark = VARK_COLORS[curso.perfil_vark];
    const totalBloques = curso.secciones?.reduce((a, s) => a + (s.contenidos?.length || 0), 0) || 0;

    return (
        <div className="vct-root">

            {/* ── Topbar ── */}
            <header className="vct-topbar">
                <button className="vct-back-btn" onClick={() => navigate("/cursos-tutor")}>
                    <IoArrowBackOutline size={16} /> Volver
                </button>
                <div className="vct-topbar__badge">
                    <IoEyeOutline size={13} /> Vista previa del tutor
                </div>
            </header>

            <main className="vct-main">

                {/* ── Hero / portada ── */}
                <div className="vct-hero">
                    {curso.foto ? (
                        <div className="vct-hero__cover">
                            <img src={curso.foto} alt={curso.titulo} className="vct-hero__cover-img" />
                            <div className="vct-hero__cover-overlay" />
                        </div>
                    ) : (
                        <div className="vct-hero__cover vct-hero__cover--placeholder"
                            style={{ background: `hsl(${(curso.titulo?.charCodeAt(0) || 65) * 7 % 360},40%,88%)` }}
                        />
                    )}
                    <div className="vct-hero__content">
                        {vark && (
                            <span className="vct-vark-badge" style={{ background: vark.bg, color: vark.text }}>
                                <IoSparkles size={11} /> {curso.perfil_vark} — {vark.label}
                            </span>
                        )}
                        <h1 className="vct-hero__titulo">{curso.titulo}</h1>
                        {curso.descripcion && <p className="vct-hero__desc">{curso.descripcion}</p>}
                        <div className="vct-hero__stats">
                            <span><IoLayersOutline size={14} /> {curso.secciones?.length || 0} secciones</span>
                            <span><IoBookOutline size={14} /> {totalBloques} bloques de contenido</span>
                            {curso.nombre_dimension && <span><IoSparkles size={14} /> {curso.nombre_dimension}</span>}
                        </div>
                    </div>
                </div>

                {/* ── Tabs ── */}
                <div className="vct-tabs">
                    {TABS.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            className={`vct-tab ${tabActiva === key ? "vct-tab--activa" : ""}`}
                            onClick={() => cambiarTab(key)}
                        >
                            <Icon size={15} /> {label}
                        </button>
                    ))}
                </div>

                {/* ── Contenido del tab activo ── */}
                <div className="vct-tab-panel">

                    {tabActiva === "contenido" && (
                        <div className="vct-secciones">
                            <h2 className="vct-secciones__heading">Contenido del curso</h2>
                            {curso.secciones?.length > 0
                                ? curso.secciones.map((sec, si) => (
                                    <SeccionVisor key={sec._id || sec.id_seccion} sec={sec} index={si} />
                                ))
                                : <p className="vct-empty">Este curso no tiene secciones aún.</p>
                            }
                        </div>
                    )}

                    {tabActiva === "estudiantes" && <TabEstudiantes idCurso={id} />}

                    {tabActiva === "resultados" && <TabResultados idCurso={id} />}

                </div>

            </main>
        </div>
    );
}