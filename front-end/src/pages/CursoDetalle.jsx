// src/pages/Cursos/CursoDetalle.jsx
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
    IoArrowBackOutline, IoBookOutline, IoLayersOutline,
    IoPersonOutline, IoCheckmarkCircleOutline,
    IoPlayCircleOutline, IoRefreshOutline,
    IoChevronDownOutline, IoDocumentTextOutline,
    IoAnalyticsOutline, IoRibbonOutline,
    IoTimeOutline, IoMailOutline, IoCallOutline,
    IoSchoolOutline, IoStarOutline,
    IoArchiveOutline, IoAlertCircleOutline,
    IoHelpCircleOutline, IoReaderOutline,
    IoContract, IoExpand, IoListOutline,
    IoTrophyOutline
} from "react-icons/io5";
import "../styles/cursoDetalle.css";
import { useCursoDetalle } from "../hooks/useCursoDetalle.js";
import { ModalCancelarInscripcion } from "../components/ModalCancelarInscripcion";
import { CustomAlert } from "../components/CustomAlert";
import logo from "../assets/imagenes/logotipo.png";

const VARK_LABELS = { V: "Visual", A: "Auditivo", R: "Lector / Escritor", K: "Kinestésico" };
const VARK_COLORS = { V: "#0C447C", A: "#27500A", R: "#633806", K: "#3C3489" };
const VARK_BG = { V: "#E6F1FB", A: "#EAF3DE", R: "#FAEEDA", K: "#EEEDFE" };
const VARK_CHIP_BG = { V: "#B5D4F4", A: "#C0DD97", R: "#FAC775", K: "#CECBF6" };

/* ══════════════════════════════════════════════
   LOADING
══════════════════════════════════════════════ */
function LoadingState() {
    return (
        <div className="cd-loading">
            <IoBookOutline size={40} className="cd-loading-icon" />
            <p className="cd-loading-text">Cargando curso…</p>
        </div>
    );
}

/* ══════════════════════════════════════════════
   SECCIÓN INDIVIDUAL
══════════════════════════════════════════════ */
function SeccionItem({ seccion, numero, defaultOpen = true }) {
    const [open, setOpen] = useState(defaultOpen);
    const totalContenidos = seccion.contenidos?.length || 0;
    const totalPreguntas = seccion.preguntas?.length || 0;

    return (
        <div className={`cc-section${open ? " open" : ""}`}>
            <button
                className="cc-section-btn"
                onClick={() => setOpen(v => !v)}
                aria-expanded={open}
            >
                <div className="cc-num">{numero}</div>
                <div className="cc-section-meta">
                    <span className="cc-section-name">{seccion.titulo_seccion}</span>
                    <div className="cc-section-sub">
                        {totalContenidos > 0 && (
                            <span className="cc-section-sub-item">
                                <IoReaderOutline size={11} />
                                {totalContenidos} contenido{totalContenidos !== 1 ? "s" : ""}
                            </span>
                        )}
                        {totalPreguntas > 0 && (
                            <span className="cc-section-sub-item cc-section-sub-item--quiz">
                                <IoHelpCircleOutline size={11} />
                                {totalPreguntas} pregunta{totalPreguntas !== 1 ? "s" : ""}
                            </span>
                        )}
                    </div>
                </div>
                <IoChevronDownOutline
                    size={14}
                    className={`cc-chevron${open ? " cc-chevron--up" : ""}`}
                />
            </button>

            {open && (
                <div className="cc-body">
                    {totalContenidos > 0 && (
                        <div className="cc-contenidos-list">
                            {seccion.contenidos.map((c, i) => (
                                <div key={c.id_contenido} className="cc-item">
                                    <div className={`cc-item-line${i === 0 ? " cc-item-line--first" : ""}${i === totalContenidos - 1 ? " cc-item-line--last" : ""}`} />
                                    <div className="cc-item-dot" />
                                    <span className="cc-item-title">{c.titulo || `Contenido ${i + 1}`}</span>
                                    <span className="cc-item-type">Lectura</span>
                                </div>
                            ))}
                        </div>
                    )}
                    {totalPreguntas > 0 && (
                        <div className="cc-quiz-block">
                            <div className="cc-quiz-icon-wrap">
                                <IoHelpCircleOutline size={14} />
                            </div>
                            <div className="cc-quiz-info">
                                <span className="cc-quiz-label">Cuestionario de sección</span>
                                <span className="cc-quiz-sub">
                                    {totalPreguntas} pregunta{totalPreguntas !== 1 ? "s" : ""} de opción múltiple
                                </span>
                            </div>
                        </div>
                    )}
                    {totalContenidos === 0 && totalPreguntas === 0 && (
                        <p className="cc-empty-section">Esta sección aún no tiene contenido.</p>
                    )}
                </div>
            )}
        </div>
    );
}

/* ══════════════════════════════════════════════
   CONTENIDO DEL CURSO
══════════════════════════════════════════════ */
function CourseContent({ secciones }) {
    const [allOpen, setAllOpen] = useState(true);
    const [key, setKey] = useState(0);

    const totalContenidos = secciones.reduce((acc, s) => acc + (s.contenidos?.length || 0), 0);
    const totalPreguntas = secciones.reduce((acc, s) => acc + (s.preguntas?.length || 0), 0);

    const handleToggleAll = () => {
        setAllOpen(v => !v);
        setKey(k => k + 1);
    };

    return (
        <div className="cd-block">
            <div className="cd-block-head">
                <IoLayersOutline size={15} className="cd-block-head-icon" />
                <h2 className="cd-block-head-title">Contenido del curso</h2>
                {secciones.length > 0 && (
                    <span className="cd-block-head-badge">{secciones.length} secciones</span>
                )}
                {secciones.length > 0 && (
                    <button
                        className="cc-toggle-all-btn"
                        onClick={handleToggleAll}
                        title={allOpen ? "Colapsar todo" : "Expandir todo"}
                    >
                        {allOpen
                            ? <><IoContract size={12} /> Colapsar</>
                            : <><IoExpand size={12} /> Expandir</>
                        }
                    </button>
                )}
            </div>

            {secciones.length > 0 ? (
                <>
                    <div className="cc-sections" key={key}>
                        {secciones.map((s, i) => (
                            <SeccionItem
                                key={s.id_seccion}
                                seccion={s}
                                numero={i + 1}
                                defaultOpen={allOpen}
                            />
                        ))}
                    </div>
                    <div className="cc-footer">
                        <div className="cc-footer-stat">
                            <span className="cc-footer-num">{secciones.length}</span>
                            <span className="cc-footer-lbl">secciones</span>
                        </div>
                        <div className="cc-footer-divider" />
                        <div className="cc-footer-stat">
                            <span className="cc-footer-num">{totalContenidos}</span>
                            <span className="cc-footer-lbl">contenidos</span>
                        </div>
                        {totalPreguntas > 0 && (
                            <>
                                <div className="cc-footer-divider" />
                                <div className="cc-footer-stat">
                                    <span className="cc-footer-num">{totalPreguntas}</span>
                                    <span className="cc-footer-lbl">preguntas</span>
                                </div>
                            </>
                        )}
                    </div>
                </>
            ) : (
                <p className="cd-empty-text">Este curso aún no tiene secciones.</p>
            )}
        </div>
    );
}

/* ══════════════════════════════════════════════
   INSTRUCTOR
══════════════════════════════════════════════ */
function InstructorCard({ tutor }) {
    if (!tutor?.nombre) return null;
    const initials = tutor.nombre.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();

    return (
        <div className="cd-block">
            <div className="cd-block-head">
                <IoSchoolOutline size={15} className="cd-block-head-icon" />
                <h2 className="cd-block-head-title">Instructor</h2>
            </div>
            <div className="cd-instructor-wrap">
                {tutor.foto
                    ? <img src={tutor.foto} alt={tutor.nombre} className="cd-instructor-avatar-img" />
                    : <div className="cd-instructor-avatar-initials">{initials}</div>
                }
                <div className="cd-instructor-info">
                    <span className="cd-instructor-badge">
                        <IoStarOutline size={10} /> Tutor
                    </span>
                    <h3 className="cd-instructor-nombre">{tutor.nombre}</h3>
                    <p className="cd-instructor-rol">Instructor del curso</p>
                    {tutor.descripcion && (
                        <p className="cd-instructor-bio">{tutor.descripcion}</p>
                    )}
                    {(tutor.correo || tutor.telefono) && (
                        <div className="cd-instructor-contacts">
                            {tutor.correo && (
                                <a href={`mailto:${tutor.correo}`} className="cd-instructor-contact">
                                    <IoMailOutline size={13} /> {tutor.correo}
                                </a>
                            )}
                            {tutor.telefono && (
                                <span className="cd-instructor-contact cd-instructor-contact--plain">
                                    <IoCallOutline size={13} /> {tutor.telefono}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════
   BLOQUE DE RESULTADOS
══════════════════════════════════════════════ */
function ResultadosBlock({ ultimoResultado, completado, onVerResultados, onVerHistorial }) {
    return (
        <div className="cd-block">
            <div className="cd-block-head">
                <IoTrophyOutline size={15} className="cd-block-head-icon" />
                <h2 className="cd-block-head-title">Resultados</h2>
            </div>
            <div className="cd-resultados-grid">

                {/* Último resultado */}
                <div className="cd-resultado-item">
                    <div className="cd-resultado-item-icon cd-resultado-item-icon--blue">
                        <IoAnalyticsOutline size={16} />
                    </div>
                    <div className="cd-resultado-item-info">
                        <span className="cd-resultado-item-label">Último resultado</span>
                        <span className="cd-resultado-item-desc">
                            {ultimoResultado
                                ? "Revisa tu puntaje y respuestas del intento más reciente."
                                : "Aún no tienes resultados registrados en este curso."}
                        </span>
                    </div>
                    <button
                        className="cd-resultado-btn"
                        onClick={onVerResultados}
                        disabled={!ultimoResultado && !completado}
                    >
                        Ver resultado
                    </button>
                </div>

                <div className="cd-resultado-divider" />

                {/* Historial */}
                <div className="cd-resultado-item">
                    <div className="cd-resultado-item-icon cd-resultado-item-icon--purple">
                        <IoListOutline size={16} />
                    </div>
                    <div className="cd-resultado-item-info">
                        <span className="cd-resultado-item-label">Historial de intentos</span>
                        <span className="cd-resultado-item-desc">
                            Consulta todos tus intentos anteriores y los puntajes obtenidos.
                        </span>
                    </div>
                    <button
                        className="cd-resultado-btn"
                        onClick={onVerHistorial}
                        disabled={!ultimoResultado && !completado}
                    >
                        Ver historial
                    </button>
                </div>

            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════
   ENROLL CARD
══════════════════════════════════════════════ */
function EnrollCard({
    curso, inscrito, progreso, completado, pct,
    ultimoResultado, totalContenidos, totalPreguntas, inscribiendo,
    onInscribirse, onCancelar, onIniciar, onRetomar, onVerResultados,
}) {
    const archivado = curso?.archivado;

    const StatusBadge = () => {
        if (!inscrito) return <span className="cd-status-badge cd-status-badge--neutral">Sin inscribir</span>;
        if (archivado) return (
            <span className="cd-status-badge cd-status-badge--warning">
                <IoArchiveOutline size={11} /> Archivado
            </span>
        );
        if (completado) return (
            <span className="cd-status-badge cd-status-badge--success">
                <IoCheckmarkCircleOutline size={11} /> Completado
            </span>
        );
        return (
            <span className="cd-status-badge cd-status-badge--info">
                <IoRibbonOutline size={11} /> Inscrito
            </span>
        );
    };

    const ProgressArea = () => {
        if (!inscrito || completado) return <div className="cd-enroll-progress-placeholder" />;
        return (
            <div className="cd-enroll-progress">
                <div className="cd-enroll-progress-header">
                    <span className="cd-enroll-progress-label">Progreso</span>
                    <strong className="cd-enroll-progress-pct">{pct}%</strong>
                </div>
                <div className="cd-enroll-progress-track">
                    <div className="cd-enroll-progress-fill" style={{ width: `${pct}%` }} />
                </div>
                <p className="cd-enroll-progress-sub">
                    {progreso?.vistos ?? 0} de {progreso?.total ?? totalContenidos} contenidos vistos
                </p>
            </div>
        );
    };

    const Actions = () => {
        if (!inscrito) {
            if (archivado) return null;
            return (
                <button
                    className="cd-action-primary cd-action-primary--blue"
                    onClick={onInscribirse}
                    disabled={inscribiendo}
                >
                    <IoRibbonOutline size={14} />
                    {inscribiendo ? "Inscribiendo…" : "Inscribirse al curso"}
                </button>
            );
        }

        if (archivado) return (
            <>
                <div className="cd-archived-notice">
                    <IoAlertCircleOutline size={13} />
                    No se pueden realizar nuevos intentos
                </div>
                {completado && (
                    <button className="cd-action-primary cd-action-primary--blue" onClick={onVerResultados}>
                        <IoAnalyticsOutline size={14} /> Ver último resultado
                    </button>
                )}
                <button className="cd-action-secondary" onClick={onRetomar}>
                    <IoBookOutline size={13} /> Ver contenido
                </button>
                <button className="cd-action-cancel" onClick={onCancelar}>Cancelar inscripción</button>
            </>
        );

        if (completado) return (
            <>
                {/*<button className="cd-action-primary cd-action-primary--blue" onClick={onVerResultados}>
                    <IoAnalyticsOutline size={14} /> Ver último resultado
                </button>*/}
                <button className="cd-action-secondary" onClick={onIniciar}>
                    <IoRefreshOutline size={13} /> Tomar de nuevo el curso
                </button>
                <button className="cd-action-cancel" onClick={onCancelar}>Cancelar inscripción</button>
            </>
        );

        return (
            <>
                <button
                    className="cd-action-primary cd-action-primary--green"
                    onClick={pct > 0 ? onRetomar : onIniciar}
                >
                    <IoPlayCircleOutline size={14} />
                    {pct > 0 ? "Continuar curso" : "Iniciar curso"}
                </button>
                <button className="cd-action-cancel" onClick={onCancelar}>Cancelar inscripción</button>
            </>
        );
    };

    return (
        <div className="cd-enroll-card">
            <div className="cd-enroll-top">
                <div className="cd-enroll-status-row">
                    <StatusBadge />
                    {completado && inscrito && (
                        <span className="cd-enroll-complete-label">
                            <IoCheckmarkCircleOutline size={13} /> ¡Curso completado!
                        </span>
                    )}
                </div>
                <ProgressArea />
                <div className="cd-enroll-stats">
                    <div className="cd-enroll-stat">
                        <span className="cd-enroll-stat-num">{curso?.secciones?.length ?? 0}</span>
                        <span className="cd-enroll-stat-lbl">Secciones</span>
                    </div>
                    <div className="cd-enroll-stat">
                        <span className="cd-enroll-stat-num">{totalContenidos}</span>
                        <span className="cd-enroll-stat-lbl">Contenidos</span>
                    </div>
                    {totalPreguntas > 0 && (
                        <div className="cd-enroll-stat">
                            <span className="cd-enroll-stat-num">{totalPreguntas}</span>
                            <span className="cd-enroll-stat-lbl">Preguntas</span>
                        </div>
                    )}
                </div>
            </div>
            <div className="cd-enroll-actions">
                <Actions />
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════ */
export function CursoDetalle() {
    const navigate = useNavigate();

    const {
        curso, inscrito, progreso,
        cargando, inscribiendo, animado, error,
        ultimoResultado, id_curso,
        inscribirse, cancelarInscripcion, iniciarIntento,
    } = useCursoDetalle();

    const [modalCancelar, setModalCancelar] = useState(false);
    const [cancelando, setCancelando] = useState(false);
    const [alert, setAlert] = useState(null);

    const totalContenidos = curso?.secciones?.reduce((acc, s) => acc + (s.contenidos?.length || 0), 0) ?? 0;
    const totalPreguntas = curso?.secciones?.reduce((acc, s) => acc + (s.preguntas?.length || 0), 0) ?? 0;
    const pct = progreso?.porcentaje ?? 0;
    const completado = Boolean(progreso?.completado);

    const handleInscribirse = async () => {
        try {
            await inscribirse();
            setAlert({ type: "success", title: "¡Inscripción exitosa!", message: `Te has inscrito correctamente al curso "${curso.titulo}".` });
        } catch (err) {
            setAlert({ type: "error", title: "Error al inscribirse", message: err?.response?.data?.mensaje || "No se pudo completar la inscripción." });
        }
    };

    const handleCancelarInscripcion = () => setModalCancelar(true);

    const handleConfirmarCancelacion = async () => {
        setCancelando(true);
        try {
            await cancelarInscripcion();
            setModalCancelar(false);
            setAlert({ type: "success", title: "Inscripción cancelada", message: `Tu inscripción al curso "${curso.titulo}" ha sido cancelada.` });
        } catch (err) {
            setModalCancelar(false);
            setAlert({ type: "error", title: "Error al cancelar", message: err?.response?.data?.mensaje || "No se pudo cancelar la inscripción." });
        } finally {
            setCancelando(false);
        }
    };

    const handleIniciarCurso = async () => { await iniciarIntento(); navigate("/cursos-visor", { state: { id_curso } }); };
    const handleRetomarCurso = () => navigate("/cursos-visor", { state: { id_curso } });
    const handleVerResultados = () => navigate("/cursos/resultado", { state: { id_curso } });
    const handleVerHistorial = () => navigate("/historial-resultados-estudiante-curso", { state: { id_curso } });

    if (cargando) return <LoadingState />;

    if (error || !curso) {
        return (
            <div className="cd-error">
                <IoBookOutline size={40} className="cd-error-icon" />
                <p className="cd-error-msg">{error || "Curso no disponible."}</p>
                <button className="cd-action-primary cd-action-primary--blue" onClick={() => navigate("/cursos")}>
                    Volver a cursos
                </button>
            </div>
        );
    }

    const letrasVark = curso.perfil_vark?.split("").filter(l => ["V", "A", "R", "K"].includes(l)) || [];

    const tutor = curso.tutor ?? {
        nombre: `${curso.nombre_tutor ?? ""} ${curso.apellido_tutor ?? ""}`.trim(),
        foto: curso.foto_tutor ?? null,
        descripcion: curso.descripcion_tutor ?? null,
        correo: curso.correo_tutor ?? null,
        telefono: curso.telefono_tutor ?? null,
    };

    return (
        <div className={`cd-app ${animado ? "cd-animated" : ""}`}>

            {/* ═══════════  HERO  ═══════════ */}
            <div className="cd-hero">
                {curso.foto && <img src={curso.foto} alt="" aria-hidden className="cd-hero-bg-img" />}
                <div className="cd-hero-overlay" />

                <div className="cd-hero-inner">
                    <button className="cd-back" onClick={() => navigate("/cursos")}>
                        <IoArrowBackOutline size={12} /> Volver
                    </button>

                    <div className="cd-hero-grid">
                        <div className="cd-hero-content">
                            <h1 className="cd-hero-titulo">{curso.titulo}</h1>
                            {curso.descripcion && <p className="cd-hero-desc">{curso.descripcion}</p>}

                            <div className="cd-hero-meta">
                                {curso.secciones?.length > 0 && (
                                    <span className="cd-hero-meta-item">
                                        <IoLayersOutline size={12} />
                                        {curso.secciones.length} sección{curso.secciones.length !== 1 ? "es" : ""}
                                    </span>
                                )}
                                {totalContenidos > 0 && (
                                    <span className="cd-hero-meta-item">
                                        <IoDocumentTextOutline size={12} />
                                        {totalContenidos} contenido{totalContenidos !== 1 ? "s" : ""}
                                    </span>
                                )}
                                {tutor.nombre && (
                                    <span className="cd-hero-meta-item">
                                        <IoPersonOutline size={12} /> {tutor.nombre}
                                    </span>
                                )}
                            </div>

                            {(letrasVark.length > 0 || curso.nombre_dimension) && (
                                <div className="cd-hero-vark">
                                    {letrasVark.map(l => (
                                        <span key={l} className="cd-hero-vark-pill">{VARK_LABELS[l]}</span>
                                    ))}
                                    {curso.nombre_dimension && (
                                        <span className="cd-hero-vark-pill cd-hero-vark-pill--gold">
                                            <IoTimeOutline size={10} /> {curso.nombre_dimension}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="cd-hero-aside">
                            <EnrollCard
                                curso={curso}
                                inscrito={inscrito}
                                progreso={progreso}
                                completado={completado}
                                pct={pct}
                                ultimoResultado={ultimoResultado}
                                totalContenidos={totalContenidos}
                                totalPreguntas={totalPreguntas}
                                inscribiendo={inscribiendo}
                                onInscribirse={handleInscribirse}
                                onCancelar={handleCancelarInscripcion}
                                onIniciar={handleIniciarCurso}
                                onRetomar={handleRetomarCurso}
                                onVerResultados={handleVerResultados}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── CTA móvil ── */}
            <div className="cd-mobile-cta">
                {inscrito && !completado && pct > 0 && (
                    <div className="cd-mobile-prog-bar">
                        <div className="cd-mobile-prog-fill" style={{ width: `${pct}%` }} />
                    </div>
                )}
                {!inscrito && !curso?.archivado && (
                    <button
                        className="cd-action-primary cd-action-primary--blue cd-action-primary--full"
                        onClick={handleInscribirse}
                        disabled={inscribiendo}
                    >
                        <IoRibbonOutline size={14} />
                        {inscribiendo ? "Inscribiendo…" : "Inscribirse al curso"}
                    </button>
                )}
                {inscrito && (
                    completado ? (
                        <>
                            <button
                                className="cd-action-secondary cd-action-primary--full"
                                onClick={handleIniciarCurso}
                            >
                                <IoRefreshOutline size={13} /> Tomar de nuevo el curso
                            </button>
                            <button className="cd-action-cancel" onClick={handleCancelarInscripcion}>
                                Cancelar inscripción
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                className="cd-action-primary cd-action-primary--green cd-action-primary--full"
                                onClick={pct > 0 ? handleRetomarCurso : handleIniciarCurso}
                            >
                                <IoPlayCircleOutline size={14} />
                                {pct > 0 ? "Continuar curso" : "Iniciar curso"}
                            </button>
                            <button className="cd-action-cancel" onClick={handleCancelarInscripcion}>
                                Cancelar inscripción
                            </button>
                        </>
                    )
                )}
            </div>

            {/* ═══════════  BODY  ═══════════ */}
            <div className="cd-body">
                <div className="cd-main">
                    <CourseContent secciones={curso.secciones ?? []} />
                    <InstructorCard tutor={tutor} />

                    {/* Bloque de resultados: visible solo si está inscrito */}
                    {inscrito && (
                        <ResultadosBlock
                            ultimoResultado={ultimoResultado}
                            completado={completado || !!curso?.archivado}
                            onVerResultados={handleVerResultados}
                            onVerHistorial={handleVerHistorial}
                        />
                    )}
                </div>

                <aside className="cd-sidebar">
                    <div className="cd-sidebar-block">
                        <div className="cd-sidebar-head">Detalles del curso</div>
                        <div className="cd-sidebar-body">
                            {curso.secciones?.length > 0 && (
                                <div className="cd-fact">
                                    <span className="cd-fact-label">Secciones</span>
                                    <span className="cd-fact-value"><IoLayersOutline size={12} /> {curso.secciones.length}</span>
                                </div>
                            )}
                            {totalContenidos > 0 && (
                                <div className="cd-fact">
                                    <span className="cd-fact-label">Contenidos</span>
                                    <span className="cd-fact-value"><IoDocumentTextOutline size={12} /> {totalContenidos}</span>
                                </div>
                            )}
                            {totalPreguntas > 0 && (
                                <div className="cd-fact">
                                    <span className="cd-fact-label">Preguntas</span>
                                    <span className="cd-fact-value"><IoAnalyticsOutline size={12} /> {totalPreguntas}</span>
                                </div>
                            )}
                            {tutor.nombre && (
                                <div className="cd-fact">
                                    <span className="cd-fact-label">Instructor</span>
                                    <span className="cd-fact-value"><IoPersonOutline size={12} /> {tutor.nombre.split(" ")[0]}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {letrasVark.length > 0 && (
                        <div className="cd-sidebar-block">
                            <div className="cd-sidebar-head">Perfil VARK</div>
                            <div className="cd-sidebar-body">
                                <div className="cd-vark-list">
                                    {letrasVark.map(l => (
                                        <div key={l} className="cd-vark-row" style={{ background: VARK_BG[l], color: VARK_COLORS[l] }}>
                                            <span className="cd-vark-letter" style={{ background: VARK_CHIP_BG[l], color: VARK_COLORS[l] }}>{l}</span>
                                            <span>{VARK_LABELS[l]}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {curso.nombre_dimension && (
                        <div className="cd-sidebar-block">
                            <div className="cd-sidebar-head">Dimensión</div>
                            <div className="cd-sidebar-body">
                                <div className="cd-dim-badge">
                                    <IoTimeOutline size={13} /> {curso.nombre_dimension}
                                </div>
                            </div>
                        </div>
                    )}
                </aside>

                <ModalCancelarInscripcion
                    abierto={modalCancelar}
                    curso={curso}
                    onConfirmar={handleConfirmarCancelacion}
                    onCerrar={() => setModalCancelar(false)}
                    cargando={cancelando}
                />
            </div>

            {alert && (
                <CustomAlert
                    type={alert.type}
                    title={alert.title}
                    message={alert.message}
                    logo={logo}
                    onClose={() => setAlert(null)}
                />
            )}
        </div>
    );
}