// src/hooks/useCursosT.js
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

// Todos los perfiles VARK posibles del sistema (fuente de verdad estática)
const TODOS_PERFILES_VARK = ["V", "A", "R", "K", "VA", "VR", "VK", "AR", "AK", "RK", "VAR", "VAK", "VRK", "ARK", "VARK"];

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

    // ── Alert de éxito ──────────────────────────────────────
    const [alert, setAlert] = useState(null); // { title, message } | null
    const cerrarAlert = () => setAlert(null);
    // ───────────────────────────────────────────────────────

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

    // Carga todas las dimensiones del sistema (endpoint ya existente)
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
    }, []);

    // varkDisponibles → los 15 perfiles siempre disponibles
    const varkDisponibles = TODOS_PERFILES_VARK;

    // dimensionesDisponibles → todas las del sistema;
    // si el fetch falló, se degrada a las que tienen los cursos del tutor
    const dimensionesDisponibles = useMemo(() => {
        if (todasLasDimensiones.length > 0) {
            return todasLasDimensiones.map((d) => d.nombre_dimension).sort();
        }
        const set = new Set(cursos.map((c) => c.nombre_dimension).filter(Boolean));
        return Array.from(set).sort();
    }, [todasLasDimensiones, cursos]);

    // ── Filtrado principal ───────────────────────────────────
    const filtrados = useMemo(() => {
        const q = busqueda.toLowerCase();
        return cursos.filter((c) => {
            const okBusqueda =
                c.titulo.toLowerCase().includes(q) ||
                c.descripcion?.toLowerCase().includes(q) ||
                c.perfil_vark?.toLowerCase().includes(q);

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

    // ── Handlers filtros y paginación ───────────────────────
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

    // ── Handlers modales ────────────────────────────────────
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
        // Capturamos los datos ANTES de limpiar el modal para no perderlos
        const { id_curso, titulo } = modalEliminar;
        setModalEliminar(null);

        try {
            await api.delete(`/cursos/cursos/${id_curso}`);
            await fetchCursos();
            // ── Disparar alert de éxito ─────────────────────
            setAlert({
                title: "Curso eliminado",
                message: `"${titulo}" se eliminó correctamente.`,
            });
        } catch (err) {
            console.error("Error al eliminar:", err.response?.data);
        }
    };

    // ── Navegación ──────────────────────────────────────────
    const irACrear = () => navigate("/editor-curso");
    const irAEditar = (c) => navigate(`/editor-curso?id=${c.id_curso}`);
    const irAVistaPrevia = (c) => navigate(`/cursos-visor-tutor?id=${c.id_curso}`);

    return {
        // Estado
        cursos, cargando, error, busqueda, vista, porPagina, pagina,
        filtroEstado, filtroVark, filtroDimension,
        modalPublicar, modalArchivar, modalEliminar,
        alert, cerrarAlert,                          // ← alert expuesto

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