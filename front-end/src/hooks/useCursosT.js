// src/hooks/useCursosT.js
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

/* ─────────────────────────────────────────────────────────
   CONSTANTES
───────────────────────────────────────────────────────── */
export const VARK_COLORS = {
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
    VAK: { bg: "#F5F3FF", text: "#5B21B6", label: "Visual-Auditivo-Kinestésico" },
    VRK: { bg: "#ECFEFF", text: "#155E75", label: "Visual-Lectura-Kinestésico" },
    ARK: { bg: "#FFF7ED", text: "#9A3412", label: "Auditivo-Lectura-Kinestésico" },
    VARK: { bg: "#F0F9FF", text: "#0369A1", label: "Multimodal" },
};

export const FILTROS = [
    { key: "todos", label: "Todos", dot: "#94A3B8" },
    { key: "publicado", label: "Publicados", dot: "#059669" },
    { key: "borrador", label: "Borradores", dot: "#94A3B8" },
    { key: "archivado", label: "Archivados", dot: "#7C3AED" },
];

export const PLACEHOLDER_PALETTES = [
    { bg: "#DBEAFE", text: "#1E40AF" },
    { bg: "#D1FAE5", text: "#065F46" },
    { bg: "#FCE7F3", text: "#9D174D" },
    { bg: "#EDE9FE", text: "#5B21B6" },
    { bg: "#FEF3C7", text: "#92400E" },
    { bg: "#CFFAFE", text: "#155E75" },
    { bg: "#FFE4E6", text: "#9F1239" },
    { bg: "#DCFCE7", text: "#14532D" },
];

// Fuente de verdad única para todos los perfiles VARK
const TODOS_PERFILES_VARK = Object.keys(VARK_COLORS);

/* ─────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────── */
export const fmtDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("es-MX", {
        day: "2-digit", month: "short", year: "numeric",
    });
};

export const getPlaceholderPalette = (titulo = "") => {
    const idx = (titulo.charCodeAt(0) || 65) % PLACEHOLDER_PALETTES.length;
    return PLACEHOLDER_PALETTES[idx];
};

/* ─────────────────────────────────────────────────────────
   HOOK
───────────────────────────────────────────────────────── */
export function useCursosT() {
    const navigate = useNavigate();

    const [cursos, setCursos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [vista, setVista] = useState("mosaic");
    const [porPagina, setPorPagina] = useState(8);
    const [pagina, setPagina] = useState(1);
    const [filtroEstado, setFiltroEstado] = useState("todos");
    const [filtroVark, setFiltroVark] = useState(null);
    const [filtroDimension, setFiltroDimension] = useState(null);
    const [todasLasDimensiones, setTodasLasDimensiones] = useState([]);
    const [modalPublicar, setModalPublicar] = useState(null);
    const [modalArchivar, setModalArchivar] = useState(null);
    const [modalEliminar, setModalEliminar] = useState(null);
    const [alert, setAlert] = useState(null);

    const cerrarAlert = () => setAlert(null);

    /* ── Fetch ──────────────────────────────────────────── */
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

    const fetchDimensiones = async () => {
        try {
            const { data } = await api.get("/cursos/dimensiones");
            setTodasLasDimensiones(data.dimensiones || []);
        } catch (err) {
            console.warn("No se pudieron cargar las dimensiones del sistema:", err);
        }
    };

    useEffect(() => {
        fetchCursos();
        fetchDimensiones();

        const params = new URLSearchParams(window.location.search);
        if (params.get("actualizado") === "1") {
            setAlert({
                title: "Curso actualizado",
                message: "Los cambios se guardaron correctamente.",
            });
            window.history.replaceState({}, "", window.location.pathname);
        }
    }, []);

    /* ── Datos derivados ────────────────────────────────── */
    const varkDisponibles = TODOS_PERFILES_VARK;

    const dimensionesDisponibles = useMemo(() => {
        if (todasLasDimensiones.length > 0) {
            return todasLasDimensiones.map((d) => d.nombre_dimension).sort();
        }
        const set = new Set(cursos.map((c) => c.nombre_dimension).filter(Boolean));
        return Array.from(set).sort();
    }, [todasLasDimensiones, cursos]);

    const filtrados = useMemo(() => {
        const q = busqueda.toLowerCase();
        return cursos.filter((c) => {
            const okBusqueda =
                c.titulo.toLowerCase().includes(q)
                //|| c.descripcion?.toLowerCase().includes(q)
                //|| c.perfil_vark?.toLowerCase().includes(q)
                ;

            const okEstado =
                filtroEstado === "todos" ? !c.archivado :
                    filtroEstado === "publicado" ? (c.es_publicado && !c.archivado) :
                        filtroEstado === "borrador" ? (!c.es_publicado && !c.archivado) :
                            filtroEstado === "archivado" ? c.archivado : true;

            const okVark = !filtroVark || c.perfil_vark === filtroVark;
            const okDimension = !filtroDimension || c.nombre_dimension === filtroDimension;

            return okBusqueda && okEstado && okVark && okDimension;
        });
    }, [cursos, busqueda, filtroEstado, filtroVark, filtroDimension]);

    const totalPaginas = Math.max(1, Math.ceil(filtrados.length / porPagina));
    const paginados = filtrados.slice((pagina - 1) * porPagina, pagina * porPagina);
    const desde = filtrados.length === 0 ? 0 : (pagina - 1) * porPagina + 1;
    const hasta = Math.min(pagina * porPagina, filtrados.length);

    const totalPublicados = cursos.filter((c) => c.es_publicado && !c.archivado).length;
    const totalBorradores = cursos.filter((c) => !c.es_publicado && !c.archivado).length;
    const totalArchivados = cursos.filter((c) => c.archivado).length;

    /* ── Handlers filtros y paginación ─────────────────── */
    const handleBusqueda = (v) => { setBusqueda(v); setPagina(1); };
    const handlePorPagina = (n) => { setPorPagina(n); setPagina(1); };
    const handleFiltro = (k) => { setFiltroEstado(k); setPagina(1); };
    const handleFiltroVark = (v) => { setFiltroVark(v); setPagina(1); };
    const handleFiltroDim = (v) => { setFiltroDimension(v); setPagina(1); };

    const limpiarFiltrosExtra = () => {
        setFiltroVark(null);
        setFiltroDimension(null);
        setPagina(1);
    };

    /* ── Handlers modales ───────────────────────────────── */
    const handleTogglePublish = (curso) => setModalPublicar(curso);
    const handleArchivar = (curso) => setModalArchivar(curso);
    const handleEliminar = (curso) => setModalEliminar(curso);

    const handleConfirmPublicar = async () => {
        const { id_curso, titulo, es_publicado } = modalPublicar;
        setModalPublicar(null);
        try {
            await api.patch(`/cursos/cursos/${id_curso}/publicar`);
            await fetchCursos();
            setAlert({
                title: es_publicado ? "Curso despublicado" : "Curso publicado",
                message: es_publicado
                    ? `"${titulo}" volvió a estado borrador.`
                    : `"${titulo}" ahora está visible para los estudiantes.`,
            });
        } catch (err) {
            console.error("Error al cambiar publicación:", err.response?.data);
        }
    };

    const handleConfirmArchivar = async () => {
        const { id_curso, titulo, archivado } = modalArchivar;
        setModalArchivar(null);
        try {
            const { data } = await api.patch(`/cursos/cursos/${id_curso}/archivar`);
            await fetchCursos();
            setAlert(
                !archivado
                    ? { title: "Curso archivado", message: `"${titulo}" fue archivado correctamente.` }
                    : { title: "Curso desarchivado", message: `"${titulo}" fue desarchivado${data.es_publicado ? " y volvió a estar publicado" : ""}.` }
            );
        } catch (err) {
            console.error("Error al archivar:", err.response?.data);
        }
    };
    
    const handleConfirmarEliminar = async () => {
        const { id_curso, titulo } = modalEliminar;
        setModalEliminar(null);
        try {
            await api.delete(`/cursos/cursos/${id_curso}`);
            await fetchCursos();
            setAlert({
                title: "Curso eliminado",
                message: `"${titulo}" se eliminó correctamente.`,
            });
        } catch (err) {
            console.error("Error al eliminar:", err.response?.data);
        }
    };

    /* ── Navegación ─────────────────────────────────────── */
    const irACrear = () => navigate("/editor-curso");
    const irAEditar = (c) => navigate(`/editor-curso?id=${c.id_curso}`);
    const irAVistaPrevia = (c) => navigate(`/cursos-visor-tutor?id=${c.id_curso}`);

    return {
        // Estado
        cursos, cargando, error, busqueda, vista, porPagina, pagina,
        filtroEstado, filtroVark, filtroDimension,
        modalPublicar, modalArchivar, modalEliminar,
        alert, cerrarAlert,

        // Datos derivados
        filtrados, paginados, totalPaginas, desde, hasta,
        totalPublicados, totalBorradores, totalArchivados,
        varkDisponibles, dimensionesDisponibles,

        // Setters simples
        setVista, setPagina,

        // Handlers
        handleBusqueda, handlePorPagina, handleFiltro,
        handleFiltroVark, handleFiltroDim, limpiarFiltrosExtra,
        handleTogglePublish, handleArchivar, handleEliminar,
        handleConfirmPublicar, handleConfirmArchivar, handleConfirmarEliminar,

        // Navegación
        fetchCursos, irACrear, irAEditar, irAVistaPrevia,

        // Cerrar modales
        cerrarModalPublicar: () => setModalPublicar(null),
        cerrarModalArchivar: () => setModalArchivar(null),
        cerrarModalEliminar: () => setModalEliminar(null),
    };
}