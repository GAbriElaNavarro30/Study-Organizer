import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

export function useDashboardTutor(tutor, estadisticas) {
    const [animado, setAnimado] = useState(false);
    const [fotoError, setFotoError] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setAnimado(true), 100);
        return () => clearTimeout(t);
    }, []);

    const { usuario: usuarioCtx } = useContext(AuthContext);
    const usuario = tutor || {
        nombre: usuarioCtx?.nombre || "",
        apellido: usuarioCtx?.apellido || "",
        foto_perfil: usuarioCtx?.foto_perfil || null,
        descripcion: usuarioCtx?.descripcion || "",
        rol: usuarioCtx?.rol_texto || "Tutor",
    };

    useEffect(() => { setFotoError(false); }, [usuario.foto_perfil]);

    // ── Stats principales ──────────────────────────────────────
    const [statsReales, setStatsReales] = useState(null);

    useEffect(() => {
        api.get("/cursos/estadisticas-tutor")
            .then(res => setStatsReales({
                total_cursos: res.data.total_cursos,
                cursos_publicados: res.data.cursos_publicados,
                cursos_archivados: res.data.cursos_archivados,
                total_estudiantes: res.data.total_estudiantes,
                vark: res.data.vark || [],
                dimensiones: res.data.dimensiones || [],
                inscripciones_mes: res.data.inscripciones_mes || [],
                promedios_cursos: res.data.promedios_cursos || [],
                distribucion_niveles: res.data.distribucion_niveles || [],
                finalizacion_cursos: res.data.finalizacion_cursos || [],
                actividad_reciente: res.data.actividad_reciente || [],
                cursos_tutor: res.data.cursos_tutor || [],
            }))
            .catch(err => console.error("Error stats tutor:", err));
    }, []);

    const stats = statsReales || estadisticas || {
        total_cursos: 0, cursos_publicados: 0, cursos_archivados: 0,
        total_estudiantes: 0, vark: [], dimensiones: [],
        inscripciones_mes: [], promedios_cursos: [],
        distribucion_niveles: [], finalizacion_cursos: [],
        actividad_reciente: [], cursos_tutor: [],
    };

    // ── Filtro de niveles por curso ────────────────────────────
    // ── Filtro de niveles ──────────────────────────────────────
    const [cursoFiltroNivel, setCursoFiltroNivel] = useState("todos");
    const [mesFiltroNivel, setMesFiltroNivel] = useState("todos");
    const [anioFiltroNivel, setAnioFiltroNivel] = useState("todos");
    const [nivelesFiltrados, setNivelesFiltrados] = useState(null);
    const [cargandoNiveles, setCargandoNiveles] = useState(false);

    // Años disponibles: desde 2023 hasta el año actual
    const aniosDisponibles = Array.from(
        { length: new Date().getFullYear() - 2022 },
        (_, i) => 2023 + i
    );

    const mesesDisponibles = [
        { valor: "1", label: "Enero" },
        { valor: "2", label: "Febrero" },
        { valor: "3", label: "Marzo" },
        { valor: "4", label: "Abril" },
        { valor: "5", label: "Mayo" },
        { valor: "6", label: "Junio" },
        { valor: "7", label: "Julio" },
        { valor: "8", label: "Agosto" },
        { valor: "9", label: "Septiembre" },
        { valor: "10", label: "Octubre" },
        { valor: "11", label: "Noviembre" },
        { valor: "12", label: "Diciembre" },
    ];

    useEffect(() => {
        // Si no hay ningún filtro activo, usa los datos globales
        const sinFiltro = cursoFiltroNivel === "todos"
            && mesFiltroNivel === "todos"
            && anioFiltroNivel === "todos";

        if (sinFiltro) {
            setNivelesFiltrados(null);
            return;
        }

        setCargandoNiveles(true);

        const params = new URLSearchParams({ id_curso: cursoFiltroNivel });
        if (anioFiltroNivel !== "todos") params.append("anio", anioFiltroNivel);
        if (mesFiltroNivel !== "todos") params.append("mes", mesFiltroNivel);

        api.get(`/cursos/estadisticas-tutor/niveles?${params.toString()}`)
            .then(res => setNivelesFiltrados(res.data.distribucion_niveles || []))
            .catch(err => console.error("Error filtro niveles:", err))
            .finally(() => setCargandoNiveles(false));

    }, [cursoFiltroNivel, mesFiltroNivel, anioFiltroNivel]);

    const dataNiveles = nivelesFiltrados ?? stats.distribucion_niveles;

    // ── Métricas derivadas ─────────────────────────────────────
    const promedio_general = stats.promedios_cursos.length
        ? (stats.promedios_cursos.reduce((s, c) => s + Number(c.promedio), 0) / stats.promedios_cursos.length).toFixed(1)
        : 0;

    const mejor_curso = stats.promedios_cursos.reduce(
        (best, c) => (Number(c.promedio) > Number(best?.promedio || 0) ? c : best), null
    );

    const tasa_global = stats.finalizacion_cursos.length
        ? Math.round(
            stats.finalizacion_cursos.reduce((s, c) => s + Number(c.completados), 0) * 100 /
            Math.max(stats.finalizacion_cursos.reduce((s, c) => s + Number(c.inscritos), 0), 1)
        )
        : 0;

    const initials = `${usuario.nombre?.[0] || ""}${usuario.apellido?.[0] || ""}`.toUpperCase();
    const mostrarFoto = usuario.foto_perfil
        && !usuario.foto_perfil.includes("perfil-usuario.png")
        && !fotoError;

    return {
        // UI state
        animado,
        fotoError,
        setFotoError,
        // Usuario
        usuario,
        initials,
        mostrarFoto,
        // Stats
        stats,
        // Niveles
        cursoFiltroNivel, setCursoFiltroNivel,
        mesFiltroNivel, setMesFiltroNivel,
        anioFiltroNivel, setAnioFiltroNivel,
        mesesDisponibles,
        aniosDisponibles,
        dataNiveles,
        cargandoNiveles,
        // Métricas derivadas
        promedio_general,
        mejor_curso,
        tasa_global,
    };
}