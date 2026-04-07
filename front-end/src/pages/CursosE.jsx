// src/pages/Cursos/CursosE.jsx
import {
    IoSearchOutline,
    IoBookOutline,
    IoPersonOutline,
    IoLayersOutline,
    IoFilterOutline,
    IoCheckmarkCircleOutline,
    IoPlayCircleOutline,
    IoSchoolOutline,
    IoAnalyticsOutline,
    IoGridOutline,
    IoMenuOutline,
    IoCloseOutline,
    IoArchiveOutline,
    IoRefreshOutline,
    IoStarOutline,
    IoLibraryOutline,
    IoBarChartOutline,
} from "react-icons/io5";
import { GiBrain } from "react-icons/gi";
import "../styles/cursosE.css";
import { useCursosE } from "../hooks/useCursosE.js";
import { useState } from "react";

const VARK_COLORS = {
    V: "#1277dd", A: "#2E8B57", R: "#A05A00", K: "#6B5B95",
    VA: "#1277dd", VR: "#2E8B57", VK: "#6B5B95", AR: "#2E8B57",
    AK: "#6B5B95", RK: "#A05A00", VAR: "#1277dd", VAK: "#6B5B95",
    VRK: "#1277dd", ARK: "#A05A00", VARK: "#1277dd",
};

const VARK_LABELS = { V: "Visual", A: "Auditivo", R: "Lector", K: "Kinestésico" };
const VARK_DESC = { V: "Aprendes viendo", A: "Aprendes escuchando", R: "Aprendes leyendo", K: "Aprendes haciendo" };

const FILTROS_ARCH = [
    { key: "todos", label: "Todos" },
    { key: "progreso", label: "Con progreso" },
    { key: "sin", label: "Sin iniciar" },
    { key: "completado", label: "Completados" },
];

function LoadingState() {
    return (
        <div className="ce-loading">
            <div className="ce-loading-icon"><IoBookOutline size={52} /></div>
            <p className="ce-loading-text">Cargando cursos recomendados...</p>
            <div className="ce-loading-dots"><span /><span /><span /></div>
        </div>
    );
}

function CursoCard({ curso, inscrito, progreso, onClick }) {
    const hue = ((curso.titulo?.charCodeAt(0) || 65) * 7) % 360;
    const varkColor = VARK_COLORS[curso.perfil_vark] || "#1277dd";
    const pct = progreso?.porcentaje ?? 0;
    const esMetodo = !!curso.nombre_dimension;

    return (
        <div className={`ce-card ${esMetodo ? "ce-card--metodo" : ""}`} onClick={onClick}>
            <div className="ce-card-cover">
                {curso.foto ? (
                    <img src={curso.foto} alt={curso.titulo} />
                ) : (
                    <div
                        className="ce-card-cover-placeholder"
                        style={{ background: `hsl(${hue},30%,91%)`, color: `hsl(${hue},42%,38%)` }}
                    >
                        {curso.titulo?.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()}
                    </div>
                )}
                <span className={`ce-card-tipo-badge ${esMetodo ? "ce-card-tipo-badge--metodo" : "ce-card-tipo-badge--vark"}`}>
                    {esMetodo ? "Hábitos" : "Aprendizaje"}
                </span>
                <span className="ce-card-vark" style={{ background: varkColor }}>
                    {curso.perfil_vark}
                </span>
                {inscrito && (
                    <span className="ce-card-inscrito-badge">
                        <IoCheckmarkCircleOutline size={11} /> Inscrito
                    </span>
                )}
                {inscrito && (
                    <div className="ce-card-progress-bar">
                        <div className="ce-card-progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                )}
            </div>

            <div className="ce-card-body">
                <p className="ce-card-titulo">{curso.titulo}</p>
                {curso.descripcion && (
                    <p className="ce-card-desc">
                        {curso.descripcion.slice(0, 72)}{curso.descripcion.length > 72 ? "…" : ""}
                    </p>
                )}
                <div className="ce-card-meta">
                    {curso.nombre_tutor && (
                        <span className="ce-card-meta-item">
                            <IoPersonOutline size={11} /> {curso.nombre_tutor}
                        </span>
                    )}
                    {curso.total_secciones > 0 && !esMetodo && (
                        <span className="ce-card-meta-item">
                            <IoLayersOutline size={11} />
                            {curso.total_secciones} sección{curso.total_secciones !== 1 ? "es" : ""}
                        </span>
                    )}
                    {esMetodo && <span className="ce-card-dim">{curso.nombre_dimension}</span>}
                </div>
                <div className="ce-card-footer">
                    {inscrito
                        ? <span className="ce-card-pct">{pct}% completado</span>
                        : <span className="ce-card-pct-muted">Sin inscripción</span>
                    }
                    {!inscrito ? (
                        <button className={`ce-card-btn ${esMetodo ? "ce-card-btn--outline-metodo" : "ce-card-btn--outline"}`}>
                            <IoBookOutline size={13} /> Ver curso
                        </button>
                    ) : progreso?.completado ? (
                        <button className={`ce-card-btn ${esMetodo ? "ce-card-btn--metodo" : ""}`}>
                            <IoSchoolOutline size={13} /> Volver a tomar
                        </button>
                    ) : pct > 0 ? (
                        <button className={`ce-card-btn ${esMetodo ? "ce-card-btn--metodo" : ""}`}>
                            <IoPlayCircleOutline size={13} /> Continuar
                        </button>
                    ) : (
                        <button className={`ce-card-btn ${esMetodo ? "ce-card-btn--metodo" : ""}`}>
                            <IoPlayCircleOutline size={13} /> Iniciar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function CardArchivado({ curso, onDeArchivar, onVer }) {
    const hue = ((curso.titulo?.charCodeAt(0) || 65) * 7) % 360;
    const pct = Math.round(
        ((curso.contenidos_vistos || 0) / Math.max(curso.total_contenidos || 1, 1)) * 100
    );
    const fechaFmt = curso.fecha_archivado
        ? new Date(curso.fecha_archivado).toLocaleDateString("es-MX", { day: "2-digit", month: "short" })
        : null;

    return (
        <div className="ce-card ce-card--archivado" onClick={onVer}>
            <div className="ce-card-cover">
                {curso.foto ? (
                    <img src={curso.foto} alt={curso.titulo} />
                ) : (
                    <div
                        className="ce-card-cover-placeholder"
                        style={{ background: `hsl(${hue},30%,91%)`, color: `hsl(${hue},42%,38%)` }}
                    >
                        {curso.titulo?.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()}
                    </div>
                )}
                <div className="ce-card-arch-overlay" />
                <span className="ce-card-arch-badge">
                    <IoArchiveOutline size={10} /> Archivado
                </span>
                <span className="ce-card-vark" style={{ background: VARK_COLORS[curso.perfil_vark] || "#1277dd" }}>
                    {curso.perfil_vark}
                </span>
                {curso.nombre_dimension && (
                    <span className="ce-card-tipo-badge ce-card-tipo-badge--metodo">
                        {curso.nombre_dimension}
                    </span>
                )}
                <div className="ce-card-progress-bar">
                    <div className="ce-card-progress-fill" style={{ width: `${pct}%` }} />
                </div>
            </div>
            <div className="ce-card-body">
                <p className="ce-card-titulo">{curso.titulo}</p>
                {curso.descripcion && (
                    <p className="ce-card-desc">
                        {curso.descripcion.slice(0, 72)}{curso.descripcion.length > 72 ? "…" : ""}
                    </p>
                )}
                <div className="ce-card-meta">
                    {curso.nombre_tutor && (
                        <span className="ce-card-meta-item">
                            <IoPersonOutline size={11} /> {curso.nombre_tutor}
                        </span>
                    )}
                    {curso.completado ? (
                        <span className="ce-card-arch-date" style={{ background: "#DCFCE7", color: "#166534" }}>
                            ✓ Completado
                        </span>
                    ) : fechaFmt ? (
                        <span className="ce-card-arch-date">Archivado · {fechaFmt}</span>
                    ) : null}
                </div>
                <div className="ce-card-footer">
                    <span className="ce-card-pct">{pct}% completado</span>
                    <div className="ce-card-actions">
                        <button className="ce-btn-desarc" onClick={e => { e.stopPropagation(); onDeArchivar(); }}>
                            <IoRefreshOutline size={12} /> Desarchivar
                        </button>
                        <button className="ce-btn-ver" onClick={e => { e.stopPropagation(); onVer(); }}>
                            Ver
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SeccionCursos({ tipo, cursos, inscritosIds, misCursos: misCursosArr, irADetalle }) {
    if (cursos.length === 0) return null;
    const esMetodo = tipo === "metodo";

    return (
        <div className="ce-section-block">
            <div className="ce-section-head">
                <span className={`ce-section-badge ${esMetodo ? "ce-section-badge--metodo" : "ce-section-badge--vark"}`}>
                    {esMetodo
                        ? <><IoLibraryOutline size={13} /> Hábitos y métodos de estudio</>
                        : <><GiBrain size={13} /> Cursos de aprendizaje VARK</>
                    }
                </span>
                <div className="ce-section-line" />
            </div>
            <p className="ce-section-desc">
                {esMetodo
                    ? "Cursos para reforzar tus dimensiones de desarrollo personal y hábitos de vida."
                    : "Cursos diseñados según tu estilo de aprendizaje."}
            </p>
            <div className="ce-grid">
                {cursos.map(curso => {
                    const inscrito = inscritosIds.has(curso.id_curso);
                    const miCurso = misCursosArr.find(c => c.id_curso === curso.id_curso);
                    const pct = miCurso
                        ? Math.round(((miCurso.contenidos_vistos || 0) / Math.max(miCurso.total_contenidos || 1, 1)) * 100)
                        : 0;
                    return (
                        <CursoCard
                            key={curso.id_curso}
                            curso={curso}
                            inscrito={inscrito}
                            progreso={inscrito ? { porcentaje: pct, completado: !!miCurso?.completado } : null}
                            onClick={() => irADetalle(curso.id_curso)}
                        />
                    );
                })}
            </div>
        </div>
    );
}

export function CursosE() {
    const [sidebarAbierto, setSidebarAbierto] = useState(false);

    const {
        cargando, animado,
        tab, setTab,
        busqueda, setBusqueda,
        filtroVark, setFiltroVark,
        cursosFiltrados, inscritosIds,
        misCursos, cursos,
        cursosArchivados,
        perfilVark, letrasVark,
        filtroDim, setFiltroDim,
        filtroEstadoArch, setFiltroEstadoArch,
        ordenArch, setOrdenArch,
        todasDimensiones,          // ← viene del hook, todas las de la BD
        desarchivar,
        irADetalle,
    } = useCursosE();

    if (cargando) return <LoadingState />;

    const progresoGeneral = misCursos.length > 0
        ? Math.round(
            misCursos.reduce((acc, c) => {
                const pct = Math.round(((c.contenidos_vistos || 0) / Math.max(c.total_contenidos || 1, 1)) * 100);
                return acc + pct;
            }, 0) / misCursos.length
        )
        : 0;

    const separarCursos = (lista) => ({
        vark: lista.filter(c => !c.nombre_dimension),
        metodo: lista.filter(c => !!c.nombre_dimension),
    });

    const recomendadosExactos = cursosFiltrados.filter(c => c.prioridad === 0);
    const recomendadosAfines  = cursosFiltrados.filter(c => c.prioridad === 1);

    const exactosVark   = recomendadosExactos.filter(c => !c.nombre_dimension);
    const exactosMetodo = recomendadosExactos.filter(c => !!c.nombre_dimension);
    const afinesVark    = recomendadosAfines.filter(c => !c.nombre_dimension);
    const afinesMetodo  = recomendadosAfines.filter(c => !!c.nombre_dimension);

    const { vark: misCursosVark, metodo: misCursosMetodo } = separarCursos(cursosFiltrados);

    const tabLabel = { recomendados: "Recomendados", "mis-cursos": "Mis cursos", archivados: "Archivados" };

    return (
        <div className={`ce-app ${animado ? "ce-animated" : ""}`}>

            {/* ── BARRA MÓVIL ── */}
            <div className="ce-mobile-bar">
                <span className="ce-mobile-bar-title">{tabLabel[tab]}</span>
                <button className="ce-mobile-toggle" onClick={() => setSidebarAbierto(v => !v)}>
                    {sidebarAbierto
                        ? <><IoCloseOutline size={15} /> Cerrar</>
                        : <><IoMenuOutline size={15} /> Filtros</>
                    }
                </button>
            </div>

            {/* ══════════ SIDEBAR ══════════ */}
            <aside className={`ce-sidebar ${sidebarAbierto ? "ce-sidebar--open" : ""}`}>

                {/* Perfil VARK */}
                <div className="ce-sidebar-section" style={{ marginTop: 16 }}>
                    <p className="ce-sidebar-label">
                        <IoPersonOutline size={11} /> Tu perfil
                    </p>
                    {letrasVark.length > 0 ? (
                        <div className="ce-vark-profile">
                            {letrasVark.map(l => (
                                <div key={l} className="ce-vark-chip" style={{ background: VARK_COLORS[l] }}>
                                    <span className="ce-vark-chip-letra">{l}</span>
                                    <div className="ce-vark-chip-info">
                                        <span className="ce-vark-chip-nombre">{VARK_LABELS[l]}</span>
                                        <span className="ce-vark-chip-desc">{VARK_DESC[l]}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="ce-sidebar-empty">Sin perfil aún</p>
                    )}
                </div>

                <div className="ce-sidebar-divider" />

                {/* Navegación */}
                <div className="ce-sidebar-section">
                    <p className="ce-sidebar-label">
                        <IoGridOutline size={11} /> Navegación
                    </p>
                    <nav className="ce-sidebar-nav">
                        <button
                            className={`ce-sidebar-nav-item ${tab === "recomendados" ? "ce-sidebar-nav-item--active" : ""}`}
                            onClick={() => setTab("recomendados")}
                        >
                            <IoStarOutline size={15} />
                            <span>Recomendados</span>
                            <span className="ce-sidebar-count">{cursos.length}</span>
                        </button>
                        <button
                            className={`ce-sidebar-nav-item ${tab === "mis-cursos" ? "ce-sidebar-nav-item--active" : ""}`}
                            onClick={() => setTab("mis-cursos")}
                        >
                            <IoSchoolOutline size={15} />
                            <span>Mis cursos</span>
                            <span className="ce-sidebar-count">{misCursos.length}</span>
                        </button>
                        <button
                            className={`ce-sidebar-nav-item ${tab === "archivados" ? "ce-sidebar-nav-item--active" : ""}`}
                            onClick={() => setTab("archivados")}
                        >
                            <IoArchiveOutline size={15} />
                            <span>Archivados</span>
                            <span className="ce-sidebar-count">{cursosArchivados.length}</span>
                        </button>
                    </nav>
                </div>

                <div className="ce-sidebar-divider" />

                {/* Filtro VARK */}
                <div className="ce-sidebar-section">
                    <p className="ce-sidebar-label">
                        <IoFilterOutline size={11} /> Filtrar por perfil
                    </p>
                    {filtroVark && filtroVark !== "todos" && (
                        <div style={{ marginBottom: 8 }}>
                            <span className="ce-dim-chip-activo">
                                <span>
                                    {filtroVark === "V" ? "V · Visual"
                                        : filtroVark === "A" ? "A · Auditivo"
                                        : filtroVark === "R" ? "R · Lector"
                                        : "K · Kinestésico"}
                                </span>
                                <button className="ce-dim-chip-x" onClick={() => setFiltroVark("todos")}>✕</button>
                            </span>
                        </div>
                    )}
                    <div className="ce-dim-select-wrap">
                        <select
                            className="ce-dim-select"
                            value={filtroVark === "todos" ? "" : filtroVark}
                            onChange={e => setFiltroVark(e.target.value || "todos")}
                        >
                            <option value="">Todos los perfiles</option>
                            <option value="V">V · Visual</option>
                            <option value="A">A · Auditivo</option>
                            <option value="R">R · Lector</option>
                            <option value="K">K · Kinestésico</option>
                        </select>
                    </div>
                </div>

                <div className="ce-sidebar-divider" />

                {/* Filtro Dimensión — muestra TODAS las de la BD */}
                <div className="ce-sidebar-section">
                    <p className="ce-sidebar-label">
                        <IoLayersOutline size={11} /> Dimensión de hábito
                    </p>
                    {filtroDim && (
                        <div style={{ marginBottom: 8 }}>
                            <span className="ce-dim-chip-activo">
                                <IoLayersOutline size={11} /> {filtroDim}
                                <button className="ce-dim-chip-x" onClick={() => setFiltroDim("")}>✕</button>
                            </span>
                        </div>
                    )}
                    <div className="ce-dim-select-wrap">
                        <select
                            className="ce-dim-select"
                            value={filtroDim}
                            onChange={e => setFiltroDim(e.target.value)}
                        >
                            <option value="">Todas las dimensiones</option>
                            {todasDimensiones.map(d => (
                                <option key={d.id_dimension} value={d.nombre_dimension}>
                                    {d.nombre_dimension}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="ce-sidebar-divider" />

                {/* Stats */}
                <div className="ce-sidebar-section">
                    <p className="ce-sidebar-label">
                        <IoBarChartOutline size={11} /> Resumen
                    </p>
                    <div className="ce-sidebar-stats">
                        <div className="ce-sidebar-stat">
                            <span className="ce-sidebar-stat-num">{misCursos.length}</span>
                            <span className="ce-sidebar-stat-label">Inscritos</span>
                        </div>
                        <div className="ce-sidebar-stat">
                            <span className="ce-sidebar-stat-num">{cursos.length}</span>
                            <span className="ce-sidebar-stat-label">Disponibles</span>
                        </div>
                        <div className="ce-sidebar-stat">
                            <span className="ce-sidebar-stat-num">{progresoGeneral}%</span>
                            <span className="ce-sidebar-stat-label">Progreso</span>
                        </div>
                    </div>
                </div>

            </aside>

            {/* ══════════ CONTENIDO PRINCIPAL ══════════ */}
            <div className="ce-main">

                <div className="ce-header">
                    <div>
                        <h1 className="ce-header-title">
                            {tab === "recomendados" && <>Cursos <em>para ti</em></>}
                            {tab === "mis-cursos"   && <>Mis <em>cursos</em></>}
                            {tab === "archivados"   && <>Cursos <em>archivados</em></>}
                        </h1>
                        <p className="ce-header-subtitle">
                            {tab === "recomendados" && "Seleccionados según tu perfil de aprendizaje y hábitos a mejorar."}
                            {tab === "mis-cursos"   && "Cursos en los que estás inscrito actualmente."}
                            {tab === "archivados"   && "Cursos que pausaste. Puedes retomarlos cuando quieras."}
                        </p>
                    </div>
                    <div className="ce-search">
                        <IoSearchOutline size={14} />
                        <input
                            type="text"
                            placeholder="Buscar por título, tutor o dimensión..."
                            value={busqueda}
                            onChange={e => setBusqueda(e.target.value)}
                        />
                    </div>
                </div>

                {/* TAB: RECOMENDADOS */}
                {tab === "recomendados" && (
                    <>
                        {cursosFiltrados.length === 0 ? (
                            <EmptyState tab={tab} busqueda={busqueda} onVerRecomendados={() => setTab("recomendados")} />
                        ) : (
                            <>
                                {(exactosVark.length > 0 || exactosMetodo.length > 0) && (
                                    <div style={{ marginBottom: 8 }}>
                                        <span className="ce-group-badge ce-group-badge--exacto">
                                            <IoStarOutline size={12} /> Perfil exacto · {perfilVark}
                                        </span>
                                    </div>
                                )}
                                {exactosVark.length > 0 && (
                                    <SeccionCursos tipo="vark" cursos={exactosVark} inscritosIds={inscritosIds} misCursos={misCursos} irADetalle={irADetalle} />
                                )}
                                {exactosMetodo.length > 0 && (
                                    <SeccionCursos tipo="metodo" cursos={exactosMetodo} inscritosIds={inscritosIds} misCursos={misCursos} irADetalle={irADetalle} />
                                )}
                                {(afinesVark.length > 0 || afinesMetodo.length > 0) && (
                                    <div style={{ marginBottom: 8, marginTop: exactosVark.length + exactosMetodo.length > 0 ? 8 : 0 }}>
                                        <span className="ce-group-badge ce-group-badge--afin">
                                            <IoAnalyticsOutline size={12} /> También recomendados
                                        </span>
                                    </div>
                                )}
                                {afinesVark.length > 0 && (
                                    <SeccionCursos tipo="vark" cursos={afinesVark} inscritosIds={inscritosIds} misCursos={misCursos} irADetalle={irADetalle} />
                                )}
                                {afinesMetodo.length > 0 && (
                                    <SeccionCursos tipo="metodo" cursos={afinesMetodo} inscritosIds={inscritosIds} misCursos={misCursos} irADetalle={irADetalle} />
                                )}
                            </>
                        )}
                    </>
                )}

                {/* TAB: MIS CURSOS */}
                {tab === "mis-cursos" && (
                    <>
                        {cursosFiltrados.length === 0 ? (
                            <EmptyState tab={tab} busqueda={busqueda} onVerRecomendados={() => setTab("recomendados")} />
                        ) : (
                            <>
                                {misCursosVark.length > 0 && (
                                    <SeccionCursos tipo="vark" cursos={misCursosVark} inscritosIds={inscritosIds} misCursos={misCursos} irADetalle={irADetalle} />
                                )}
                                {misCursosMetodo.length > 0 && (
                                    <SeccionCursos tipo="metodo" cursos={misCursosMetodo} inscritosIds={inscritosIds} misCursos={misCursos} irADetalle={irADetalle} />
                                )}
                            </>
                        )}
                    </>
                )}

                {/* TAB: ARCHIVADOS */}
                {tab === "archivados" && (
                    <>
                        <div className="ce-arch-banner">
                            <IoArchiveOutline size={20} style={{ color: "var(--ce-sky)", flexShrink: 0 }} />
                            <p className="ce-arch-banner-text">
                                Los archivados <strong>no afectan tu progreso general</strong>.
                                Desarchiva cualquiera para retomarlo desde donde lo dejaste.
                            </p>
                        </div>

                        {filtroDim && (
                            <div style={{ marginBottom: 14 }}>
                                <span className="ce-dim-chip-activo">
                                    <IoLayersOutline size={11} /> {filtroDim}
                                    <button className="ce-dim-chip-x" onClick={() => setFiltroDim("")}>✕</button>
                                </span>
                            </div>
                        )}

                        <div className="ce-arch-toolbar">
                            {FILTROS_ARCH.map(f => (
                                <button
                                    key={f.key}
                                    className={`ce-arch-filter-btn ${filtroEstadoArch === f.key ? "ce-arch-filter-btn--active" : ""}`}
                                    onClick={() => setFiltroEstadoArch(f.key)}
                                >
                                    {f.label}
                                </button>
                            ))}
                            <select
                                className="ce-arch-sort"
                                value={ordenArch}
                                onChange={e => setOrdenArch(e.target.value)}
                            >
                                <option value="reciente">Más reciente</option>
                                <option value="mayor">Mayor progreso</option>
                                <option value="menor">Menor progreso</option>
                            </select>
                        </div>

                        {cursosFiltrados.length === 0 ? (
                            <EmptyState tab={tab} busqueda={busqueda} filtroDim={filtroDim} />
                        ) : (
                            <div className="ce-grid">
                                {cursosFiltrados.map(curso => (
                                    <CardArchivado
                                        key={curso.id_curso}
                                        curso={curso}
                                        onDeArchivar={() => desarchivar(curso.id_curso)}
                                        onVer={() => irADetalle(curso.id_curso)}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function EmptyState({ tab, busqueda, filtroDim, onVerRecomendados }) {
    return (
        <div className="ce-empty">
            {tab === "archivados"
                ? <IoArchiveOutline size={52} className="ce-empty-icon" />
                : <IoBookOutline size={52} className="ce-empty-icon" />
            }
            <h2 className="ce-empty-title">
                {tab === "mis-cursos"   && "Aún no tienes cursos"}
                {tab === "recomendados" && "No hay cursos disponibles"}
                {tab === "archivados"   && "Sin cursos archivados"}
            </h2>
            <p className="ce-empty-sub">
                {tab === "mis-cursos"   && "Explora los cursos recomendados e inscríbete para comenzar."}
                {tab === "recomendados" && (busqueda ? "Intenta con otro término de búsqueda." : "No encontramos cursos para tu perfil.")}
                {tab === "archivados"   && (busqueda || filtroDim ? "Intenta con otro filtro o término." : "Aún no has archivado ningún curso.")}
            </p>
            {tab === "mis-cursos" && onVerRecomendados && (
                <button className="ce-card-btn" onClick={onVerRecomendados}>
                    <IoBookOutline size={14} /> Ver recomendados
                </button>
            )}
        </div>
    );
}