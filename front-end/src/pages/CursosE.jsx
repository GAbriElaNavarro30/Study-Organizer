// src/pages/Cursos/CursosE.jsx
import { 
    IoSearchOutline, IoBookOutline, IoPersonOutline, IoLayersOutline,
    IoFilterOutline, IoCheckmarkCircleOutline, IoPlayCircleOutline,
    IoSchoolOutline, IoGridOutline, IoMenuOutline, IoListOutline,
    IoChevronBackOutline, IoChevronForwardOutline, IoCloseOutline,
    IoArchiveOutline, IoRefreshOutline, IoStarOutline, IoBarChartOutline,
    IoWarningOutline, IoEllipsisVerticalOutline, IoAddCircleOutline,
    IoRemoveCircleOutline,
} from "react-icons/io5";
import "../styles/cursosE.css";
import { useCursosE } from "../hooks/useCursosE.js";
import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ModalCancelarInscripcion } from "../components/ModalCancelarInscripcion";
import { CustomAlert } from "../components/CustomAlert";
import logo from "../assets/imagenes/logotipo.png";

/* ─────────────────────────────────────────────────────────
   CONSTANTES
───────────────────────────────────────────────────────── */
const VARK_COLORS = {
    V: "#1277dd", A: "#2E8B57", R: "#A05A00", K: "#6B5B95",
    VA: "#1277dd", VR: "#2E8B57", VK: "#6B5B95", AR: "#2E8B57",
    AK: "#6B5B95", RK: "#A05A00", VAR: "#1277dd", VAK: "#6B5B95",
    VRK: "#1277dd", ARK: "#A05A00", VARK: "#1277dd",
};
const VARK_LABELS = { V: "Visual", A: "Auditivo", R: "Lector", K: "Kinestésico" };
const VARK_DESC = { V: "Aprendes viendo", A: "Aprendes escuchando", R: "Aprendes leyendo", K: "Aprendes haciendo" };
const TODOS_PERFILES_VARK = ["V", "A", "R", "K", "VA", "VR", "VK", "AR", "AK", "RK", "VAR", "VAK", "VRK", "ARK", "VARK"];


/* ─────────────────────────────────────────────────────────
   HELPER: resuelve el nombre del tutor con fallback
───────────────────────────────────────────────────────── */
function resolverNombreTutor(curso, progreso) {
    const nombreProgreso = progreso?.nombre_tutor;
    const nombreCurso = curso?.nombre_tutor;
    if (nombreProgreso && nombreCurso) {
        return nombreProgreso.length >= nombreCurso.length ? nombreProgreso : nombreCurso;
    }
    return nombreProgreso || nombreCurso || null;
}

/* ═══════════════════════════════════════════════════════
   DROPDOWN PORTAL
═══════════════════════════════════════════════════════ */
function DropdownPortal({ triggerRef, onClose, children }) {
    const dropRef = useRef(null);
    const [coords, setCoords] = useState(null);
    const rafRef = useRef(null);

    const calcCoords = useCallback(() => {
        if (!triggerRef.current) return;
        const r = triggerRef.current.getBoundingClientRect();
        const vW = window.innerWidth;
        const vH = window.innerHeight;
        const W = 192;
        const H = 96;

        let left = r.right - W;
        if (left < 8) left = 8;
        if (left + W > vW - 8) left = vW - W - 8;

        const top = (r.bottom + H + 8 < vH) ? r.bottom + 6 : r.top - H - 6;
        setCoords({ top, left });
    }, [triggerRef]);

    useEffect(() => {
        const loop = () => {
            calcCoords();
            rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, [calcCoords]);

    useEffect(() => {
        const close = (e) => {
            if (
                dropRef.current && !dropRef.current.contains(e.target) &&
                triggerRef.current && !triggerRef.current.contains(e.target)
            ) onClose();
        };
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, [onClose, triggerRef]);

    if (!coords) return null;

    return createPortal(
        <div
            ref={dropRef}
            className="ce-menu-dropdown ce-menu-dropdown--portal"
            style={{ position: "fixed", top: coords.top, left: coords.left, zIndex: 99999 }}
            onClick={e => e.stopPropagation()}
        >
            {children}
        </div>,
        document.body
    );
}

/* ═══════════════════════════════════════════════════════
   MENÚ 3 PUNTITOS
═══════════════════════════════════════════════════════ */
function MenuOpciones({ inscrito, onInscribirse, onCancelar, onVerDetalle, esTabla }) {
    const [open, setOpen] = useState(false);
    const triggerRef = useRef(null);
    const cerrar = useCallback(() => setOpen(false), []);

    return (
        <div className="ce-menu-wrap" onClick={e => e.stopPropagation()}>
            <button
                ref={triggerRef}
                className={`ce-menu-trigger ${esTabla ? "ce-menu-trigger--table" : ""}`}
                onClick={() => setOpen(v => !v)}
                title="Opciones"
            >
                <IoEllipsisVerticalOutline size={esTabla ? 15 : 16} />
            </button>
            {open && (
                <DropdownPortal triggerRef={triggerRef} onClose={cerrar}>
                    <button className="ce-menu-item" onClick={() => { onVerDetalle(); cerrar(); }}>
                        <IoBookOutline size={13} /> Ver detalle
                    </button>
                    {!inscrito ? (
                        <button className="ce-menu-item ce-menu-item--primary"
                            onClick={() => { onInscribirse(); cerrar(); }}>
                            <IoAddCircleOutline size={13} /> Inscribirse
                        </button>
                    ) : (
                        <button className="ce-menu-item ce-menu-item--danger"
                            onClick={() => { onCancelar(); cerrar(); }}>
                            <IoRemoveCircleOutline size={13} /> Cancelar inscripción
                        </button>
                    )}
                </DropdownPortal>
            )}
        </div>
    );
}

function MenuArchivado({ archivadoPorTutor, onDeArchivar, onVer, esTabla }) {
    const [open, setOpen] = useState(false);
    const triggerRef = useRef(null);
    const cerrar = useCallback(() => setOpen(false), []);

    return (
        <div className="ce-menu-wrap" onClick={e => e.stopPropagation()}>
            <button
                ref={triggerRef}
                className={`ce-menu-trigger ${esTabla ? "ce-menu-trigger--table" : ""}`}
                onClick={() => setOpen(v => !v)}
                title="Opciones"
            >
                <IoEllipsisVerticalOutline size={esTabla ? 15 : 16} />
            </button>
            {open && (
                <DropdownPortal triggerRef={triggerRef} onClose={cerrar}>
                    <button className="ce-menu-item" onClick={() => { onVer(); cerrar(); }}>
                        <IoBookOutline size={13} /> Ver curso
                    </button>
                    {!archivadoPorTutor && (
                        <button className="ce-menu-item ce-menu-item--primary"
                            onClick={() => { onDeArchivar(); cerrar(); }}>
                            <IoRefreshOutline size={13} /> Desarchivar
                        </button>
                    )}
                </DropdownPortal>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   HELPERS UI
───────────────────────────────────────────────────────── */
function LoadingState() {
    return (
        <div className="ce-loading">
            <div className="ce-loading-icon"><IoBookOutline size={52} /></div>
            <p className="ce-loading-text">Cargando cursos recomendados...</p>
            <div className="ce-loading-dots"><span /><span /><span /></div>
        </div>
    );
}

function EmptyState({ tab, busqueda, filtroDim, onVerRecomendados }) {
    return (
        <div className="ce-empty">
            {tab === "archivados" ? <IoArchiveOutline size={52} className="ce-empty-icon" /> : <IoBookOutline size={52} className="ce-empty-icon" />}
            <h2 className="ce-empty-title">
                {tab === "mis-cursos" && "Aún no tienes cursos"}
                {tab === "recomendados" && "No hay cursos disponibles"}
                {tab === "archivados" && "Sin cursos archivados"}
            </h2>
            <p className="ce-empty-sub">
                {tab === "mis-cursos" && "Explora los cursos recomendados e inscríbete para comenzar."}
                {tab === "recomendados" && (busqueda ? "Intenta con otro término de búsqueda." : "No encontramos cursos para tu perfil.")}
                {tab === "archivados" && (busqueda || filtroDim ? "Intenta con otro filtro o término." : "Aún no hay cursos archivados.")}
            </p>
            {tab === "mis-cursos" && onVerRecomendados && (
                <button className="ce-card-btn" onClick={onVerRecomendados}>
                    <IoBookOutline size={14} /> Ver recomendados
                </button>
            )}
        </div>
    );
}

function Paginacion({ pagina, totalPaginas, total, desde, hasta, onCambiar }) {
    if (totalPaginas <= 1 && total === 0) return null;
    return (
        <div className="ce-pagination">
            <span className="ce-pagination__info">Mostrando {desde}–{hasta} de {total} {total === 1 ? "curso" : "cursos"}</span>
            <div className="ce-pagination__controls">
                <button className="ce-page-btn" disabled={pagina === 1} onClick={() => onCambiar(pagina - 1)}><IoChevronBackOutline size={14} /></button>
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(p => (
                    <button key={p} className={`ce-page-btn ${p === pagina ? "ce-page-btn--active" : ""}`} onClick={() => onCambiar(p)}>{p}</button>
                ))}
                <button className="ce-page-btn" disabled={pagina === totalPaginas} onClick={() => onCambiar(pagina + 1)}><IoChevronForwardOutline size={14} /></button>
            </div>
            <span className="ce-pagination__spacer" />
        </div>
    );
}

function FiltroChipActivo({ label, color, onLimpiar }) {
    return (
        <div className={`ce-filtro-chip-activo ${color ? "ce-filtro-chip-activo--colored" : ""}`} style={color ? { "--chip-color": color } : undefined}>
            <span className="ce-filtro-chip-activo__label">{label}</span>
            <button className="ce-filtro-chip-activo__clear" onClick={onLimpiar} title="Limpiar filtro"><IoCloseOutline size={12} /></button>
        </div>
    );
}

function CardFooterAccion({ inscrito, progreso, esMetodo, onVerDetalle }) {
    const pct = progreso?.porcentaje ?? 0;
    if (!inscrito) return (<><span className="ce-card-pct-muted">Sin inscripción</span><button className="ce-card-btn ce-card-btn--inscribirse" onClick={e => { e.stopPropagation(); onVerDetalle(); }}><IoBookOutline size={13} /> Ver curso</button></>);
    if (progreso?.completado) return (<><span className="ce-card-pct ce-card-pct--completado"><IoCheckmarkCircleOutline size={12} /> Completado</span><button className={`ce-card-btn ${esMetodo ? "ce-card-btn--metodo" : ""}`} onClick={e => { e.stopPropagation(); onVerDetalle(); }}><IoSchoolOutline size={13} /> Volver a tomar</button></>);
    if (pct > 0) return (<><div className="ce-card-progreso-inline"><div className="ce-card-progreso-bar"><div className="ce-card-progreso-fill" style={{ "--pct": `${pct}%` }} /></div><span className="ce-card-pct ce-card-pct--en-progreso">{pct}%</span></div><button className={`ce-card-btn ${esMetodo ? "ce-card-btn--metodo" : ""}`} onClick={e => { e.stopPropagation(); onVerDetalle(); }}><IoPlayCircleOutline size={13} /> Continuar</button></>);
    return (<><span className="ce-card-pct-muted">Sin iniciar</span><button className={`ce-card-btn ${esMetodo ? "ce-card-btn--metodo" : ""}`} onClick={e => { e.stopPropagation(); onVerDetalle(); }}><IoPlayCircleOutline size={13} /> Iniciar</button></>);
}

/* ─────────────────────────────────────────────────────────
   CURSO CARD — mosaico
───────────────────────────────────────────────────────── */
function CursoCard({ curso, inscrito, progreso, onClick, onInscribirse, onCancelar }) {
    const hue = ((curso.titulo?.charCodeAt(0) || 65) * 7) % 360;
    const varkColor = VARK_COLORS[curso.perfil_vark] || "#1277dd";
    const pct = progreso?.porcentaje ?? 0;
    const esMetodo = !!curso.nombre_dimension;
    const nombreTutor = resolverNombreTutor(curso, progreso);

    return (
        <div className={`ce-card ${esMetodo ? "ce-card--metodo" : ""}`} onDoubleClick={onClick}>
            <div className="ce-card-cover">
                {curso.foto ? <img src={curso.foto} alt={curso.titulo} /> : (
                    <div className="ce-card-cover-placeholder" style={{ "--ph-bg": `hsl(${hue},30%,91%)`, "--ph-color": `hsl(${hue},42%,38%)` }}>
                        {curso.titulo?.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()}
                    </div>
                )}
                {inscrito && <span className="ce-card-inscrito-badge"><IoCheckmarkCircleOutline size={11} /> Inscrito</span>}
                <div className="ce-card-menu-cover" onClick={e => e.stopPropagation()}>
                    <MenuOpciones inscrito={inscrito} onInscribirse={onInscribirse} onCancelar={onCancelar} onVerDetalle={onClick} esTabla={false} />
                </div>
                {inscrito && <div className="ce-card-progress-bar"><div className="ce-card-progress-fill" style={{ "--pct": `${pct}%` }} /></div>}
            </div>
            <div className="ce-card-body">
                <p className="ce-card-titulo">{curso.titulo}</p>
                {curso.descripcion && <p className="ce-card-desc">{curso.descripcion.slice(0, 72)}{curso.descripcion.length > 72 ? "…" : ""}</p>}
                <div className="ce-card-meta">
                    {nombreTutor && <span className="ce-card-meta-item"><IoPersonOutline size={11} /> {nombreTutor}</span>}
                    {curso.total_secciones > 0 && !esMetodo && <span className="ce-card-meta-item"><IoLayersOutline size={11} /> {curso.total_secciones} sección{curso.total_secciones !== 1 ? "es" : ""}</span>}
                </div>
                <div className="ce-card-meta ce-card-meta--tags">
                    <span className="ce-card-vark--inline" style={{ "--vark-color": varkColor }}>{curso.perfil_vark?.split("").map(l => VARK_LABELS[l] || l).join(" · ")}</span>
                    {esMetodo && <span className="ce-card-dim">{curso.nombre_dimension}</span>}
                </div>
                <div className="ce-card-footer">
                    <CardFooterAccion inscrito={inscrito} progreso={progreso} esMetodo={esMetodo} onVerDetalle={onClick} />
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   TABLA CURSOS
───────────────────────────────────────────────────────── */
function TablaCursos({ cursos, inscritosIds, misCursos, irADetalle, inscribirse, abrirModalCancelar }) {
    return (
        <div className="ce-table-wrap">
            <table className="ce-table">
                <thead>
                    <tr>
                        <th className="ce-th ce-th--curso">Curso</th>
                        <th className="ce-th ce-th--instructor">Instructor</th>
                        <th className="ce-th ce-th--perfil">Perfil</th>
                        <th className="ce-th ce-th--dimension">Dimensión</th>
                        <th className="ce-th ce-th--progreso">Progreso</th>
                        <th className="ce-th ce-th--estado">Estado</th>
                        <th className="ce-th ce-th--accion"></th>
                    </tr>
                </thead>
                <tbody>
                    {cursos.map(curso => {
                        const hue = ((curso.titulo?.charCodeAt(0) || 65) * 7) % 360;
                        const varkColor = VARK_COLORS[curso.perfil_vark] || "#1277dd";
                        const inscrito = inscritosIds.has(curso.id_curso);
                        const progreso = misCursos.find(c => c.id_curso === curso.id_curso);
                        const pct = progreso?.porcentaje ?? 0;
                        const esMetodo = !!curso.nombre_dimension;
                        const nombreTutor = resolverNombreTutor(curso, progreso);
                        return (
                            <tr key={curso.id_curso} className={`ce-tr ${esMetodo ? "ce-tr--metodo" : ""}`} onDoubleClick={() => irADetalle(curso.id_curso)}>
                                <td className="ce-td ce-td--curso">
                                    <div className="ce-tbl-curso-wrap">
                                        <div className="ce-tbl-thumb" style={{ "--ph-bg": `hsl(${hue},30%,91%)`, "--ph-color": `hsl(${hue},42%,38%)` }}>
                                            {curso.foto ? <img src={curso.foto} alt={curso.titulo} /> : <span>{curso.titulo?.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()}</span>}
                                            {inscrito && pct > 0 && <div className="ce-tbl-thumb-bar"><div className="ce-tbl-thumb-fill" style={{ "--pct": `${pct}%` }} /></div>}
                                        </div>
                                        <div className="ce-tbl-curso-info">
                                            <p className="ce-tbl-titulo">{curso.titulo}</p>
                                            {curso.descripcion && <p className="ce-tbl-desc">{curso.descripcion.slice(0, 80)}{curso.descripcion.length > 80 ? "…" : ""}</p>}
                                        </div>
                                    </div>
                                </td>
                                <td className="ce-td ce-td--instructor">
                                    {nombreTutor ? <span className="ce-tbl-instructor"><IoPersonOutline size={11} /> {nombreTutor}</span> : <span className="ce-tbl-empty">—</span>}
                                    {curso.total_secciones > 0 && !esMetodo && <span className="ce-tbl-secciones"><IoLayersOutline size={10} /> {curso.total_secciones} secc.</span>}
                                </td>
                                <td className="ce-td ce-td--perfil">
                                    <span className="ce-card-vark--inline" style={{ "--vark-color": varkColor }}>{curso.perfil_vark?.split("").map(l => VARK_LABELS[l] || l).join(" · ")}</span>
                                </td>
                                <td className="ce-td ce-td--dimension">
                                    {esMetodo ? <span className="ce-card-dim">{curso.nombre_dimension}</span> : <span className="ce-tbl-dim-empty">—</span>}
                                </td>
                                <td className="ce-td ce-td--progreso">
                                    {inscrito ? progreso?.completado
                                        ? <span className="ce-tbl-completado"><IoCheckmarkCircleOutline size={12} /> Completado</span>
                                        : <div className="ce-tbl-pct-wrap"><div className="ce-tbl-pct-bar"><div className="ce-tbl-pct-fill" style={{ "--pct": `${pct}%` }} /></div><span className="ce-tbl-pct-label">{pct}%</span></div>
                                        : <span className="ce-tbl-empty">—</span>}
                                </td>
                                <td className="ce-td ce-td--estado">
                                    {inscrito
                                        ? <span className="ce-tbl-badge ce-tbl-badge--inscrito"><IoCheckmarkCircleOutline size={10} /> Inscrito</span>
                                        : <span className="ce-tbl-badge ce-tbl-badge--no">Sin inscribir</span>}
                                </td>
                                <td className="ce-td ce-td--accion" onClick={e => e.stopPropagation()}>
                                    <div className="ce-tbl-accion-wrap">
                                        {!inscrito && <button className="ce-card-btn ce-card-btn--inscribirse ce-card-btn--sm" onClick={e => { e.stopPropagation(); irADetalle(curso.id_curso); }}>Ver</button>}
                                        {inscrito && progreso?.completado && <button className={`ce-card-btn ce-card-btn--sm ${esMetodo ? "ce-card-btn--metodo" : ""}`} onClick={e => { e.stopPropagation(); irADetalle(curso.id_curso); }}><IoSchoolOutline size={12} /> Retomar</button>}
                                        {inscrito && !progreso?.completado && pct > 0 && <button className={`ce-card-btn ce-card-btn--sm ${esMetodo ? "ce-card-btn--metodo" : ""}`} onClick={e => { e.stopPropagation(); irADetalle(curso.id_curso); }}><IoPlayCircleOutline size={12} /> Continuar</button>}
                                        {inscrito && !progreso?.completado && pct === 0 && <button className={`ce-card-btn ce-card-btn--sm ${esMetodo ? "ce-card-btn--metodo" : ""}`} onClick={e => { e.stopPropagation(); irADetalle(curso.id_curso); }}><IoPlayCircleOutline size={12} /> Iniciar</button>}
                                        <MenuOpciones inscrito={inscrito} onInscribirse={() => inscribirse(curso.id_curso)} onCancelar={() => abrirModalCancelar(curso.id_curso)} onVerDetalle={() => irADetalle(curso.id_curso)} esTabla={true} />
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   TABLA ARCHIVADOS (CORREGIDA)
───────────────────────────────────────────────────────── */
function TablaArchivados({ cursos, desarchivar, irADetalle, misCursos }) {
    return (
        <div className="ce-table-wrap">
            <table className="ce-table">
                <thead>
                    <tr>
                        <th className="ce-th ce-th--curso">Curso</th>
                        <th className="ce-th ce-th--instructor">Instructor</th>
                        <th className="ce-th ce-th--perfil">Perfil</th>
                        <th className="ce-th ce-th--dimension">Dimensión</th>
                        <th className="ce-th ce-th--progreso">Progreso</th>
                        <th className="ce-th ce-th--estado">Estado</th>
                        <th className="ce-th ce-th--accion"></th>
                    </tr>
                </thead>
                <tbody>
                    {cursos.map(curso => {
                        const hue = ((curso.titulo?.charCodeAt(0) || 65) * 7) % 360;
                        const varkColor = VARK_COLORS[curso.perfil_vark] || "#1277dd";
                        const esMetodo = !!curso.nombre_dimension;
                        const pct = Math.round(((curso.contenidos_vistos || 0) / Math.max(curso.total_contenidos || 1, 1)) * 100);
                        const progreso = misCursos?.find(c => c.id_curso === curso.id_curso);
                        const nombreTutor = resolverNombreTutor(curso, progreso);
                        return (
                            <tr key={curso.id_curso} className={`ce-tr ce-tr--archivado ${esMetodo ? "ce-tr--metodo" : ""}`} onDoubleClick={() => irADetalle(curso.id_curso)}>
                                <td className="ce-td ce-td--curso">
                                    <div className="ce-tbl-curso-wrap">
                                        <div className="ce-tbl-thumb" style={{ "--ph-bg": `hsl(${hue},30%,91%)`, "--ph-color": `hsl(${hue},42%,38%)` }}>
                                            {curso.foto ? <img src={curso.foto} alt={curso.titulo} /> : <span>{curso.titulo?.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()}</span>}
                                            <div className="ce-tbl-thumb-bar"><div className="ce-tbl-thumb-fill" style={{ "--pct": `${pct}%` }} /></div>
                                        </div>
                                        <div className="ce-tbl-curso-info">
                                            <p className="ce-tbl-titulo">{curso.titulo}</p>
                                            {curso.descripcion && <p className="ce-tbl-desc">{curso.descripcion.slice(0, 80)}{curso.descripcion.length > 80 ? "…" : ""}</p>}
                                        </div>
                                    </div>
                                </td>
                                <td className="ce-td ce-td--instructor">
                                    {nombreTutor ? <span className="ce-tbl-instructor"><IoPersonOutline size={11} /> {nombreTutor}</span> : <span className="ce-tbl-empty">—</span>}
                                </td>
                                <td className="ce-td ce-td--perfil">
                                    <span className="ce-card-vark--inline" style={{ "--vark-color": varkColor }}>{curso.perfil_vark?.split("").map(l => VARK_LABELS[l] || l).join(" · ")}</span>
                                </td>
                                <td className="ce-td ce-td--dimension">
                                    {esMetodo ? <span className="ce-card-dim">{curso.nombre_dimension}</span> : <span className="ce-tbl-dim-empty">—</span>}
                                </td>
                                <td className="ce-td ce-td--progreso">
                                    {curso.completado
                                        ? <span className="ce-tbl-completado"><IoCheckmarkCircleOutline size={12} /> Completado</span>
                                        : <div className="ce-tbl-pct-wrap"><div className="ce-tbl-pct-bar"><div className="ce-tbl-pct-fill" style={{ "--pct": `${pct}%` }} /></div><span className="ce-tbl-pct-label">{pct}%</span></div>}
                                </td>
                                <td className="ce-td ce-td--estado">
                                    {curso.archivado_por_tutor
                                        ? <span className="ce-tbl-badge ce-tbl-badge--tutor"><IoWarningOutline size={10} /> Por el tutor</span>
                                        : <span className="ce-tbl-badge ce-tbl-badge--arch"><IoArchiveOutline size={10} /> Archivado</span>}
                                </td>
                                <td className="ce-td ce-td--accion" onClick={e => e.stopPropagation()}>
                                    <div className="ce-tbl-accion-wrap">
                                        {!curso.archivado_por_tutor && <button className="ce-btn-desarc" onClick={e => { e.stopPropagation(); desarchivar(curso.id_curso); }}><IoRefreshOutline size={12} /> Desarchivar</button>}
                                        <button className="ce-btn-ver" onClick={e => { e.stopPropagation(); irADetalle(curso.id_curso); }}>Ver</button>
                                        <MenuArchivado archivadoPorTutor={curso.archivado_por_tutor} onDeArchivar={() => desarchivar(curso.id_curso)} onVer={() => irADetalle(curso.id_curso)} esTabla={true} />
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   CARD ARCHIVADO — mosaico (CORREGIDA)
───────────────────────────────────────────────────────── */
function CardArchivado({ curso, onDeArchivar, onVer, progreso }) {
    const hue = ((curso.titulo?.charCodeAt(0) || 65) * 7) % 360;
    const varkColor = VARK_COLORS[curso.perfil_vark] || "#1277dd";
    const esMetodo = !!curso.nombre_dimension;
    const pct = Math.round(((curso.contenidos_vistos || 0) / Math.max(curso.total_contenidos || 1, 1)) * 100);
    const fechaFmt = curso.fecha_inscripcion ? new Date(curso.fecha_inscripcion).toLocaleDateString("es-MX", { day: "2-digit", month: "short" }) : null;
    const nombreTutor = resolverNombreTutor(curso, progreso);

    return (
        <div className="ce-card ce-card--archivado" onDoubleClick={onVer}>
            <div className="ce-card-cover">
                {curso.foto ? <img src={curso.foto} alt={curso.titulo} /> : (
                    <div className="ce-card-cover-placeholder" style={{ "--ph-bg": `hsl(${hue},30%,91%)`, "--ph-color": `hsl(${hue},42%,38%)` }}>
                        {curso.titulo?.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()}
                    </div>
                )}
                <div className="ce-card-arch-overlay" />
                {curso.archivado_por_tutor
                    ? <span className="ce-card-arch-badge ce-card-arch-badge--tutor"><IoWarningOutline size={10} /> Por el tutor</span>
                    : <span className="ce-card-arch-badge"><IoArchiveOutline size={10} /> Archivado</span>}
                <div className="ce-card-progress-bar"><div className="ce-card-progress-fill" style={{ "--pct": `${pct}%` }} /></div>
            </div>
            <div className="ce-card-body">
                <p className="ce-card-titulo">{curso.titulo}</p>
                {curso.descripcion && <p className="ce-card-desc">{curso.descripcion.slice(0, 72)}{curso.descripcion.length > 72 ? "…" : ""}</p>}
                <div className="ce-card-meta">
                    {nombreTutor && <span className="ce-card-meta-item"><IoPersonOutline size={11} /> {nombreTutor}</span>}
                </div>
                <div className="ce-card-meta ce-card-meta--tags">
                    <span className="ce-card-vark--inline" style={{ "--vark-color": varkColor }}>{curso.perfil_vark?.split("").map(l => VARK_LABELS[l] || l).join(" · ")}</span>
                    {esMetodo && <span className="ce-card-dim">{curso.nombre_dimension}</span>}
                </div>
                <div className="ce-card-meta">
                    {curso.completado ? <span className="ce-card-arch-date ce-card-arch-date--completado">✓ Completado</span>
                        : curso.archivado_por_tutor ? <span className="ce-card-arch-date ce-card-arch-date--tutor">El tutor archivó este curso</span>
                            : fechaFmt ? <span className="ce-card-arch-date">Archivado · {fechaFmt}</span> : null}
                </div>
                <div className="ce-card-footer">
                    <span className="ce-card-pct">{pct}% completado</span>
                    <div className="ce-card-actions">
                        {!curso.archivado_por_tutor && <button className="ce-btn-desarc" onClick={e => { e.stopPropagation(); onDeArchivar(); }}><IoRefreshOutline size={12} /> Desarchivar</button>}
                        <button className="ce-btn-ver" onClick={e => { e.stopPropagation(); onVer(); }}>Ver</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
═══════════════════════════════════════════════════════════ */
export function CursosE() {
    const [sidebarAbierto, setSidebarAbierto] = useState(false);
    const [vista, setVista] = useState("mosaic");
    const [porPagina, setPorPagina] = useState(8);
    const [pagina, setPagina] = useState(1);

    /* ── Modal cancelar inscripción ── */
    const [modalCancelar, setModalCancelar] = useState({ abierto: false, curso: null });
    const [cancelando, setCancelando] = useState(false);

    /* ── Alerta de éxito al inscribirse ── */
    const [alertaInscripcion, setAlertaInscripcion] = useState({ visible: false, titulo: "" });
    const [alertaCancelacion, setAlertaCancelacion] = useState({ visible: false, titulo: "" });

    const {
        cargando, animado, tab, setTab, busqueda, setBusqueda,
        filtroVark, setFiltroVark, cursosFiltrados, inscritosIds,
        misCursos, cursos, cursosArchivados, letrasVark,
        filtroDim, setFiltroDim, filtroEstadoArch, setFiltroEstadoArch,
        ordenArch, setOrdenArch, todasDimensiones, desarchivar,
        irADetalle, inscribirse, cancelarInscripcion,
    } = useCursosE();

    if (cargando) return <LoadingState />;

    const noInscritos = cursos.filter(c => !inscritosIds.has(c.id_curso)).length;
    const totalPagsFn = lista => Math.max(1, Math.ceil(lista.length / porPagina));
    const desdeFn = lista => lista.length === 0 ? 0 : (pagina - 1) * porPagina + 1;
    const hastaFn = lista => Math.min(pagina * porPagina, lista.length);
    const paginadosFn = lista => lista.slice((pagina - 1) * porPagina, pagina * porPagina);

    const tabLabel = { recomendados: "Recomendados", "mis-cursos": "Mis cursos", archivados: "Archivados" };
    const archivadosPorTutor = cursosArchivados.filter(c => c.archivado_por_tutor).length;
    const varkLabel = filtroVark !== "todos" ? `${filtroVark} · ${filtroVark.split("").map(l => VARK_LABELS[l] || l).join(" · ")}` : null;
    const varkColor = filtroVark !== "todos" ? (VARK_COLORS[filtroVark] || "#1277dd") : null;
    const hayFiltrosActivos = filtroVark !== "todos" || filtroDim !== "";
    const limpiarTodo = () => { setFiltroVark("todos"); setFiltroDim(""); setPagina(1); };

    /* ── Inscripción con alerta de éxito ── */
    const handleInscribirse = async (id_curso) => {
        const curso = cursos.find(c => c.id_curso === id_curso);
        await inscribirse(id_curso);
        setAlertaInscripcion({
            visible: true,
            titulo: curso?.titulo || "el curso",
        });
    };

    /* ── Modal cancelar ── */
    const abrirModalCancelar = (id_curso) => {
        const curso =
            cursos.find(c => c.id_curso === id_curso) ||
            misCursos.find(c => c.id_curso === id_curso);
        setModalCancelar({ abierto: true, curso: curso || { id_curso } });
    };

    const confirmarCancelar = async () => {
        const tituloCurso = modalCancelar.curso?.titulo || "el curso";
        setCancelando(true);
        await cancelarInscripcion(modalCancelar.curso.id_curso);
        setCancelando(false);
        setModalCancelar({ abierto: false, curso: null });
        setAlertaCancelacion({ visible: true, titulo: tituloCurso });
    };
    const cerrarModalCancelar = () => {
        if (cancelando) return;
        setModalCancelar({ abierto: false, curso: null });
    };

    return (
        <div className={`ce-app ${animado ? "ce-animated" : ""}`}>

            <div className="ce-mobile-bar">
                <span className="ce-mobile-bar-title">{tabLabel[tab]}</span>
                <button className="ce-mobile-toggle" onClick={() => setSidebarAbierto(v => !v)}>
                    {sidebarAbierto ? <><IoCloseOutline size={15} /> Cerrar</> : <><IoMenuOutline size={15} /> Filtros</>}
                </button>
            </div>

            <aside className={`ce-sidebar ${sidebarAbierto ? "ce-sidebar--open" : ""}`}>
                <div className="ce-sidebar-section ce-sidebar-section--top">
                    <p className="ce-sidebar-label"><IoPersonOutline size={11} /> Tu perfil</p>
                    {letrasVark.length > 0 ? (
                        <div className="ce-vark-profile">
                            {letrasVark.map(l => (
                                <div key={l} className="ce-vark-chip" style={{ "--vark-color": VARK_COLORS[l] }}>
                                    <span className="ce-vark-chip-letra">{l}</span>
                                    <div className="ce-vark-chip-info">
                                        <span className="ce-vark-chip-nombre">{VARK_LABELS[l]}</span>
                                        <span className="ce-vark-chip-desc">{VARK_DESC[l]}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : <p className="ce-sidebar-empty">Sin perfil aún</p>}
                </div>
                <div className="ce-sidebar-divider" />
                <div className="ce-sidebar-section">
                    <p className="ce-sidebar-label"><IoGridOutline size={11} /> Navegación</p>
                    <nav className="ce-sidebar-nav">
                        {[
                            { key: "recomendados", icon: <IoStarOutline size={15} />, label: "Recomendados", count: cursos.length },
                            { key: "mis-cursos", icon: <IoSchoolOutline size={15} />, label: "Mis cursos", count: misCursos.length },
                            { key: "archivados", icon: <IoArchiveOutline size={15} />, label: "Archivados", count: cursosArchivados.length },
                        ].map(item => (
                            <button key={item.key} className={`ce-sidebar-nav-item ${tab === item.key ? "ce-sidebar-nav-item--active" : ""}`}
                                onClick={() => { setTab(item.key); setPagina(1); setSidebarAbierto(false); }}>
                                {item.icon}<span>{item.label}</span><span className="ce-sidebar-count">{item.count}</span>
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="ce-sidebar-divider" />
                <div className="ce-sidebar-section">
                    <div className="ce-sidebar-filter-header">
                        <p className="ce-sidebar-label ce-sidebar-label--no-mb"><IoFilterOutline size={11} /> Filtrar por perfil</p>
                        {filtroVark !== "todos" && <button className="ce-sidebar-clear-btn" onClick={() => { setFiltroVark("todos"); setPagina(1); }}><IoCloseOutline size={11} /> Limpiar</button>}
                    </div>
                    <div className="ce-dim-select-wrap ce-dim-select-wrap--no-chip">
                        <select className="ce-dim-select" value={filtroVark === "todos" ? "" : filtroVark} onChange={e => { setFiltroVark(e.target.value || "todos"); setPagina(1); }}>
                            <option value="">Todos los perfiles</option>
                            {TODOS_PERFILES_VARK.map(p => <option key={p} value={p}>{p.split("").map(l => VARK_LABELS[l] || l).join(" · ")}</option>)}
                        </select>
                    </div>
                </div>
                <div className="ce-sidebar-divider" />
                <div className="ce-sidebar-section">
                    <div className="ce-sidebar-filter-header">
                        <p className="ce-sidebar-label ce-sidebar-label--no-mb"><IoLayersOutline size={11} /> Dimensión de hábito</p>
                        {filtroDim && <button className="ce-sidebar-clear-btn" onClick={() => { setFiltroDim(""); setPagina(1); }}><IoCloseOutline size={11} /> Limpiar</button>}
                    </div>
                    <div className="ce-dim-select-wrap ce-dim-select-wrap--no-chip">
                        <select className="ce-dim-select" value={filtroDim} onChange={e => { setFiltroDim(e.target.value); setPagina(1); }}>
                            <option value="">Todas las dimensiones</option>
                            {todasDimensiones.map(d => <option key={d.id_dimension} value={d.nombre_dimension}>{d.nombre_dimension}</option>)}
                        </select>
                    </div>
                </div>
                {hayFiltrosActivos && (
                    <div className="ce-sidebar-section ce-sidebar-section--clear">
                        <button className="ce-sidebar-clear-all-btn" onClick={limpiarTodo}><IoRefreshOutline size={13} /> Limpiar todos los filtros</button>
                    </div>
                )}
                <div className="ce-sidebar-divider" />
                <div className="ce-sidebar-section">
                    <p className="ce-sidebar-label"><IoBarChartOutline size={11} /> Resumen</p>
                    <div className="ce-sidebar-stats">
                        <div className="ce-sidebar-stat"><span className="ce-sidebar-stat-num">{misCursos.length}</span><span className="ce-sidebar-stat-label">Inscritos</span></div>
                        <div className="ce-sidebar-stat"><span className="ce-sidebar-stat-num">{cursos.length}</span><span className="ce-sidebar-stat-label">Disponibles</span></div>
                        <div className="ce-sidebar-stat"><span className="ce-sidebar-stat-num">{noInscritos}</span><span className="ce-sidebar-stat-label">No inscritos</span></div>
                    </div>
                </div>
            </aside>

            <div className="ce-main">
                <div className="ce-topbar">
                    <div>
                        <h1 className="ce-header-title">
                            {tab === "recomendados" && <>Cursos <em>para ti</em></>}
                            {tab === "mis-cursos" && <>Mis <em>cursos</em></>}
                            {tab === "archivados" && <>Cursos <em>archivados</em></>}
                        </h1>
                        <p className="ce-header-subtitle">
                            {tab === "recomendados" && "Seleccionados según tu perfil de aprendizaje y hábitos a mejorar."}
                            {tab === "mis-cursos" && "Cursos en los que estás inscrito actualmente."}
                            {tab === "archivados" && "Cursos pausados o archivados por el tutor. Puedes verlos cuando quieras."}
                        </p>
                        {hayFiltrosActivos && (
                            <div className="ce-active-filters-row">
                                <span className="ce-active-filters-label">Filtros activos:</span>
                                {varkLabel && <FiltroChipActivo label={varkLabel} color={varkColor} onLimpiar={() => { setFiltroVark("todos"); setPagina(1); }} />}
                                {filtroDim && <FiltroChipActivo label={filtroDim} onLimpiar={() => { setFiltroDim(""); setPagina(1); }} />}
                                <button className="ce-active-filters-clear-all" onClick={limpiarTodo}><IoCloseOutline size={11} /> Limpiar todo</button>
                            </div>
                        )}
                    </div>
                    <div className="ce-topbar-controls">
                        <div className="ce-search">
                            <IoSearchOutline size={14} />
                            <input type="text" placeholder="Buscar..." value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(1); }} />
                        </div>
                        <div className="ce-view-toggle">
                            <button className={`ce-view-btn ${vista === "mosaic" ? "ce-view-btn--active" : ""}`} onClick={() => setVista("mosaic")} title="Mosaico"><IoGridOutline size={15} /></button>
                            <button className={`ce-view-btn ${vista === "list" ? "ce-view-btn--active" : ""}`} onClick={() => setVista("list")} title="Lista / Tabla"><IoListOutline size={15} /></button>
                        </div>
                        <div className="ce-per-page-wrap">
                            <span className="ce-per-page-lbl">Mostrar</span>
                            <select className="ce-per-page-select" value={porPagina} onChange={e => { setPorPagina(Number(e.target.value)); setPagina(1); }}>
                                {[4, 8, 12, 16, 20].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {tab === "recomendados" && (cursosFiltrados.length === 0 ? <EmptyState tab={tab} busqueda={busqueda} /> : <>
                    {vista === "mosaic"
                        ? <div className="ce-grid">{paginadosFn(cursosFiltrados).map(curso => (
                            <CursoCard
                                key={curso.id_curso}
                                curso={curso}
                                inscrito={inscritosIds.has(curso.id_curso)}
                                progreso={misCursos.find(c => c.id_curso === curso.id_curso)}
                                onClick={() => irADetalle(curso.id_curso)}
                                onInscribirse={() => handleInscribirse(curso.id_curso)}
                                onCancelar={() => abrirModalCancelar(curso.id_curso)}
                            />
                        ))}</div>
                        : <TablaCursos
                            cursos={paginadosFn(cursosFiltrados)}
                            inscritosIds={inscritosIds}
                            misCursos={misCursos}
                            irADetalle={irADetalle}
                            inscribirse={handleInscribirse}
                            abrirModalCancelar={abrirModalCancelar}
                        />}
                    <Paginacion pagina={pagina} totalPaginas={totalPagsFn(cursosFiltrados)} total={cursosFiltrados.length} desde={desdeFn(cursosFiltrados)} hasta={hastaFn(cursosFiltrados)} onCambiar={setPagina} />
                </>)}

                {tab === "mis-cursos" && (cursosFiltrados.length === 0 ? <EmptyState tab={tab} busqueda={busqueda} onVerRecomendados={() => { setTab("recomendados"); setPagina(1); }} /> : <>
                    {vista === "mosaic"
                        ? <div className="ce-grid">{paginadosFn(cursosFiltrados).map(curso => (
                            <CursoCard
                                key={curso.id_curso}
                                curso={curso}
                                inscrito={inscritosIds.has(curso.id_curso)}
                                progreso={misCursos.find(c => c.id_curso === curso.id_curso)}
                                onClick={() => irADetalle(curso.id_curso)}
                                onInscribirse={() => handleInscribirse(curso.id_curso)}
                                onCancelar={() => abrirModalCancelar(curso.id_curso)}
                            />
                        ))}</div>
                        : <TablaCursos
                            cursos={paginadosFn(cursosFiltrados)}
                            inscritosIds={inscritosIds}
                            misCursos={misCursos}
                            irADetalle={irADetalle}
                            inscribirse={handleInscribirse}
                            abrirModalCancelar={abrirModalCancelar}
                        />}
                    <Paginacion pagina={pagina} totalPaginas={totalPagsFn(cursosFiltrados)} total={cursosFiltrados.length} desde={desdeFn(cursosFiltrados)} hasta={hastaFn(cursosFiltrados)} onCambiar={setPagina} />
                </>)}

                {tab === "archivados" && (<>
                    {cursosFiltrados.length === 0 ? <EmptyState tab={tab} busqueda={busqueda} filtroDim={filtroDim} /> : <>
                        {vista === "mosaic"
                            ? <div className="ce-grid">{paginadosFn(cursosFiltrados).map(curso => (
                                <CardArchivado
                                    key={curso.id_curso}
                                    curso={curso}
                                    progreso={misCursos.find(c => c.id_curso === curso.id_curso)}
                                    onDeArchivar={() => desarchivar(curso.id_curso)}
                                    onVer={() => irADetalle(curso.id_curso)}
                                />
                            ))}</div>
                            : <TablaArchivados
                                cursos={paginadosFn(cursosFiltrados)}
                                misCursos={misCursos}
                                desarchivar={desarchivar}
                                irADetalle={irADetalle}
                            />}
                        <Paginacion pagina={pagina} totalPaginas={totalPagsFn(cursosFiltrados)} total={cursosFiltrados.length} desde={desdeFn(cursosFiltrados)} hasta={hastaFn(cursosFiltrados)} onCambiar={setPagina} />
                    </>}
                </>)}
            </div>

            {/* ── Modal de confirmación cancelar inscripción ── */}
            <ModalCancelarInscripcion
                abierto={modalCancelar.abierto}
                curso={modalCancelar.curso}
                onConfirmar={confirmarCancelar}
                onCerrar={cerrarModalCancelar}
                cargando={cancelando}
            />

            {/* ── Alerta de éxito al inscribirse ── */}
            {alertaInscripcion.visible && (
                <CustomAlert
                    type="success"
                    title="¡Inscripción exitosa!"
                    message={`Te has inscrito correctamente a "${alertaInscripcion.titulo}". ¡Ya puedes comenzar a aprender!`}
                    onClose={() => setAlertaInscripcion({ visible: false, titulo: "" })}
                    logo={logo}
                />
            )}

            {alertaCancelacion.visible && (
                <CustomAlert
                    type="success"
                    title="Inscripción cancelada"
                    message={`Tu inscripción a "${alertaCancelacion.titulo}" ha sido cancelada exitosamente.`}
                    onClose={() => setAlertaCancelacion({ visible: false, titulo: "" })}
                    logo={logo}
                />
            )}

        </div>
    );
}