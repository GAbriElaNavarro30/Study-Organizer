// src/hooks/useCursosT.js
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

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

    const totalPublicados = cursos.filter((c) => c.es_publicado && !c.archivado).length;
    const totalBorradores = cursos.filter((c) => !c.es_publicado && !c.archivado).length;
    const totalArchivados = cursos.filter((c) => c.archivado).length;

    // ── Handlers de filtros y paginación ──
    const handleBusqueda = (v) => { setBusqueda(v); setPagina(1); };
    const handlePorPagina = (n) => { setPorPagina(n); setPagina(1); };
    const handleFiltro = (k) => { setFiltroEstado(k); setPagina(1); };

    // ── Handlers de modales ──
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

    // ── Navegación ──
    const irACrear = () => navigate("/editor-curso");
    const irAEditar = (c) => navigate(`/editor-curso?id=${c.id_curso}`);
    const irAVistaPrevia = (c) => navigate(`/cursos-visor-tutor?id=${c.id_curso}`);

    return {
        // Estado
        cursos,
        cargando,
        error,
        busqueda,
        vista,
        porPagina,
        pagina,
        filtroEstado,
        modalPublicar,
        modalArchivar,
        modalEliminar,

        // Datos derivados
        filtrados,
        paginados,
        totalPaginas,
        desde,
        hasta,
        totalPublicados,
        totalBorradores,
        totalArchivados,

        // Setters simples
        setVista,
        setPagina,

        // Handlers
        handleBusqueda,
        handlePorPagina,
        handleFiltro,
        handleTogglePublish,
        handleArchivar,
        handleEliminar,
        handleConfirmPublicar,
        handleConfirmArchivar,
        handleConfirmarEliminar,

        // Navegación
        fetchCursos,
        irACrear,
        irAEditar,
        irAVistaPrevia,

        // Cerrar modales
        cerrarModalPublicar: () => setModalPublicar(null),
        cerrarModalArchivar: () => setModalArchivar(null),
        cerrarModalEliminar: () => setModalEliminar(null),
    };
}