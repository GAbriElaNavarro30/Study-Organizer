// src/pages/Cursos/CursosE.jsx
import {
    IoSearchOutline, IoBookOutline, IoPersonOutline,
    IoLayersOutline, IoFilterOutline,
    IoCheckmarkCircleOutline, IoPlayCircleOutline,
    IoSchoolOutline, IoAnalyticsOutline,
    IoGridOutline,
    IoMenuOutline, IoCloseOutline,
} from "react-icons/io5";
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
    const esDimension = !!curso.nombre_dimension;

    return (
        <div className={`ce-card ${esDimension ? "ce-card--dimension" : "ce-card--vark"}`} onClick={onClick}>
            <div className="ce-card-cover">
                {curso.foto
                    ? <img src={curso.foto} alt={curso.titulo} />
                    : (
                        <div className="ce-card-cover-placeholder"
                            style={{ background: `hsl(${hue},35%,88%)`, color: `hsl(${hue},40%,38%)` }}>
                            {curso.titulo?.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()}
                        </div>
                    )
                }
                <span className={`ce-card-tipo-badge ${esDimension ? "ce-card-tipo-badge--dim" : "ce-card-tipo-badge--vark"}`}>
                    {esDimension ? "📚 Hábitos" : "🧠 Aprendizaje"}
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
                            <IoPersonOutline size={12} /> {curso.nombre_tutor}
                        </span>
                    )}
                    {curso.total_secciones > 0 && (
                        <span className="ce-card-meta-item">
                            <IoLayersOutline size={12} />
                            {curso.total_secciones} sección{curso.total_secciones !== 1 ? "es" : ""}
                        </span>
                    )}
                    {esDimension && <span className="ce-card-dim">{curso.nombre_dimension}</span>}
                </div>
                <div className="ce-card-footer">
                    {inscrito
                        ? <span className="ce-card-pct">{pct}% completado</span>
                        : <span style={{ fontSize: 12, color: "var(--ce-ink-faint)" }}>Sin inscripción</span>
                    }
                    <button className={`ce-card-btn ${inscrito ? "" : "ce-card-btn--outline"}`}>
                        {!inscrito
                            ? <><IoBookOutline size={14} /> Ver curso</>
                            : progreso?.completado
                                ? <><IoSchoolOutline size={14} /> Volver a tomar</>
                                : pct > 0
                                    ? <><IoPlayCircleOutline size={14} /> Continuar</>
                                    : <><IoPlayCircleOutline size={14} /> Iniciar</>
                        }
                    </button>
                </div>
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
        nombrePerfil, perfilVark, letrasVark,
        irADetalle,
    } = useCursosE();

    if (cargando) return <LoadingState />;

    const progresoGeneral = misCursos.length > 0
        ? Math.round(misCursos.reduce((acc, c) => {
            const pct = Math.round(((c.contenidos_vistos || 0) / Math.max(c.total_contenidos || 1, 1)) * 100);
            return acc + pct;
        }, 0) / misCursos.length)
        : 0;

    return (
        <div className={`ce-app ${animado ? "ce-animated" : ""}`}>

            {/* ── BARRA MÓVIL ── */}
            <div className="ce-mobile-bar">
                <span className="ce-mobile-bar-title">
                    {tab === "recomendados" ? "Recomendados" : "Mis cursos"}
                </span>
                <button
                    className="ce-mobile-toggle"
                    onClick={() => setSidebarAbierto(v => !v)}
                >
                    {sidebarAbierto
                        ? <><IoCloseOutline size={15} /> Cerrar</>
                        : <><IoMenuOutline size={15} /> Filtros y perfil</>
                    }
                </button>
            </div>

            {/* ── SIDEBAR ── */}
            <aside className={`ce-sidebar ${sidebarAbierto ? "ce-sidebar--open" : ""}`}>

                {/* Perfil VARK */}
                <div className="ce-sidebar-section">
                    <p className="ce-sidebar-label">Tu perfil</p>
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

                {/* Navegación tabs */}
                <div className="ce-sidebar-section">
                    <p className="ce-sidebar-label">Cursos</p>
                    <nav className="ce-sidebar-nav">
                        <button
                            className={`ce-sidebar-nav-item ${tab === "recomendados" ? "ce-sidebar-nav-item--active" : ""}`}
                            onClick={() => setTab("recomendados")}
                        >
                            <IoGridOutline size={16} />
                            <span>Recomendados</span>
                            <span className="ce-sidebar-count">{cursos.length}</span>
                        </button>
                        <button
                            className={`ce-sidebar-nav-item ${tab === "mis-cursos" ? "ce-sidebar-nav-item--active" : ""}`}
                            onClick={() => setTab("mis-cursos")}
                        >
                            <IoSchoolOutline size={16} />
                            <span>Mis cursos</span>
                            <span className="ce-sidebar-count">{misCursos.length}</span>
                        </button>
                    </nav>
                </div>

                <div className="ce-sidebar-divider" />

                {/* Filtro VARK */}
                <div className="ce-sidebar-section">
                    <p className="ce-sidebar-label"><IoFilterOutline size={12} /> Filtrar por perfil</p>
                    <div className="ce-sidebar-filters">
                        {["todos", "V", "A", "R", "K"].map(v => (
                            <button
                                key={v}
                                className={`ce-sidebar-filter-btn ${filtroVark === v ? "ce-sidebar-filter-btn--active" : ""}`}
                                style={filtroVark === v && v !== "todos" ? { background: VARK_COLORS[v], color: "#fff", borderColor: VARK_COLORS[v] } : {}}
                                onClick={() => setFiltroVark(v)}
                            >
                                {v === "todos" ? "Todos" : `${v} · ${VARK_LABELS[v]}`}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="ce-sidebar-divider" />

                {/* Stats */}
                <div className="ce-sidebar-section">
                    <p className="ce-sidebar-label"><IoAnalyticsOutline size={12} /> Resumen</p>
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

            {/* ── CONTENIDO PRINCIPAL ── */}
            <div className="ce-main">

                {/* Header */}
                <div className="ce-header">
                    <div>
                        <h1 className="ce-header-title">
                            {tab === "recomendados" ? <>Cursos <em>para ti</em></> : <>Mis <em>cursos</em></>}
                        </h1>
                        <p className="ce-header-subtitle">
                            {tab === "recomendados"
                                ? "Seleccionados según tu perfil de aprendizaje y hábitos que debes mejorar."
                                : "Cursos en los que estás inscrito."
                            }
                        </p>
                    </div>

                    {/* Búsqueda */}
                    <div className="ce-search">
                        <IoSearchOutline size={15} />
                        <input
                            type="text"
                            placeholder="Buscar por título, tutor o dimensión..."
                            value={busqueda}
                            onChange={e => setBusqueda(e.target.value)}
                        />
                    </div>
                </div>

                {/* Grid */}
                {cursosFiltrados.length === 0 ? (
                    <div className="ce-empty">
                        <IoBookOutline size={52} className="ce-empty-icon" />
                        <h2 className="ce-empty-title">
                            {tab === "mis-cursos" ? "Aún no tienes cursos" : "No hay cursos disponibles"}
                        </h2>
                        <p className="ce-empty-sub">
                            {tab === "mis-cursos"
                                ? "Explora los cursos recomendados e inscríbete."
                                : busqueda ? "Intenta con otro término." : "No encontramos cursos para tu perfil."
                            }
                        </p>
                        {tab === "mis-cursos" && (
                            <button className="ce-card-btn" onClick={() => setTab("recomendados")}>
                                <IoBookOutline size={14} /> Ver recomendados
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* ── Cursos de perfil exacto ── */}
                        {tab === "recomendados" && cursosFiltrados.filter(c => c.prioridad === 0).length > 0 && (
                            <>
                                <div className="ce-group-header">
                                    <span className="ce-group-badge ce-group-badge--exacto">
                                        ⭐ Perfil exacto · {perfilVark}
                                    </span>
                                    <p className="ce-group-desc">
                                        Estos cursos están diseñados específicamente para tu perfil de aprendizaje.
                                    </p>
                                </div>
                                <div className="ce-grid">
                                    {cursosFiltrados.filter(c => c.prioridad === 0).map(curso => {
                                        const inscrito = inscritosIds.has(curso.id_curso);
                                        const miCurso = misCursos.find(c => c.id_curso === curso.id_curso);
                                        const pct = miCurso
                                            ? Math.round(((miCurso.contenidos_vistos || 0) / Math.max(miCurso.total_contenidos || 1, 1)) * 100)
                                            : 0;
                                        return (
                                            <CursoCard key={curso.id_curso} curso={curso}
                                                inscrito={inscrito}
                                                progreso={inscrito ? { porcentaje: pct, completado: !!miCurso?.completado } : null}
                                                onClick={() => irADetalle(curso.id_curso)} />
                                        );
                                    })}
                                </div>
                            </>
                        )}

                        {/* ── Cursos afines ── */}
                        {tab === "recomendados" && cursosFiltrados.filter(c => c.prioridad === 1).length > 0 && (
                            <>
                                <div className="ce-group-header" style={{ marginTop: 36 }}>
                                    <span className="ce-group-badge ce-group-badge--afin">
                                        🔗 También recomendados
                                    </span>
                                    <p className="ce-group-desc">
                                        Comparten elementos de tu estilo de aprendizaje.
                                    </p>
                                </div>
                                <div className="ce-grid">
                                    {cursosFiltrados.filter(c => c.prioridad === 1).map(curso => {
                                        const inscrito = inscritosIds.has(curso.id_curso);
                                        const miCurso = misCursos.find(c => c.id_curso === curso.id_curso);
                                        const pct = miCurso
                                            ? Math.round(((miCurso.contenidos_vistos || 0) / Math.max(miCurso.total_contenidos || 1, 1)) * 100)
                                            : 0;
                                        return (
                                            <CursoCard key={curso.id_curso} curso={curso}
                                                inscrito={inscrito}
                                                progreso={inscrito ? { porcentaje: pct, completado: !!miCurso?.completado } : null}
                                                onClick={() => irADetalle(curso.id_curso)} />
                                        );
                                    })}
                                </div>
                            </>
                        )}

                        {/* ── Mis cursos (sin separador) ── */}
                        {tab === "mis-cursos" && (
                            <div className="ce-grid">
                                {cursosFiltrados.map(curso => {
                                    const inscrito = inscritosIds.has(curso.id_curso);
                                    const miCurso = misCursos.find(c => c.id_curso === curso.id_curso);
                                    const pct = miCurso
                                        ? Math.round(((miCurso.contenidos_vistos || 0) / Math.max(miCurso.total_contenidos || 1, 1)) * 100)
                                        : 0;
                                    return (
                                        <CursoCard key={curso.id_curso} curso={curso}
                                            inscrito={inscrito}
                                            progreso={inscrito ? { porcentaje: pct, completado: !!miCurso?.completado } : null}
                                            onClick={() => irADetalle(curso.id_curso)} />
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}