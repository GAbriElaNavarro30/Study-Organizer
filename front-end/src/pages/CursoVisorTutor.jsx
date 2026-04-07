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
    IoChevronBackOutline, IoChevronForwardOutline,
} from "react-icons/io5";
import api from "../services/api";
import "../styles/CursoVisorTutor.css";
import { ModalEliminar } from "../components/ModalEliminar";

const VARK_COLORS = {
    V: { bg: "#DBEAFE", text: "#1D4ED8", label: "Visual" },
    A: { bg: "#FEF9C3", text: "#854D0E", label: "Auditivo" },
    R: { bg: "#DCFCE7", text: "#15803D", label: "Lectura/Escritura" },
    K: { bg: "#FCE7F3", text: "#9D174D", label: "Kinestésico" },
    VA: { bg: "#EEF2FF", text: "#4338CA", label: "Visual-Auditivo" },
    VR: { bg: "#ECFDF5", text: "#065F46", label: "Visual-Lectura" },
    VK: { bg: "#F3E8FF", text: "#6B21A8", label: "Visual-Kinestésico" },
    AR: { bg: "#FFFBEB", text: "#B45309", label: "Auditivo-Lectura" },
    AK: { bg: "#FFF1F2", text: "#BE123C", label: "Auditivo-Kinestésico" },
    RK: { bg: "#F0FDF4", text: "#166534", label: "Lectura-Kinestésico" },
    VAR: { bg: "#EFF6FF", text: "#1E40AF", label: "V-A-Lectura" },
    VAK: { bg: "#F5F3FF", text: "#5B21B6", label: "V-A-Kinestésico" },
    VRK: { bg: "#ECFEFF", text: "#155E75", label: "V-L-Kinestésico" },
    ARK: { bg: "#FFF7ED", text: "#9A3412", label: "A-L-Kinestésico" },
    VARK: { bg: "#F0F9FF", text: "#0369A1", label: "Multimodal" },
};

const TABS = [
    { key: "contenido", label: "Contenido", icon: IoBookOutline },
    { key: "estudiantes", label: "Estudiantes", icon: IoPeopleOutline },
    { key: "resultados", label: "Resultados", icon: IoBarChartOutline },
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
/* ── Tab: Contenido (estilo preview del editor) ─────────── */
const TabContenido = ({ secciones }) => {
    const [secActiva, setSecActiva] = useState(0);

    const handlePrev = () => setSecActiva((p) => Math.max(0, p - 1));
    const handleNext = () => setSecActiva((p) => Math.min(secciones.length - 1, p + 1));

    const sec = secciones[secActiva] ?? secciones[0];

    if (!secciones || secciones.length === 0) {
        return (
            <div className="vct-empty">
                <IoLayersOutline size={32} />
                <p>Este curso no tiene secciones aún.</p>
            </div>
        );
    }

    return (
        <div className="vct-preview-root">
            {/* Layout sidebar + contenido */}
            <div className="vct-preview-layout">
                {/* Sidebar */}
                <div className="vct-preview-sidebar">
                    <div className="vct-preview-sidebar-title">
                        <IoLayersOutline size={11} />
                        {secciones.length} sección{secciones.length !== 1 ? "es" : ""}
                    </div>
                    {secciones.map((s, i) => (
                        <button
                            key={s._id || s.id_seccion}
                            className={`vct-preview-sec-btn ${i === secActiva ? "active" : ""}`}
                            onClick={() => setSecActiva(i)}
                        >
                            <span className="vct-preview-sec-num">{i + 1}</span>
                            <div className="vct-preview-sec-info">
                                <span className="vct-preview-sec-label">
                                    {s.titulo_seccion || <em>Sin título</em>}
                                </span>
                                <span className="vct-preview-sec-meta">
                                    {/*s.contenidos?.length || 0} bloque{s.contenidos?.length !== 1 ? "s" : ""*/}
                                    {s.preguntas?.length > 0 && ` ${s.preguntas.length} preg.`}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Contenido principal */}
                <div className="vct-preview-content">
                    {sec && (
                        <>
                            <div>
                                <div className="vct-preview-section-title">
                                    {sec.titulo_seccion || <em>Sin título</em>}
                                </div>
                                {sec.descripcion_seccion && (
                                    <div className="vct-preview-section-desc">
                                        {sec.descripcion_seccion}
                                    </div>
                                )}
                            </div>

                            <div className="vct-preview-blocks">
                                {sec.contenidos?.map((con) => (
                                    <div key={con._id || con.id_contenido} className="vct-preview-block">
                                        {con.titulo && (
                                            <div className="vct-preview-block-title">{con.titulo}</div>
                                        )}
                                        {con.contenido && (
                                            <div className="vct-preview-block-text">{con.contenido}</div>
                                        )}
                                        {(con.imagen_url || con.imagen_cropped_preview) && (
                                            <img
                                                src={con.imagen_url || con.imagen_cropped_preview}
                                                alt={con.titulo || "imagen"}
                                                className="vct-preview-block-img"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>

                            {sec.mostrarTest !== false && sec.preguntas?.length > 0 && (
                                <div className="vct-preview-quiz">
                                    <div className="vct-preview-quiz-header">
                                        <IoHelpCircleOutline size={13} /> Cuestionario de la sección
                                    </div>
                                    {sec.preguntas.map((preg, pi) => (
                                        <PreguntaVisor
                                            key={preg._id || preg.id_test}
                                            preg={preg}
                                            index={pi}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Navegación inferior */}
            <div className="vct-preview-nav">
                <button
                    className="vct-preview-nav-btn"
                    disabled={secActiva === 0}
                    onClick={handlePrev}
                >
                    <IoChevronBackOutline size={14} /> Anterior
                </button>
                <div className="vct-preview-nav-progress">
                    <div className="vct-preview-nav-dots">
                        {secciones.map((_, i) => (
                            <div
                                key={i}
                                className={`vct-preview-nav-dot ${i === secActiva ? "active" : i < secActiva ? "done" : ""}`}
                                onClick={() => setSecActiva(i)}
                                style={{ cursor: "pointer" }}
                            />
                        ))}
                    </div>
                    <span>Sección {secActiva + 1} de {secciones.length}</span>
                </div>
                <button
                    className={`vct-preview-nav-btn ${secActiva < secciones.length - 1 ? "vct-preview-nav-btn--next" : ""}`}
                    disabled={secActiva === secciones.length - 1}
                    onClick={handleNext}
                >
                    Siguiente <IoChevronForwardOutline size={14} />
                </button>
            </div>
        </div>
    );
};

/* ── Tab: Estudiantes ────────────────────────────────────── */
const TabEstudiantes = ({ idCurso }) => {
    const [estudiantes, setEstudiantes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [modalEstudiante, setModalEstudiante] = useState(null); // { id_usuario, nombre }
    const [eliminando, setEliminando] = useState(false);

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

    const handleEliminar = async () => {
        if (!modalEstudiante || eliminando) return;
        setEliminando(true);
        try {
            await api.delete(`/cursos/cursos/${idCurso}/estudiantes/${modalEstudiante.id_usuario}`);
            setEstudiantes(prev => prev.filter(e => e.id_usuario !== modalEstudiante.id_usuario));
            setModalEstudiante(null);
        } catch (err) {
            alert(err.response?.data?.mensaje || "Error al eliminar al estudiante.");
        } finally {
            setEliminando(false);
        }
    };

    if (cargando) return <div className="vct-tab-loading"><div className="vct-spinner" /><p>Cargando estudiantes…</p></div>;
    if (error) return <div className="vct-tab-error"><IoAlertCircleOutline size={22} /><p>{error}</p></div>;
    if (estudiantes.length === 0) return (
        <div className="vct-empty">
            <IoSchoolOutline size={32} />
            <p>Ningún estudiante inscrito aún.</p>
        </div>
    );

    return (
        <>
            {/* Modal de confirmación */}
            {modalEstudiante && (
                <ModalEliminar
                    isOpen={true}
                    onClose={() => setModalEstudiante(null)}
                    onConfirm={handleEliminar}
                    nombreUsuario={modalEstudiante.nombre}
                />
            )}

            <div className="vct-estudiantes-wrap">
                <div className="vct-estudiantes-badge">
                    <IoPeopleOutline size={15} />
                    <span>{estudiantes.length} estudiante{estudiantes.length !== 1 ? "s" : ""} inscritos</span>
                </div>

                <div className="vct-table-wrap">
                    <table className="vct-table">
                        <thead>
                            <tr>
                                <th>Estudiante</th>
                                <th>Correo</th>
                                <th>Teléfono</th>
                                <th>Fecha de inscripción</th>
                                <th></th>
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
                                    <td className="vct-td-muted">{e.telefono || "—"}</td>
                                    <td className="vct-td-muted">
                                        {e.fecha_inscripcion
                                            ? new Date(e.fecha_inscripcion).toLocaleString("es-MX", {
                                                day: "2-digit", month: "short", year: "numeric",
                                                hour: "2-digit", minute: "2-digit", hour12: true
                                            })
                                            : "—"}
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => setModalEstudiante({ id_usuario: e.id_usuario, nombre: `${e.nombre} ${e.apellido}` })}
                                            style={{
                                                display: "inline-flex", alignItems: "center", gap: 5,
                                                padding: "5px 12px", borderRadius: 7, border: "1px solid #FCA5A5",
                                                background: "#FEF2F2", color: "#DC2626", fontSize: 12,
                                                fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                                                transition: "all .15s", whiteSpace: "nowrap",
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.background = "#FEE2E2"; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = "#FEF2F2"; }}
                                        >
                                            <IoPersonOutline size={13} /> Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

/* ── Tab: Resultados ─────────────────────────────────────── */
const TabResultados = ({ idCurso }) => {
    const [resultados, setResultados] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

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
    if (error) return <div className="vct-tab-error"><IoAlertCircleOutline size={22} /><p>{error}</p></div>;
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
    const id = searchParams.get("id");
    const tabParam = searchParams.get("tab");

    const [curso, setCurso] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
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
                            {/*<span><IoBookOutline size={14} /> {totalBloques} bloques de contenido</span>*/}
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
                        <TabContenido secciones={curso.secciones || []} />
                    )}

                    {tabActiva === "estudiantes" && <TabEstudiantes idCurso={id} />}

                    {tabActiva === "resultados" && <TabResultados idCurso={id} />}

                </div>

            </main>
        </div>
    );
}