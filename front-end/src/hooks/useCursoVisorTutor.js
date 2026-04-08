// src/hooks/useCursoVisorTutor.js
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";

const TABS = [
    { key: "contenido", label: "Contenido" },
    { key: "estudiantes", label: "Estudiantes" },
    { key: "resultados", label: "Resultados" },
];

export const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50, 100];

/* ── Hook principal: carga del curso y control de tabs ───── */
export function useCursoVisorTutor() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const id = searchParams.get("id");
    const tabParam = searchParams.get("tab");

    const [curso, setCurso] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [tabActiva, setTabActiva] = useState(
        TABS.find(t => t.key === tabParam)?.key || "contenido"
    );

    const cambiarTab = (key) => {
        setTabActiva(key);
        setSearchParams({ id, tab: key });
    };

    useEffect(() => {
        if (!id) {
            setError("No se especificó un curso.");
            setCargando(false);
            return;
        }
        (async () => {
            try {
                setCargando(true);
                const { data } = await api.get(`/cursos/cursos/${id}`);
                if (!data.ok) throw new Error(data.mensaje);
                setCurso(data.curso);
            } catch (err) {
                setError(err.response?.data?.mensaje || err.message);
            } finally {
                setCargando(false);
            }
        })();
    }, [id]);

    return {
        id,
        curso,
        cargando,
        error,
        tabActiva,
        cambiarTab,
        navigate,
    };
}

/* ── Hook: lógica del Tab Estudiantes ────────────────────── */
export function useTabEstudiantes(idCurso) {
    const [estudiantes, setEstudiantes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [modalEstudiante, setModalEstudiante] = useState(null);
    const [eliminando, setEliminando] = useState(false);
    const [alert, setAlert] = useState(null);

    const [busqueda, setBusqueda] = useState("");
    const [paginaActual, setPaginaActual] = useState(1);
    const [porPagina, setPorPagina] = useState(10);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get(`/cursos/cursos/${idCurso}/estudiantes`);
                setEstudiantes(data.estudiantes || []);
            } catch (err) {
                setError(err.response?.data?.mensaje || "No se pudieron cargar los estudiantes.");
            } finally {
                setCargando(false);
            }
        })();
    }, [idCurso]);

    useEffect(() => { setPaginaActual(1); }, [busqueda, porPagina]);

    const estudiantesFiltrados = useMemo(() => {
        const q = busqueda.trim().toLowerCase();
        if (!q) return estudiantes;
        return estudiantes.filter((e) => {
            const nombre = `${e.nombre || ""} ${e.apellido || ""}`.toLowerCase();
            const correo = (e.correo_electronico || "").toLowerCase();
            const tel = (e.telefono || "").toLowerCase();
            const fecha = e.fecha_inscripcion
                ? new Date(e.fecha_inscripcion).toLocaleString("es-MX", {
                    day: "2-digit", month: "short", year: "numeric",
                }).toLowerCase()
                : "";
            return nombre.includes(q) || correo.includes(q) || tel.includes(q) || fecha.includes(q);
        });
    }, [estudiantes, busqueda]);

    const totalPaginas = Math.max(1, Math.ceil(estudiantesFiltrados.length / porPagina));
    const paginaSegura = Math.min(paginaActual, totalPaginas);
    const inicio = (paginaSegura - 1) * porPagina;
    const estudiantesPagina = estudiantesFiltrados.slice(inicio, inicio + porPagina);

    const handleEliminar = async () => {
        if (!modalEstudiante || eliminando) return;
        setEliminando(true);
        try {
            await api.delete(`/cursos/cursos/${idCurso}/estudiantes/${modalEstudiante.id_usuario}`);
            setEstudiantes(prev => prev.filter(e => e.id_usuario !== modalEstudiante.id_usuario));
            setModalEstudiante(null);
            setAlert({
                type: "success",
                title: "¡Estudiante eliminado!",
                message: `${modalEstudiante.nombre} ha sido eliminado exitosamente del curso.`
            });
        } catch (err) {
            setAlert({
                type: "error",
                title: "Error",
                message: err.response?.data?.mensaje || "No se pudo eliminar al estudiante."
            });
        } finally {
            setEliminando(false);
        }
    };

    const formatFecha = (fecha) =>
        fecha
            ? new Date(fecha).toLocaleString("es-MX", {
                day: "2-digit", month: "short", year: "numeric",
                hour: "2-digit", minute: "2-digit", hour12: true,
            })
            : "—";

    const getInitials = (nombre, apellido) =>
        `${(nombre || "").charAt(0)}${(apellido || "").charAt(0)}`.toUpperCase();

    return {
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
    };
}

/* ── Hook: lógica del Tab Resultados ─────────────────────── */
export function useTabResultados(idCurso) {
    const navigate = useNavigate();
    const [resultados, setResultados] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get(`/cursos/cursos/${idCurso}/resultados`);
                setResultados(data.resultados || []);
            } catch (err) {
                setError(err.response?.data?.mensaje || "No se pudieron cargar los resultados.");
            } finally {
                setCargando(false);
            }
        })();
    }, [idCurso]);

    const promedio = resultados.length
        ? resultados.reduce((s, r) => s + Number(r.puntaje || 0), 0) / resultados.length
        : 0;

    const puntajeMaximo = resultados.length
        ? Math.max(...resultados.map(r => Number(r.puntaje || 0)))
        : 0;

    const navegarAHistorial = (r, curso) => {
        navigate("/historial-resultados-estudiante", {
            state: {
                idCurso,
                idUsuario: r.id_usuario,
                nombreCurso: curso?.titulo,
            },
        });
    };

    return {
        resultados,
        cargando,
        error,
        promedio,
        puntajeMaximo,
        navegarAHistorial,
    };
}