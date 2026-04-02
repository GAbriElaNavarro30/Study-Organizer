import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
    IoAdd, IoSearch, IoGridOutline, IoListOutline, IoCreateOutline,
    IoEye, IoEyeOff, IoBookOutline, IoCalendarOutline, IoTimeOutline,
    IoWarningOutline,
    IoChevronBackOutline, IoChevronForwardOutline, IoSchoolOutline,
    IoCheckmarkCircle, IoEllipseOutline, IoEllipsisVertical,
    IoArchiveOutline, IoTrashOutline, IoFunnelOutline,
} from "react-icons/io5";
import ReactDOM from "react-dom";
import { ModalEliminar } from "../components/ModalEliminar";
import { ModalArchivar } from "../components/ModalArchivar";
import { ModalPublicar } from "../components/ModalPublicar";
import "../styles/CursosT.css";

/* ─────────────────────────────────────────────────────────
   CONSTANTES
───────────────────────────────────────────────────────── */
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

const FILTROS = [
    { key: "todos", label: "Todos", color: "#3B82F6", bg: "#EBF3FD", dot: "#3B82F6" },
    { key: "publicado", label: "Publicados", color: "#16A34A", bg: "#EFF8F1", dot: "#16A34A" },
    { key: "borrador", label: "Borradores", color: "#F59E0B", bg: "#FFFBEB", dot: "#F59E0B" },
    { key: "archivado", label: "Archivados", color: "#7C3AED", bg: "#F5F3FF", dot: "#7C3AED" },
];

/* ─────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────── */
const fmtDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("es-MX", {
        day: "2-digit", month: "short", year: "numeric",
    });
};

/* ─────────────────────────────────────────────────────────
   SUB-COMPONENTES
───────────────────────────────────────────────────────── */
const CourseAvatar = ({ titulo, foto, size = 56 }) => {
    const initials = titulo?.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
    const hue = ((titulo?.charCodeAt(0) || 65) * 7) % 360;
    if (foto) return (
        <img src={foto} alt={titulo}
            style={{ width: size, height: size, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
    );
    return (
        <div style={{
            width: size, height: size, borderRadius: 10, flexShrink: 0,
            background: `hsl(${hue},55%,88%)`, color: `hsl(${hue},45%,38%)`,
            fontSize: size * 0.32, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            letterSpacing: 1, fontFamily: "'DM Serif Display', Georgia, serif",
        }}>
            {initials}
        </div>
    );
};

const VarkBadge = ({ perfil }) => {
    const info = VARK_COLORS[perfil] || { bg: "#F1F5F9", text: "#64748B", label: perfil };
    return (
        <span style={{
            background: info.bg, color: info.text, borderRadius: 20, padding: "3px 10px",
            fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center",
            gap: 4, letterSpacing: 0.3,
        }}>
            <span style={{ opacity: 0.5 }}>◆</span>{info.label}
        </span>
    );
};

const StatusBadge = ({ publicado, archivado }) => {
    if (archivado) return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700,
            background: "#F5F3FF", color: "#7C3AED", whiteSpace: "nowrap", flexShrink: 0,
        }}>
            <IoArchiveOutline size={11} /> Archivado
        </span>
    );
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700,
            background: publicado ? "#EFF8F1" : "#F1F5F9",
            color: publicado ? "#16A34A" : "#94A3B8",
            whiteSpace: "nowrap", flexShrink: 0,
        }}>
            {publicado ? <IoCheckmarkCircle size={11} /> : <IoEllipseOutline size={11} />}
            {publicado ? "Publicado" : "Borrador"}
        </span>
    );
};

/* ── Menú ⋯ ─────────────────────────────────────────────── */
const MenuOpciones = ({ curso, onEdit, onTogglePublish, onArchivar, onEliminar }) => {
    const [abierto, setAbierto] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0 });
    const triggerRef = useRef(null);
    const dropdownRef = useRef(null);
    const rafRef = useRef(null);

    const DROPDOWN_W = 172;
    const DROPDOWN_H = 160;

    const actualizarPos = () => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();

        const desbordaDerecha = rect.left + DROPDOWN_W > window.innerWidth - 8;
        const left = desbordaDerecha ? rect.right - DROPDOWN_W : rect.left;

        const desbordaAbajo = rect.bottom + DROPDOWN_H > window.innerHeight - 8;
        const top = desbordaAbajo ? rect.top - DROPDOWN_H : rect.bottom + 5;

        setPos({ top, left });
        rafRef.current = requestAnimationFrame(actualizarPos);
    };

    useEffect(() => {
        if (abierto) {
            rafRef.current = requestAnimationFrame(actualizarPos);
        } else {
            cancelAnimationFrame(rafRef.current);
        }
        return () => cancelAnimationFrame(rafRef.current);
    }, [abierto]);

    useEffect(() => {
        const cerrar = (e) => {
            if (
                triggerRef.current && !triggerRef.current.contains(e.target) &&
                dropdownRef.current && !dropdownRef.current.contains(e.target)
            ) setAbierto(false);
        };
        document.addEventListener("mousedown", cerrar);
        return () => document.removeEventListener("mousedown", cerrar);
    }, []);

    const abrirMenu = (e) => {
        e.stopPropagation();
        setAbierto((prev) => !prev);
    };

    const dropdown = abierto
        ? ReactDOM.createPortal(
            <div
                ref={dropdownRef}
                className="menu-opciones__dropdown"
                style={{ top: pos.top, left: pos.left }}
            >
                <button className="menu-opciones__item"
                    onClick={() => { setAbierto(false); onEdit(curso); }}>
                    <IoCreateOutline size={14} /> Editar
                </button>
                {!curso.archivado && (
                    <button className="menu-opciones__item"
                        onClick={() => { setAbierto(false); onTogglePublish(curso); }}>
                        {curso.es_publicado ? <IoEyeOff size={14} /> : <IoEye size={14} />}
                        {curso.es_publicado ? "Despublicar" : "Publicar"}
                    </button>
                )}
                <button className="menu-opciones__item"
                    onClick={() => { setAbierto(false); onArchivar(curso); }}>
                    <IoArchiveOutline size={14} />
                    {curso.archivado ? "Desarchivar" : "Archivar"}
                </button>
                <div className="menu-opciones__divider" />
                <button className="menu-opciones__item menu-opciones__item--danger"
                    onClick={() => { setAbierto(false); onEliminar(curso); }}>
                    <IoTrashOutline size={14} /> Eliminar
                </button>
            </div>,
            document.body
        )
        : null;

    return (
        <div className="menu-opciones" ref={triggerRef}>
            <button
                className="menu-opciones__trigger"
                onClick={abrirMenu}
                title="Más opciones"
            >
                <IoEllipsisVertical size={17} />
            </button>
            {dropdown}
        </div>
    );
};

/* ── Tarjeta ─────────────────────────────────────────────── */
const CursoCard = ({ curso, onEdit, onTogglePublish, onArchivar, onEliminar }) => {
    const hue = ((curso.titulo?.charCodeAt(0) || 65) * 7) % 360;

    return (
        <div className={`curso-card ${curso.archivado ? "curso-card--archivado" : ""}`}>
            {/* Banner de portada */}
            <div className="curso-card__cover">
                {curso.foto ? (
                    <img src={curso.foto} alt={curso.titulo} className="curso-card__cover-img" />
                ) : (
                    <div className="curso-card__cover-placeholder" style={{ background: `hsl(${hue},45%,88%)` }}>
                        <span style={{ color: `hsl(${hue},40%,38%)`, fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 32, fontWeight: 700 }}>
                            {curso.titulo?.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()}
                        </span>
                    </div>
                )}
                <div className="curso-card__cover-overlay">
                    <StatusBadge publicado={curso.es_publicado} archivado={curso.archivado} />
                    <MenuOpciones curso={curso} onEdit={onEdit}
                        onTogglePublish={onTogglePublish} onArchivar={onArchivar} onEliminar={onEliminar} />
                </div>
            </div>

            {/* Contenido */}
            <div className="curso-card__body">
                <p className="curso-card__title">{curso.titulo}</p>
                {curso.descripcion && (
                    <p className="curso-card__desc">
                        {curso.descripcion.slice(0, 90)}{curso.descripcion.length > 90 ? "…" : ""}
                    </p>
                )}
            </div>

            <div className="curso-card__footer">
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                    {curso.perfil_vark && <VarkBadge perfil={curso.perfil_vark} />}
                    {curso.dimensiones?.map((d, i) => (
                        <span key={i} className="dim-chip">{d}</span>
                    ))}
                </div>
                <div className="curso-card__dates">
                    <span className="curso-card__date-item">
                        <IoCalendarOutline size={12} />{fmtDate(curso.fecha_creacion)}
                    </span>
                    <span className="curso-card__date-item">
                        <IoTimeOutline size={12} />{fmtDate(curso.fecha_actualizacion)}
                    </span>
                </div>
            </div>
        </div>
    );
};

/* ── Fila tabla ──────────────────────────────────────────── */
const CursoRow = ({ curso, onEdit, onTogglePublish, onArchivar, onEliminar }) => (
    <tr className={`table-row ${curso.archivado ? "table-row--archivado" : ""}`}>
        <td className="td">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <CourseAvatar titulo={curso.titulo} foto={curso.foto} size={38} />
                <div>
                    <p className="row-title">{curso.titulo}</p>
                    <p className="row-desc">{curso.descripcion?.slice(0, 50)}{curso.descripcion?.length > 50 ? "…" : ""}</p>
                </div>
            </div>
        </td>
        <td className="td"><StatusBadge publicado={curso.es_publicado} archivado={curso.archivado} /></td>
        <td className="td">
            {curso.perfil_vark
                ? <VarkBadge perfil={curso.perfil_vark} />
                : <span style={{ color: "#CBD5E1", fontSize: 12 }}>—</span>}
        </td>
        <td className="td">
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {curso.dimensiones?.map((d, i) => <span key={i} className="dim-chip">{d}</span>)}
            </div>
        </td>
        <td className="td date-cell">{fmtDate(curso.fecha_creacion)}</td>
        <td className="td date-cell">{fmtDate(curso.fecha_actualizacion)}</td>
        <td className="td">
            <MenuOpciones curso={curso} onEdit={onEdit}
                onTogglePublish={onTogglePublish} onArchivar={onArchivar} onEliminar={onEliminar} />
        </td>
    </tr>
);

/* ── Paginación ──────────────────────────────────────────── */
const Paginacion = ({ pagina, totalPaginas, total, desde, hasta, onCambiar }) => (
    <div className="pagination">
        <span className="pagination__info">
            Mostrando {desde}–{hasta} de {total} {total === 1 ? "curso" : "cursos"}
        </span>
        <div className="pagination__controls">
            <button className="page-btn" disabled={pagina === 1} onClick={() => onCambiar(pagina - 1)}>
                <IoChevronBackOutline size={15} />
            </button>
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
                <button key={p} className={`page-btn ${p === pagina ? "page-btn--active" : ""}`} onClick={() => onCambiar(p)}>
                    {p}
                </button>
            ))}
            <button className="page-btn" disabled={pagina === totalPaginas} onClick={() => onCambiar(pagina + 1)}>
                <IoChevronForwardOutline size={15} />
            </button>
        </div>
        <span className="pagination__spacer" />
    </div>
);

/* ── Panel lateral ───────────────────────────────────────── */
const PanelFiltros = ({ cursos, filtroEstado, onFiltro }) => {
    const conteo = {
        todos: cursos.length,
        publicado: cursos.filter((c) => c.es_publicado && !c.archivado).length,
        borrador: cursos.filter((c) => !c.es_publicado && !c.archivado).length,
        archivado: cursos.filter((c) => c.archivado).length,
    };

    return (
        <aside className="panel-filtros">
            <div className="panel-filtros__header">
                <IoFunnelOutline size={13} />
                <span>Filtrar</span>
            </div>
            <nav className="panel-filtros__nav">
                {FILTROS.map((f) => (
                    <button
                        key={f.key}
                        className={`filtro-btn ${filtroEstado === f.key ? "filtro-btn--activo" : ""}`}
                        style={{ "--fc": f.color, "--fb": f.bg }}
                        onClick={() => onFiltro(f.key)}
                    >
                        <span className="filtro-btn__dot" style={{ background: f.dot }} />
                        <span className="filtro-btn__label">{f.label}</span>
                        <span className="filtro-btn__count">{conteo[f.key]}</span>
                    </button>
                ))}
            </nav>
        </aside>
    );
};

/* ═══════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
═══════════════════════════════════════════════════════════ */
export function CursosT() {
    const navigate = useNavigate();

    const [cursos, setCursos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [vista, setVista] = useState("mosaic");
    const [porPagina, setPorPagina] = useState(8);
    const [pagina, setPagina] = useState(1);
    const [filtroEstado, setFiltroEstado] = useState("todos");
    const [modalPublicar, setModalPublicar] = useState(null); // curso | null
    const [modalArchivar, setModalArchivar] = useState(null); // curso | null
    const [modalEliminar, setModalEliminar] = useState(null); // curso | null

    const fetchCursos = async () => {
        try {
            setCargando(true);
            setError(null);
            const { data } = await api.get("/cursos/cursos");
            const normalizados = data.cursos.map((c) => ({
                ...c,
                dimensiones: c.nombre_dimension ? [c.nombre_dimension] : [],
                archivado: Boolean(c.archivado),
            }));
            setCursos(normalizados);
        } catch (err) {
            setError(err.response?.data?.mensaje || "Error al cargar los cursos.");
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => { fetchCursos(); }, []);

    const filtrados = useMemo(() => {
        const q = busqueda.toLowerCase();
        return cursos.filter((c) => {
            const ok =
                c.titulo.toLowerCase().includes(q) ||
                c.descripcion?.toLowerCase().includes(q) ||
                c.perfil_vark?.toLowerCase().includes(q);

            const estado =
                filtroEstado === "todos" ? !c.archivado :
                    filtroEstado === "publicado" ? (c.es_publicado && !c.archivado) :
                        filtroEstado === "borrador" ? (!c.es_publicado && !c.archivado) :
                            filtroEstado === "archivado" ? c.archivado : true;

            return ok && estado;
        });
    }, [cursos, busqueda, filtroEstado]);

    const totalPaginas = Math.max(1, Math.ceil(filtrados.length / porPagina));
    const paginados = filtrados.slice((pagina - 1) * porPagina, pagina * porPagina);
    const desde = filtrados.length === 0 ? 0 : (pagina - 1) * porPagina + 1;
    const hasta = Math.min(pagina * porPagina, filtrados.length);

    const handleBusqueda = (v) => { setBusqueda(v); setPagina(1); };
    const handlePorPagina = (n) => { setPorPagina(n); setPagina(1); };
    const handleFiltro = (k) => { setFiltroEstado(k); setPagina(1); };

    const handleTogglePublish = (curso) => setModalPublicar(curso);
    const handleArchivar = (curso) => setModalArchivar(curso);
    const handleEliminar = (curso) => setModalEliminar(curso);

    const handleConfirmPublicar = async () => {
        try {
            await api.patch(`/cursos/cursos/${modalPublicar.id_curso}/publicar`);
            await fetchCursos();
        } catch (err) {
            console.error("Error al cambiar publicación:", err.response?.data);
        }
        setModalPublicar(null);
    };

    const handleConfirmArchivar = async () => {
        try {
            await api.patch(`/cursos/cursos/${modalArchivar.id_curso}/archivar`);
            await fetchCursos();
        } catch (err) {
            console.error("Error al archivar:", err.response?.data);
        }
        setModalArchivar(null);
    };

    const handleConfirmarEliminar = async () => {
        try {
            await api.delete(`/cursos/cursos/${modalEliminar.id_curso}`);
            await fetchCursos();
        } catch (err) {
            console.error("Error al eliminar:", err.response?.data);
        }
        setModalEliminar(null);
    };

    const totalPublicados = cursos.filter((c) => c.es_publicado && !c.archivado).length;
    const totalBorradores = cursos.filter((c) => !c.es_publicado && !c.archivado).length;
    const totalArchivados = cursos.filter((c) => c.archivado).length;

    return (
        <div className="cursos-root">

            {/* ══ HEADER ══════════════════════════════════ */}
            <header className="header-curso">
                <div className="page-eyebrow">
                    <IoSchoolOutline size={13} /> Panel del tutor
                </div>
                <div className="header-curso__row">
                    <div>
                        <h1 className="page-title">Mis Cursos</h1>
                        <p className="page-sub">Gestiona, edita y publica cursos para estudiantes</p>
                    </div>
                    <div className="page-header_derecha">
                        {[
                            { label: "Total", val: cursos.length, mod: "total" },
                            { label: "Publicados", val: totalPublicados, mod: "pub" },
                            { label: "Borradores", val: totalBorradores, mod: "draft" },
                            { label: "Archivados", val: totalArchivados, mod: "arch" },
                        ].map((s) => (
                            <div key={s.label} className={`stat-card stat-card--${s.mod}`}>
                                <p className="stat-card__val">{s.val}</p>
                                <p className="stat-card__lbl">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </header>

            {/* ══ BODY ════════════════════════════════════ */}
            <div className="cursos-layout">

                <PanelFiltros cursos={cursos} filtroEstado={filtroEstado} onFiltro={handleFiltro} />

                <main className="panel-curso">

                    {/* Toolbar */}
                    <div className="toolbar-opciones">
                        <button className="btn-primary-curso" onClick={() => navigate("/editor-curso")}>
                            <IoAdd size={17} /> Crear curso
                        </button>
                        <div className="toolbar-opciones-right">
                            <div className="search-wrap">
                                <span className="search-icon"><IoSearch size={15} /></span>
                                <input
                                    className="search-input"
                                    value={busqueda}
                                    onChange={(e) => handleBusqueda(e.target.value)}
                                    placeholder="Buscar por título, descripción o perfil…"
                                />
                                {busqueda && (
                                    <button className="search-clear" onClick={() => handleBusqueda("")}>✕</button>
                                )}
                            </div>
                            <div className="view-toggle">
                                <button className={`view-btn ${vista === "mosaic" ? "view-btn--active" : ""}`}
                                    onClick={() => setVista("mosaic")} title="Mosaico">
                                    <IoGridOutline size={16} />
                                </button>
                                <button className={`view-btn ${vista === "list" ? "view-btn--active" : ""}`}
                                    onClick={() => setVista("list")} title="Lista">
                                    <IoListOutline size={16} />
                                </button>
                            </div>
                            <div className="per-page-wrap">
                                <span className="per-page-lbl">Mostrar</span>
                                <select className="per-page-select" value={porPagina}
                                    onChange={(e) => handlePorPagina(Number(e.target.value))}>
                                    {[4, 8, 12, 16, 20].map((n) => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Cuerpo */}
                    {cargando ? (
                        <div className="cursos-empty">
                            <div className="cursos-empty__icon"><IoBookOutline size={26} /></div>
                            <p className="cursos-empty__title">Cargando cursos…</p>
                        </div>
                    ) : error ? (
                        <div className="cursos-empty">
                            <div className="cursos-empty__icon"><IoWarningOutline size={26} /></div>
                            <p className="cursos-empty__title">Ocurrió un error</p>
                            <p className="cursos-empty__text">{error}</p>
                            <button className="btn-primary-curso" style={{ marginTop: 14 }} onClick={fetchCursos}>
                                Reintentar
                            </button>
                        </div>
                    ) : paginados.length === 0 ? (
                        <div className="cursos-empty">
                            <div className="cursos-empty__icon"><IoBookOutline size={26} /></div>
                            <p className="cursos-empty__title">{busqueda ? "Sin resultados" : "Nada aquí todavía"}</p>
                            <p className="cursos-empty__text">
                                {busqueda
                                    ? `No se encontraron cursos con "${busqueda}"`
                                    : "No hay cursos en esta categoría"}
                            </p>
                        </div>
                    ) : vista === "mosaic" ? (
                        <div className="cursos-grid-wrapper">
                            <div className="cursos-grid">
                                {paginados.map((c) => (
                                    <CursoCard key={c.id_curso} curso={c}
                                        onEdit={(c) => navigate(`/editor-curso?id=${c.id_curso}`)}
                                        onTogglePublish={handleTogglePublish}
                                        onArchivar={handleArchivar}
                                        onEliminar={handleEliminar} />
                                ))}
                            </div>
                            <Paginacion pagina={pagina} totalPaginas={totalPaginas}
                                total={filtrados.length} desde={desde} hasta={hasta} onCambiar={setPagina} />
                        </div>
                    ) : (
                        <div className="cursos-grid-wrapper">
                            <div className="table-wrap">
                                <div className="table-scroll">
                                    <table className="cursos-table">
                                        <thead>
                                            <tr>
                                                {["Curso", "Estado", "VARK", "Dimensiones", "Creado", "Modificado", ""].map((h) => (
                                                    <th key={h} className="th">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginados.map((c) => (
                                                <CursoRow key={c.id_curso} curso={c}
                                                    onEdit={(c) => navigate(`/editor-curso?id=${c.id_curso}`)}
                                                    onTogglePublish={handleTogglePublish}
                                                    onArchivar={handleArchivar}
                                                    onEliminar={handleEliminar} />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <Paginacion pagina={pagina} totalPaginas={totalPaginas}
                                total={filtrados.length} desde={desde} hasta={hasta} onCambiar={setPagina} />
                        </div>
                    )}

                </main>
            </div>

            {/* ══ MODALES ══════════════════════════════════ */}
            <ModalPublicar
                isOpen={!!modalPublicar}
                curso={modalPublicar}
                onConfirm={handleConfirmPublicar}
                onClose={() => setModalPublicar(null)} />

            <ModalArchivar
                isOpen={!!modalArchivar}
                curso={modalArchivar}
                onConfirm={handleConfirmArchivar}
                onClose={() => setModalArchivar(null)} />

            <ModalEliminar
                isOpen={!!modalEliminar}
                nombreUsuario={modalEliminar?.titulo}
                onConfirm={handleConfirmarEliminar}
                onClose={() => setModalEliminar(null)} />

        </div>
    );
}