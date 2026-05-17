// src/pages/CursoVisorTutor.jsx
import { useState } from "react";
import {
    IoArrowBackOutline, IoBookOutline, IoChevronDownOutline,
    IoChevronUpOutline, IoCheckmarkCircle, IoEllipseOutline,
    IoHelpCircleOutline, IoSparkles,
    IoEyeOutline, IoLayersOutline, IoAlertCircleOutline,
    IoPeopleOutline, IoBarChartOutline, IoPersonOutline,
    IoTrophyOutline, IoTimeOutline, IoSchoolOutline,
    IoChevronBackOutline, IoChevronForwardOutline,
    IoSearchOutline, IoTrashOutline, IoMailOutline,
    IoCallOutline, IoCalendarOutline,
} from "react-icons/io5";
import "../styles/CursoVisorTutor.css";
import { ModalEliminar } from "../components/ModalEliminar";
import { CustomAlert } from "../components/CustomAlert";
import logo from "../assets/imagenes/logotipo.png";
import {
    useCursoVisorTutor,
    useTabEstudiantes,
    useTabResultados,
    PAGE_SIZE_OPTIONS,
} from "../hooks/useCursoVisorTutor";

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

/* ── Tab: Estudiantes — tabla en fila ────────────────────── */
const TabEstudiantes = ({ idCurso }) => {
    const {
        estudiantes,
        cargando,
        error,
        modalEstudiante,
        setModalEstudiante,
        eliminando,
        alert,
        setAlert,
        busqueda,
        setBusqueda,
        paginaActual,
        setPaginaActual,
        porPagina,
        setPorPagina,
        estudiantesFiltrados,
        totalPaginas,
        paginaSegura,
        inicio,
        estudiantesPagina,
        handleEliminar,
        formatFecha,
        getInitials,
    } = useTabEstudiantes(idCurso);

    if (cargando) return (
        <div className="vct-tab-loading">
            <div className="vct-spinner" />
            <p>Cargando estudiantes…</p>
        </div>
    );
    if (error) return (
        <div className="vct-tab-error">
            <IoAlertCircleOutline size={22} />
            <p>{error}</p>
        </div>
    );

    return (
        <>
            {/* Modal de confirmación para eliminar */}
            {modalEstudiante && (
                <ModalEliminar
                    isOpen={true}
                    onClose={() => setModalEstudiante(null)}
                    onConfirm={handleEliminar}
                    nombreUsuario={modalEstudiante.nombre}
                />
            )}

            {/* Custom Alert de éxito/error */}
            {alert && (
                <CustomAlert
                    type={alert.type}
                    title={alert.title}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                    logo={logo}
                />
            )}

            <div className="vct-est-root">

                {/* ── Encabezado: contador + búsqueda + selector porPagina ── */}
                <div className="vct-est-header">
                    {/* Badge contador */}
                    <div className="vct-est-header-left">
                        <div className="vct-est-count-badge">
                            <IoPeopleOutline size={15} />
                            <span>
                                {estudiantesFiltrados.length !== estudiantes.length
                                    ? `${estudiantesFiltrados.length} de ${estudiantes.length}`
                                    : estudiantes.length}{" "}
                                estudiante{estudiantes.length !== 1 ? "s" : ""}
                            </span>
                        </div>
                    </div>

                    {/* Barra de búsqueda */}
                    <div className="vct-est-search-wrap">
                        <IoSearchOutline size={15} className="vct-est-search-icon" />
                        <input
                            type="text"
                            className="vct-est-search"
                            placeholder="Buscar por nombre, correo, teléfono o fecha…"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                        {busqueda && (
                            <button
                                className="vct-est-search-clear"
                                onClick={() => setBusqueda("")}
                                title="Limpiar búsqueda"
                            >
                                ×
                            </button>
                        )}
                    </div>

                    {/* Selector "Mostrar X por página" — junto a la búsqueda */}
                    <div className="vct-est-per-page-inline">
                        <span className="vct-est-per-page-label">Mostrar</span>
                        <select
                            className="vct-est-per-page-select"
                            value={porPagina}
                            onChange={(ev) => setPorPagina(Number(ev.target.value))}
                        >
                            {PAGE_SIZE_OPTIONS.map((n) => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* ── Sin resultados ── */}
                {estudiantesFiltrados.length === 0 && (
                    <div className="vct-empty">
                        <IoSchoolOutline size={32} />
                        <p>
                            {busqueda
                                ? `Sin resultados para "${busqueda}".`
                                : "Ningún estudiante inscrito aún."}
                        </p>
                    </div>
                )}

                {/* ── Tabla de estudiantes en fila ── */}
                {estudiantesFiltrados.length > 0 && (
                    <>
                        <div className="vct-est-table-wrap">
                            <table className="vct-est-table">
                                <thead>
                                    <tr>
                                        <th>Estudiante</th>
                                        <th>Correo</th>
                                        <th>Teléfono</th>
                                        <th>Inscripción</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {estudiantesPagina.map((e) => (
                                        <tr key={e.id_usuario}>
                                            {/* Nombre con avatar */}
                                            <td>
                                                <div className="vct-est-name-cell">
                                                    <div className="vct-est-avatar-sm">
                                                        {e.foto_perfil
                                                            ? <img src={e.foto_perfil} alt={e.nombre} />
                                                            : <span className="vct-est-initials-sm">{getInitials(e.nombre, e.apellido)}</span>
                                                        }
                                                    </div>
                                                    <span className="vct-est-name-text">{e.nombre} {e.apellido}</span>
                                                </div>
                                            </td>
                                            {/* Correo */}
                                            <td>
                                                {e.correo_electronico
                                                    ? <span className="vct-est-td-contact">{e.correo_electronico}</span>
                                                    : <span className="vct-est-td-empty">—</span>
                                                }
                                            </td>
                                            {/* Teléfono */}
                                            <td>
                                                {e.telefono
                                                    ? <span className="vct-est-td-contact">{e.telefono}</span>
                                                    : <span className="vct-est-td-empty">—</span>
                                                }
                                            </td>
                                            {/* Fecha inscripción */}
                                            <td>
                                                <span className="vct-est-td-fecha">{formatFecha(e.fecha_inscripcion)}</span>
                                            </td>
                                            {/* Acciones */}
                                            <td className="vct-est-td-acciones">
                                                <button
                                                    className="vct-est-btn-delete"
                                                    onClick={() => setModalEstudiante({ id_usuario: e.id_usuario, nombre: `${e.nombre} ${e.apellido}` })}
                                                    title="Eliminar estudiante"
                                                >
                                                    <IoTrashOutline size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* ── Paginación centrada ── */}
                        <div className="vct-est-pagination">
                            <p className="vct-est-pag-info">
                                {estudiantesFiltrados.length === 0
                                    ? "0 resultados"
                                    : `${inicio + 1}–${Math.min(inicio + porPagina, estudiantesFiltrados.length)} de ${estudiantesFiltrados.length} estudiantes`}
                            </p>

                            <div className="vct-est-pag-btns">
                                <button
                                    className="vct-est-pag-btn"
                                    disabled={paginaSegura === 1}
                                    onClick={() => setPaginaActual(1)}
                                    title="Primera página"
                                >
                                    «
                                </button>
                                <button
                                    className="vct-est-pag-btn"
                                    disabled={paginaSegura === 1}
                                    onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                                    title="Página anterior"
                                >
                                    <IoChevronBackOutline size={14} />
                                </button>

                                {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                                    .filter((p) => Math.abs(p - paginaSegura) <= 2 || p === 1 || p === totalPaginas)
                                    .reduce((acc, p, idx, arr) => {
                                        if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                                        acc.push(p);
                                        return acc;
                                    }, [])
                                    .map((item, i) =>
                                        item === "..." ? (
                                            <span key={`ellipsis-${i}`} className="vct-est-pag-ellipsis">…</span>
                                        ) : (
                                            <button
                                                key={item}
                                                className={`vct-est-pag-btn vct-est-pag-btn--num ${item === paginaSegura ? "active" : ""}`}
                                                onClick={() => setPaginaActual(item)}
                                            >
                                                {item}
                                            </button>
                                        )
                                    )}

                                <button
                                    className="vct-est-pag-btn"
                                    disabled={paginaSegura === totalPaginas}
                                    onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
                                    title="Página siguiente"
                                >
                                    <IoChevronForwardOutline size={14} />
                                </button>
                                <button
                                    className="vct-est-pag-btn"
                                    disabled={paginaSegura === totalPaginas}
                                    onClick={() => setPaginaActual(totalPaginas)}
                                    title="Última página"
                                >
                                    »
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

/* ── Tab: Resultados ─────────────────────────────────────── */
const TabResultados = ({ idCurso, curso }) => {
    const {
        resultados,
        cargando,
        error,
        promedio,
        puntajeMaximo,
        navegarAHistorial,
    } = useTabResultados(idCurso);

    const formatFecha = (fecha) =>
        fecha
            ? new Date(fecha).toLocaleString("es-MX", {
                day: "2-digit", month: "short", year: "numeric",
                hour: "2-digit", minute: "2-digit", hour12: true,
            })
            : "—";

    if (cargando) return <div className="vct-tab-loading"><div className="vct-spinner" /><p>Cargando resultados…</p></div>;
    if (error) return <div className="vct-tab-error"><IoAlertCircleOutline size={22} /><p>{error}</p></div>;
    if (resultados.length === 0) return (
        <div className="vct-empty">
            <IoTrophyOutline size={32} />
            <p>Aún no hay resultados registrados.</p>
        </div>
    );

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
                    <p className="vct-stat-card__val">{puntajeMaximo.toFixed(1)}</p>
                    <p className="vct-stat-card__lbl">Puntaje más alto</p>
                </div>
            </div>

            {/* Tabla */}
            <div className="vct-table-wrap">
                <table className="vct-table vct-table--resultados">
                    <thead>
                        <tr>
                            <th>Estudiante</th>
                            <th>Puntaje</th>
                            <th>Respuestas</th>
                            <th>Nivel</th>
                            <th>Fecha inicio</th>
                            <th>Fecha término</th>
                        </tr>
                    </thead>
                    <tbody>
                        {resultados.map((r, i) => (
                            <tr
                                key={i}
                                className="vct-table--resultados-row"
                                onDoubleClick={() => navegarAHistorial(r, curso)}
                            >
                                {/* Estudiante */}
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

                                {/* Puntaje con barra */}
                                <td>
                                    <div className="vct-puntaje-wrap">
                                        <span className="vct-puntaje-val">
                                            {Number(r.puntaje || 0).toFixed(1)}
                                        </span>
                                        <div className="vct-puntaje-bar">
                                            <div
                                                className="vct-puntaje-fill"
                                                style={{ "--puntaje-pct": `${Math.min(r.puntaje, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </td>

                                {/* Respuestas correctas X/Y */}
                                <td>
                                    <span className="vct-respuestas-pill">
                                        {r.respuestas_correctas ?? "—"}/{r.total_preguntas ?? "—"}
                                    </span>
                                </td>

                                {/* Nivel */}
                                <td>
                                    <span className={`vct-nivel-pill vct-nivel--${r.nivel || "sin-nivel"}`}>
                                        {r.nivel || "Sin nivel"}
                                    </span>
                                </td>

                                {/* Fecha inicio */}
                                <td className="vct-td-muted">
                                    <span className="vct-fecha-cell">
                                        <IoCalendarOutline size={13} />
                                        {formatFecha(r.fecha_inicio)}
                                    </span>
                                </td>

                                {/* Fecha término */}
                                <td className="vct-td-muted">
                                    <span className="vct-fecha-cell">
                                        <IoTimeOutline size={13} />
                                        {formatFecha(r.fecha_fin)}
                                    </span>
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
    const {
        id,
        curso,
        cargando,
        error,
        tabActiva,
        cambiarTab,
        navigate,
    } = useCursoVisorTutor();

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
                        <div
                            className="vct-hero__cover vct-hero__cover--placeholder"
                            style={{ "--placeholder-hue": `${(curso.titulo?.charCodeAt(0) || 65) * 7 % 360}` }}
                        />
                    )}
                    <div className="vct-hero__content">
                        {vark && (
                            <span
                                className="vct-vark-badge"
                                style={{ "--vark-bg": vark.bg, "--vark-text": vark.text }}
                            >
                                <IoSparkles size={11} /> {curso.perfil_vark} — {vark.label}
                            </span>
                        )}
                        <h1 className="vct-hero__titulo">{curso.titulo}</h1>
                        {curso.descripcion && <p className="vct-hero__desc">{curso.descripcion}</p>}
                        <div className="vct-hero__stats">
                            <span><IoLayersOutline size={14} /> {curso.secciones?.length || 0} secciones</span>
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

                    {tabActiva === "resultados" && <TabResultados idCurso={id} curso={curso} />}

                </div>

            </main>
        </div>
    );
}