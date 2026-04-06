// src/pages/CursosT.jsx
import { useState, useRef, useEffect } from "react";
import {
    IoAdd, IoSearch, IoGridOutline, IoListOutline, IoCreateOutline,
    IoEye, IoEyeOff, IoBookOutline,
    IoWarningOutline, IoChevronBackOutline, IoChevronForwardOutline,
    IoSchoolOutline, IoCheckmarkCircle, IoEllipseOutline,
    IoEllipsisVertical, IoArchiveOutline, IoTrashOutline, IoFunnelOutline,
    IoCloseCircle, IoLayersOutline,
} from "react-icons/io5";
import ReactDOM from "react-dom";
import { ModalEliminarCurso } from "../components/ModalEliminarCurso";
import { ModalArchivar } from "../components/ModalArchivar";
import { ModalPublicar } from "../components/ModalPublicar";
import { CustomAlert } from "../components/CustomAlert";   // ← nuevo
import logo from "../assets/imagenes/logotipo.png";         // ← nuevo
import { useCursosT } from "../hooks/useCursosT";
import "../styles/CursosT.css";

/* ─────────────────────────────────────────────────────────
   CONSTANTES
───────────────────────────────────────────────────────── */
const VARK_COLORS = {
    V: { bg: "#DBEAFE", text: "#1E40AF", label: "Visual" },
    A: { bg: "#FEF9C3", text: "#854D0E", label: "Auditivo" },
    R: { bg: "#DCFCE7", text: "#065F46", label: "Lectura/Escritura" },
    K: { bg: "#FCE7F3", text: "#9D174D", label: "Kinestésico" },
    VA: { bg: "#EEF2FF", text: "#3730A3", label: "Visual-Auditivo" },
    VR: { bg: "#ECFDF5", text: "#065F46", label: "Visual-Lectura" },
    VK: { bg: "#F3E8FF", text: "#6B21A8", label: "Visual-Kinestésico" },
    AR: { bg: "#FFFBEB", text: "#B45309", label: "Auditivo-Lectura" },
    AK: { bg: "#FFF1F2", text: "#BE123C", label: "Auditivo-Kinestésico" },
    RK: { bg: "#F0FDF4", text: "#166534", label: "Lectura-Kinestésico" },
    VAR: { bg: "#EFF6FF", text: "#1E40AF", label: "Visual-Auditivo-Lectura" },
    VAK: { bg: "#F5F3FF", text: "#5B21B6", label: "Visual-Autitivo-Kinestésico" },
    VRK: { bg: "#ECFEFF", text: "#155E75", label: "Visual-Lectura-Kinestésico" },
    ARK: { bg: "#FFF7ED", text: "#9A3412", label: "Auditivo-Lectura-Kinestésico" },
    VARK: { bg: "#F0F9FF", text: "#0369A1", label: "Multimodal" },
};

const FILTROS = [
    { key: "todos", label: "Todos", dot: "#94A3B8" },
    { key: "publicado", label: "Publicados", dot: "#059669" },
    { key: "borrador", label: "Borradores", dot: "#94A3B8" },
    { key: "archivado", label: "Archivados", dot: "#7C3AED" },
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

const PLACEHOLDER_PALETTES = [
    { bg: "#DBEAFE", text: "#1E40AF" },
    { bg: "#D1FAE5", text: "#065F46" },
    { bg: "#FCE7F3", text: "#9D174D" },
    { bg: "#EDE9FE", text: "#5B21B6" },
    { bg: "#FEF3C7", text: "#92400E" },
    { bg: "#CFFAFE", text: "#155E75" },
    { bg: "#FFE4E6", text: "#9F1239" },
    { bg: "#DCFCE7", text: "#14532D" },
];

const getPlaceholderPalette = (titulo = "") => {
    const idx = (titulo.charCodeAt(0) || 65) % PLACEHOLDER_PALETTES.length;
    return PLACEHOLDER_PALETTES[idx];
};

/* ─────────────────────────────────────────────────────────
   COURSE AVATAR
───────────────────────────────────────────────────────── */
const CourseAvatar = ({ titulo, foto, size = 38 }) => {
    const initials = titulo?.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
    const palette = getPlaceholderPalette(titulo);

    if (foto) return (
        <img src={foto} alt={titulo}
            style={{ width: size, height: size, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
    );
    return (
        <div style={{
            width: size, height: size, borderRadius: 8, flexShrink: 0,
            background: palette.bg, color: palette.text,
            fontSize: size * 0.32, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            letterSpacing: 0.5,
        }}>
            {initials}
        </div>
    );
};

/* ─────────────────────────────────────────────────────────
   VARK BADGE
───────────────────────────────────────────────────────── */
const VarkBadge = ({ perfil }) => {
    const info = VARK_COLORS[perfil] || { bg: "#F1F5F9", text: "#64748B", label: perfil };
    return (
        <span className="vark-pill" style={{ background: info.bg, color: info.text }}>
            ◆ {info.label}
        </span>
    );
};

/* ─────────────────────────────────────────────────────────
   DIMENSION BADGE
───────────────────────────────────────────────────────── */
const DimBadge = ({ nombre }) => {
    if (!nombre) return null;
    return (
        <span className="dim-badge">
            <IoLayersOutline size={10} />
            {nombre}
        </span>
    );
};

/* ─────────────────────────────────────────────────────────
   STATUS BADGE
───────────────────────────────────────────────────────── */
const StatusBadge = ({ publicado, archivado }) => {
    if (archivado) return (
        <span className="status-badge status-badge--arch">
            <IoArchiveOutline size={10} /> Archivado
        </span>
    );
    return (
        <span className={`status-badge ${publicado ? "status-badge--pub" : "status-badge--draft"}`}>
            {publicado ? <IoCheckmarkCircle size={10} /> : <IoEllipseOutline size={10} />}
            {publicado ? "Publicado" : "Borrador"}
        </span>
    );
};

/* ─────────────────────────────────────────────────────────
   MENÚ ⋯
───────────────────────────────────────────────────────── */
const MenuOpciones = ({ curso, onEdit, onTogglePublish, onArchivar, onEliminar }) => {
    const [abierto, setAbierto] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0 });
    const triggerRef = useRef(null);
    const dropdownRef = useRef(null);
    const rafRef = useRef(null);
    const DROPDOWN_W = 168;
    const DROPDOWN_H = 155;

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
        if (abierto) { rafRef.current = requestAnimationFrame(actualizarPos); }
        else { cancelAnimationFrame(rafRef.current); }
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

    const abrirMenu = (e) => { e.stopPropagation(); setAbierto((prev) => !prev); };

    const dropdown = abierto ? ReactDOM.createPortal(
        <div ref={dropdownRef} className="menu-opciones__dropdown" style={{ top: pos.top, left: pos.left }}>
            <button className="menu-opciones__item" onClick={() => { setAbierto(false); onEdit(curso); }}>
                <IoCreateOutline size={14} /> Editar
            </button>
            {!curso.archivado && (
                <button className="menu-opciones__item" onClick={() => { setAbierto(false); onTogglePublish(curso); }}>
                    {curso.es_publicado ? <IoEyeOff size={14} /> : <IoEye size={14} />}
                    {curso.es_publicado ? "Despublicar" : "Publicar"}
                </button>
            )}
            <button className="menu-opciones__item" onClick={() => { setAbierto(false); onArchivar(curso); }}>
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
    ) : null;

    return (
        <div className="menu-opciones" ref={triggerRef}>
            <button className="menu-opciones__trigger" onClick={abrirMenu} title="Más opciones">
                <IoEllipsisVertical size={16} />
            </button>
            {dropdown}
        </div>
    );
};

/* ─────────────────────────────────────────────────────────
   CURSO CARD — vista mosaico
───────────────────────────────────────────────────────── */
const CursoCard = ({ curso, onEdit, onTogglePublish, onArchivar, onEliminar, onVistaPrevia }) => {
    const palette = getPlaceholderPalette(curso.titulo);
    const initials = curso.titulo?.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?";

    return (
        <div
            className={`curso-card ${curso.archivado ? "curso-card--archivado" : ""}`}
            onDoubleClick={() => onVistaPrevia(curso)}
            style={{ cursor: "pointer" }}
        >
            {/* Portada */}
            <div className="curso-card__cover">
                {curso.foto ? (
                    <img src={curso.foto} alt={curso.titulo} className="curso-card__cover-img" />
                ) : (
                    <div className="curso-card__cover-placeholder" style={{ background: palette.bg }}>
                        <span className="curso-card__cover-initials" style={{ color: palette.text }}>
                            {initials}
                        </span>
                    </div>
                )}
                <div className="curso-card__cover-overlay">
                    <StatusBadge publicado={curso.es_publicado} archivado={curso.archivado} />
                    <MenuOpciones
                        curso={curso} onEdit={onEdit}
                        onTogglePublish={onTogglePublish}
                        onArchivar={onArchivar}
                        onEliminar={onEliminar}
                    />
                </div>
            </div>

            {/* Cuerpo */}
            <div className="curso-card__body">
                <p className="curso-card__title">{curso.titulo}</p>
                {curso.nombre_dimension && <DimBadge nombre={curso.nombre_dimension} />}
                {curso.descripcion && (
                    <p className="curso-card__desc">
                        {curso.descripcion.length > 80
                            ? curso.descripcion.slice(0, 80) + "…"
                            : curso.descripcion}
                    </p>
                )}
            </div>

            {/* Footer */}
            <div className="curso-card__footer">
                <div className="curso-card__stats">
                    <div className="curso-card__stat">
                        <span className="curso-card__stat-val">{curso.total_secciones ?? "—"}</span>
                        <span className="curso-card__stat-lbl">Secciones</span>
                    </div>
                    <div className="curso-card__stat">
                        <span className="curso-card__stat-val">{curso.total_estudiantes ?? "—"}</span>
                        <span className="curso-card__stat-lbl">Estudiantes</span>
                    </div>
                </div>
                <div className="curso-card__meta">
                    {curso.perfil_vark ? <VarkBadge perfil={curso.perfil_vark} /> : <span />}
                    <span className="curso-card__date">{fmtDate(curso.fecha_actualizacion)}</span>
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────
   CURSO ROW — vista lista
───────────────────────────────────────────────────────── */
const CursoRow = ({ curso, onEdit, onTogglePublish, onArchivar, onEliminar, onVistaPrevia }) => (
    <tr
        className={`table-row ${curso.archivado ? "table-row--archivado" : ""}`}
        onDoubleClick={() => onVistaPrevia(curso)}
        style={{ cursor: "pointer" }}
    >
        <td className="td">
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <CourseAvatar titulo={curso.titulo} foto={curso.foto} size={40} />
                <div>
                    <p className="row-title">{curso.titulo}</p>
                    {curso.nombre_dimension && <DimBadge nombre={curso.nombre_dimension} />}
                    {curso.descripcion && (
                        <p className="row-desc">
                            {curso.descripcion.length > 50
                                ? curso.descripcion.slice(0, 50) + "…"
                                : curso.descripcion}
                        </p>
                    )}
                </div>
            </div>
        </td>
        <td className="td">
            <StatusBadge publicado={curso.es_publicado} archivado={curso.archivado} />
        </td>
        <td className="td">
            {curso.perfil_vark
                ? <VarkBadge perfil={curso.perfil_vark} />
                : <span style={{ color: "#CBD5E1", fontSize: 12 }}>—</span>}
        </td>
        <td className="td">
            <div className="row-stat">
                <span className="row-stat-val">{curso.total_secciones ?? "—"}</span>
                <span className="row-stat-lbl">secciones</span>
            </div>
        </td>
        <td className="td">
            <div className="row-stat">
                <span className="row-stat-val">{curso.total_estudiantes ?? "—"}</span>
                <span className="row-stat-lbl">inscritos</span>
            </div>
        </td>
        <td className="td date-cell">{fmtDate(curso.fecha_actualizacion)}</td>
        <td className="td">
            <MenuOpciones
                curso={curso} onEdit={onEdit}
                onTogglePublish={onTogglePublish}
                onArchivar={onArchivar}
                onEliminar={onEliminar}
            />
        </td>
    </tr>
);

/* ─────────────────────────────────────────────────────────
   PAGINACIÓN
───────────────────────────────────────────────────────── */
const Paginacion = ({ pagina, totalPaginas, total, desde, hasta, onCambiar }) => (
    <div className="pagination">
        <span className="pagination__info">
            Mostrando {desde}–{hasta} de {total} {total === 1 ? "curso" : "cursos"}
        </span>
        <div className="pagination__controls">
            <button className="page-btn" disabled={pagina === 1} onClick={() => onCambiar(pagina - 1)}>
                <IoChevronBackOutline size={14} />
            </button>
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
                <button
                    key={p}
                    className={`page-btn ${p === pagina ? "page-btn--active" : ""}`}
                    onClick={() => onCambiar(p)}
                >
                    {p}
                </button>
            ))}
            <button className="page-btn" disabled={pagina === totalPaginas} onClick={() => onCambiar(pagina + 1)}>
                <IoChevronForwardOutline size={14} />
            </button>
        </div>
        <span className="pagination__spacer" />
    </div>
);

/* ─────────────────────────────────────────────────────────
   PANEL FILTROS
───────────────────────────────────────────────────────── */
const PanelFiltros = ({
    cursos,
    filtroEstado, onFiltro,
    filtroVark, onFiltroVark,
    filtroDimension, onFiltroDim,
    varkDisponibles, dimensionesDisponibles,
    onLimpiar,
}) => {
    const conteo = {
        todos: cursos.filter((c) => !c.archivado).length,
        publicado: cursos.filter((c) => c.es_publicado && !c.archivado).length,
        borrador: cursos.filter((c) => !c.es_publicado && !c.archivado).length,
        archivado: cursos.filter((c) => c.archivado).length,
    };

    const hayFiltrosExtra = filtroVark || filtroDimension;

    return (
        <aside className="panel-filtros">
            {/* ── Estado ── */}
            <div className="panel-filtros__header">
                <IoFunnelOutline size={12} />
                <span>Estado</span>
            </div>
            <nav className="panel-filtros__nav">
                {FILTROS.map((f) => (
                    <button
                        key={f.key}
                        className={`filtro-btn ${filtroEstado === f.key ? "filtro-btn--activo" : ""}`}
                        onClick={() => onFiltro(f.key)}
                    >
                        <span className="filtro-btn__dot" style={{ background: f.dot }} />
                        <span className="filtro-btn__label">{f.label}</span>
                        <span className="filtro-btn__count">{conteo[f.key]}</span>
                    </button>
                ))}
            </nav>

            {/* ── Separador ── */}
            <div className="panel-filtros__sep" />

            {/* ── Perfil VARK ── */}
            <div className="panel-filtros__header">
                <span>Perfil VARK</span>
            </div>
            <div className="panel-filtros__select-wrap">
                <select
                    className="panel-filtros__select"
                    value={filtroVark || ""}
                    onChange={(e) => onFiltroVark(e.target.value || null)}
                >
                    <option value="">Todos los perfiles</option>
                    {varkDisponibles.map((v) => {
                        const info = VARK_COLORS[v] || {};
                        return <option key={v} value={v}>{info.label || v}</option>;
                    })}
                </select>
            </div>

            {/* ── Dimensión ── */}
            {dimensionesDisponibles.length > 0 && (
                <>
                    <div className="panel-filtros__header" style={{ marginTop: 12 }}>
                        <IoLayersOutline size={12} />
                        <span>Dimensión</span>
                    </div>
                    <div className="panel-filtros__select-wrap">
                        <select
                            className="panel-filtros__select"
                            value={filtroDimension || ""}
                            onChange={(e) => onFiltroDim(e.target.value || null)}
                        >
                            <option value="">Todas las dimensiones</option>
                            {dimensionesDisponibles.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                </>
            )}

            {/* ── Limpiar filtros extra ── */}
            {hayFiltrosExtra && (
                <button className="filtros-limpiar-btn" onClick={onLimpiar}>
                    <IoCloseCircle size={13} />
                    Limpiar filtros
                </button>
            )}
        </aside>
    );
};

/* ═══════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
═══════════════════════════════════════════════════════════ */
export function CursosT() {
    const {
        cursos, cargando, error, busqueda, vista, porPagina, pagina,
        filtroEstado, filtroVark, filtroDimension,
        modalPublicar, modalArchivar, modalEliminar,
        alert, cerrarAlert,                          // ← desestructurados
        paginados, totalPaginas, desde, hasta, filtrados,
        totalPublicados, totalBorradores, totalArchivados,
        varkDisponibles, dimensionesDisponibles,
        setVista, setPagina,
        handleBusqueda, handlePorPagina, handleFiltro,
        handleFiltroVark, handleFiltroDim, limpiarFiltrosExtra,
        handleTogglePublish, handleArchivar, handleEliminar,
        handleConfirmPublicar, handleConfirmArchivar, handleConfirmarEliminar,
        fetchCursos, irACrear, irAEditar, irAVistaPrevia,
        cerrarModalPublicar, cerrarModalArchivar, cerrarModalEliminar,
    } = useCursosT();

    return (
        <div className="cursos-root">

            {/* ══ HEADER ══════════════════════════════════════════ */}
            <header className="header-curso">
                <div className="header-curso__top">
                    <div>
                        <div className="page-eyebrow">
                            <IoSchoolOutline size={12} /> Panel del tutor
                        </div>
                        <h1 className="page-title">Mis cursos</h1>
                        <p className="page-sub">Gestiona, edita y publica cursos para tus estudiantes</p>
                    </div>
                    <button className="btn-primary-curso" onClick={irACrear}>
                        <IoAdd size={17} /> Crear curso
                    </button>
                </div>

                <div className="header-stats">
                    <div className="hstat">
                        <span className="hstat__val">{cursos.length}</span>
                        <span className="hstat__lbl">Total</span>
                    </div>
                    <div className="hstat">
                        <span className="hstat__val hstat__val--pub">{totalPublicados}</span>
                        <span className="hstat__lbl">Publicados</span>
                    </div>
                    <div className="hstat">
                        <span className="hstat__val hstat__val--draft">{totalBorradores}</span>
                        <span className="hstat__lbl">Borradores</span>
                    </div>
                    <div className="hstat">
                        <span className="hstat__val hstat__val--arch">{totalArchivados}</span>
                        <span className="hstat__lbl">Archivados</span>
                    </div>
                </div>
            </header>

            {/* ══ BODY ════════════════════════════════════════════ */}
            <div className="cursos-layout">

                <PanelFiltros
                    cursos={cursos}
                    filtroEstado={filtroEstado} onFiltro={handleFiltro}
                    filtroVark={filtroVark} onFiltroVark={handleFiltroVark}
                    filtroDimension={filtroDimension} onFiltroDim={handleFiltroDim}
                    varkDisponibles={varkDisponibles}
                    dimensionesDisponibles={dimensionesDisponibles}
                    onLimpiar={limpiarFiltrosExtra}
                />

                <main className="panel-curso">

                    {/* Toolbar */}
                    <div className="toolbar-opciones">
                        <div className="toolbar-opciones-right">
                            <div className="search-wrap">
                                <span className="search-icon"><IoSearch size={14} /></span>
                                <input
                                    className="search-input"
                                    value={busqueda}
                                    onChange={(e) => handleBusqueda(e.target.value)}
                                    placeholder="Buscar por título, descripción o perfil VARK…"
                                />
                                {busqueda && (
                                    <button className="search-clear" onClick={() => handleBusqueda("")}>✕</button>
                                )}
                            </div>
                            <div className="view-toggle">
                                <button
                                    className={`view-btn ${vista === "mosaic" ? "view-btn--active" : ""}`}
                                    onClick={() => setVista("mosaic")} title="Mosaico"
                                >
                                    <IoGridOutline size={15} />
                                </button>
                                <button
                                    className={`view-btn ${vista === "list" ? "view-btn--active" : ""}`}
                                    onClick={() => setVista("list")} title="Lista"
                                >
                                    <IoListOutline size={15} />
                                </button>
                            </div>
                            <div className="per-page-wrap">
                                <span className="per-page-lbl">Mostrar</span>
                                <select
                                    className="per-page-select"
                                    value={porPagina}
                                    onChange={(e) => handlePorPagina(Number(e.target.value))}
                                >
                                    {[4, 8, 12, 16, 20].map((n) => (
                                        <option key={n} value={n}>{n}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Chips de filtros activos */}
                    {(filtroVark || filtroDimension) && (
                        <div className="filtros-activos">
                            {filtroVark && (
                                <span className="filtro-chip">
                                    VARK: {VARK_COLORS[filtroVark]?.label || filtroVark}
                                    <button onClick={() => handleFiltroVark(null)}>✕</button>
                                </span>
                            )}
                            {filtroDimension && (
                                <span className="filtro-chip">
                                    Dimensión: {filtroDimension}
                                    <button onClick={() => handleFiltroDim(null)}>✕</button>
                                </span>
                            )}
                        </div>
                    )}

                    {/* Contenido principal */}
                    {cargando ? (
                        <div className="cursos-empty">
                            <div className="cursos-empty__icon"><IoBookOutline size={24} /></div>
                            <p className="cursos-empty__title">Cargando cursos…</p>
                        </div>
                    ) : error ? (
                        <div className="cursos-empty">
                            <div className="cursos-empty__icon"><IoWarningOutline size={24} /></div>
                            <p className="cursos-empty__title">Ocurrió un error</p>
                            <p className="cursos-empty__text">{error}</p>
                            <button className="btn-primary-curso" style={{ marginTop: 16 }} onClick={fetchCursos}>
                                Reintentar
                            </button>
                        </div>
                    ) : paginados.length === 0 ? (
                        <div className="cursos-empty">
                            <div className="cursos-empty__icon"><IoBookOutline size={24} /></div>
                            <p className="cursos-empty__title">
                                {busqueda ? "Sin resultados" : "Sin cursos aquí todavía"}
                            </p>
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
                                    <CursoCard
                                        key={c.id_curso} curso={c}
                                        onEdit={irAEditar}
                                        onTogglePublish={handleTogglePublish}
                                        onArchivar={handleArchivar}
                                        onEliminar={handleEliminar}
                                        onVistaPrevia={irAVistaPrevia}
                                    />
                                ))}
                            </div>
                            <Paginacion
                                pagina={pagina} totalPaginas={totalPaginas}
                                total={filtrados.length} desde={desde} hasta={hasta}
                                onCambiar={setPagina}
                            />
                        </div>
                    ) : (
                        <div className="cursos-grid-wrapper">
                            <div className="table-wrap">
                                <div className="table-scroll">
                                    <table className="cursos-table">
                                        <thead>
                                            <tr>
                                                {["Curso", "Estado", "VARK", "Secciones", "Estudiantes", "Última edición", ""].map((h) => (
                                                    <th key={h} className="th">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginados.map((c) => (
                                                <CursoRow
                                                    key={c.id_curso} curso={c}
                                                    onEdit={irAEditar}
                                                    onTogglePublish={handleTogglePublish}
                                                    onArchivar={handleArchivar}
                                                    onEliminar={handleEliminar}
                                                    onVistaPrevia={irAVistaPrevia}
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <Paginacion
                                pagina={pagina} totalPaginas={totalPaginas}
                                total={filtrados.length} desde={desde} hasta={hasta}
                                onCambiar={setPagina}
                            />
                        </div>
                    )}
                </main>
            </div>

            {/* ══ MODALES ═════════════════════════════════════════ */}
            <ModalPublicar
                isOpen={!!modalPublicar}
                curso={modalPublicar}
                onConfirm={handleConfirmPublicar}
                onClose={cerrarModalPublicar}
            />
            <ModalArchivar
                isOpen={!!modalArchivar}
                curso={modalArchivar}
                onConfirm={handleConfirmArchivar}
                onClose={cerrarModalArchivar}
            />
            <ModalEliminarCurso
                isOpen={!!modalEliminar}
                curso={modalEliminar}   // ← el objeto completo
                onConfirm={handleConfirmarEliminar}
                onClose={cerrarModalEliminar}
            />

            {/* ══ ALERT DE ÉXITO AL ELIMINAR ══════════════════════ */}
            {alert && (
                <CustomAlert
                    type="success"
                    title={alert.title}
                    message={alert.message}
                    logo={logo}
                    onClose={cerrarAlert}
                />
            )}
        </div>
    );
}