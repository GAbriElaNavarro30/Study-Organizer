// src/hooks/useCursosE.js
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";

const VARK_LABELS = { V: "Visual", A: "Auditivo", R: "Lector / Escritor", K: "Kinestésico" };

export function useCursosE() {
    const navigate = useNavigate();

    const [cursos, setCursos] = useState([]);
    const [misCursos, setMisCursos] = useState([]);
    const [cursosArchivados, setCursosArchivados] = useState([]);
    const [todasDimensiones, setTodasDimensiones] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [animado, setAnimado] = useState(false);
    const [tab, setTab] = useState("recomendados");
    const [busqueda, setBusqueda] = useState("");
    const [filtroVark, setFiltroVark] = useState("todos");
    const [perfilVark, setPerfilVark] = useState("");
    const [filtroDim, setFiltroDim] = useState("");
    const [filtroEstadoArch, setFiltroEstadoArch] = useState("todos");
    const [ordenArch, setOrdenArch] = useState("reciente");

    useEffect(() => {
        cargarDatos();
    }, []);

    /* ── Helper: concatena nombre + apellido sin importar cuántos campos vengan ──
       Cubre 3 casos:
         1. El backend ya manda el nombre completo en nombre_tutor (apellido_tutor undefined)
         2. El backend manda nombre y apellido separados
         3. El apellido ya está incluido dentro de nombre_tutor (evita duplicarlo)
    ── */
    // useCursosE.js — reemplaza normalizarTutor
    const normalizarTutor = (c) => {
        const nombre = (c.nombre_tutor || "").trim();
        const apellido = (c.apellido_tutor || "").trim();

        if (!nombre) return null;

        // Si hay apellido separado y no está ya incluido en nombre, concatenar
        if (apellido && !nombre.includes(apellido)) {
            return `${nombre} ${apellido}`.trim();
        }

        // nombre ya viene completo (ej: "Juan García" de CONCAT_WS)
        return nombre;
    };

    /* ── Helper: calcula porcentaje y normaliza un curso inscrito ── */
    const normalizarCurso = (c) => {
        const vistos = c.contenidos_vistos ?? 0;
        const total = c.total_contenidos ?? 0;
        const porcentaje = total > 0 ? Math.round((vistos / total) * 100) : 0;
        return {
            ...c,
            porcentaje,
            completado: Boolean(c.completado),
        };
    };

    const cargarDatos = async () => {
        setCargando(true);
        try {
            const [
                { data: perfilData },
                { data: misData },
                { data: dimsData },
            ] = await Promise.all([
                api.get("/estilosaprendizaje/resultado-guardado"),
                api.get("/cursos/inscripciones/mis-cursos"),
                api.get("/cursos/dimensiones"),
            ]);

            const perfil = perfilData?.perfil_dominante || "VARK";
            setPerfilVark(perfil);
            setTodasDimensiones(dimsData.dimensiones || []);

            const cursosVark = (perfilData.cursos_recomendados || []).map(c => ({
                ...c,
                nombre_tutor: normalizarTutor(c),
                prioridad: c.perfil_vark === perfil ? 0 : 1,
            }));

            console.log("RAW cursos_recomendados:", perfilData.cursos_recomendados?.slice(0, 2));
            console.log("DESPUÉS de normalizarTutor:", cursosVark.slice(0, 2).map(c => c.nombre_tutor));

            let cursosDimension = [];
            try {
                const { data: historialData } = await api.get("/metodosestudio/historial");
                const historial = historialData.historial || [];
                if (historial.length > 0) {
                    const { data: resultadoME } = await api.get(
                        `/metodosestudio/resultado/${historial[0].id_intento}`
                    );
                    const idsVark = new Set(cursosVark.map(c => c.id_curso));
                    cursosDimension = (resultadoME.cursos_recomendados || [])
                        .filter(c => !idsVark.has(c.id_curso))
                        .map(c => ({
                            ...c,
                            nombre_tutor: normalizarTutor(c),
                            prioridad: c.prioridad ?? 1,
                        }));
                }
            } catch (e) {
                console.info("Sin historial de métodos de estudio:", e?.response?.status);
            }

            setCursos([...cursosVark, ...cursosDimension]);

            console.log("perfilData completo:", perfilData);
            console.log("cursosDimension:", cursosDimension);
            console.log("cursos final:", [...cursosVark, ...cursosDimension]);

            console.log("curso RAW de dimensión:", cursosDimension[0]);

            // ── DEBUG: ver exactamente qué manda el backend para mis-cursos ──
            const rawCursos = misData.cursos || [];
            if (rawCursos.length > 0) {

            }

            setMisCursos(rawCursos.map(c => ({
                ...normalizarCurso(c),
                nombre_tutor: normalizarTutor(c),
            })));

            const archivados = (misData.archivados || []).map(c => ({
                ...normalizarCurso(c),
                nombre_tutor: normalizarTutor(c),
                archivado_por_tutor: Boolean(c.archivado),
            }));
            setCursosArchivados(archivados);

        } catch (e) {
            console.error("Error al cargar datos:", e);
            setCursos([]);
            setMisCursos([]);
            setCursosArchivados([]);
            setTodasDimensiones([]);
        } finally {
            setCargando(false);
            setTimeout(() => setAnimado(true), 80);
        }
    };

    const desarchivar = async (id_curso) => {
        try {
            await api.post(`/cursos/inscripciones/${id_curso}/desarchivar`);
            await cargarDatos();
        } catch (e) {
            console.error("Error al desarchivar", e);
        }
    };

    const inscribirse = async (id_curso) => {
        try {
            await api.post("/cursos/inscripciones", { id_curso });
            await cargarDatos();
        } catch (e) {
            console.error("Error al inscribirse", e);
        }
    };

    const cancelarInscripcion = async (id_curso) => {
        try {
            await api.delete("/cursos/inscripciones", { data: { id_curso } });
            await cargarDatos();
        } catch (e) {
            console.error("Error al cancelar inscripción", e);
        }
    };

    const inscritosIds = useMemo(
        () => new Set(misCursos.map(c => c.id_curso)),
        [misCursos]
    );

    const cursosFiltrados = useMemo(() => {
        let lista;

        if (tab === "recomendados") {
            lista = cursos;
        } else if (tab === "mis-cursos") {
            lista = misCursos;
        } else {
            lista = [...cursosArchivados];
            if (filtroDim) lista = lista.filter(c => c.nombre_dimension === filtroDim);
            if (filtroEstadoArch === "progreso")
                lista = lista.filter(c => c.porcentaje > 0 && !c.completado);
            if (filtroEstadoArch === "sin")
                lista = lista.filter(c => c.porcentaje === 0);
            if (filtroEstadoArch === "completado")
                lista = lista.filter(c => c.completado);
            if (ordenArch === "mayor")
                lista.sort((a, b) => b.porcentaje - a.porcentaje);
            if (ordenArch === "menor")
                lista.sort((a, b) => a.porcentaje - b.porcentaje);
        }

        return lista.filter(c => {
            const matchBusqueda =
                busqueda === "" ||
                c.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
                c.nombre_tutor?.toLowerCase().includes(busqueda.toLowerCase());
            const matchVark = filtroVark === "todos" || c.perfil_vark?.includes(filtroVark);
            const matchDim = !filtroDim || c.nombre_dimension === filtroDim;
            return matchBusqueda && matchVark && (tab === "archivados" ? true : matchDim);
        });
    }, [tab, cursos, misCursos, cursosArchivados, busqueda, filtroVark, filtroDim, filtroEstadoArch, ordenArch]);

    const letrasVark = perfilVark
        ? perfilVark.split("").filter(l => ["V", "A", "R", "K"].includes(l))
        : [];

    const nombrePerfil = letrasVark.length > 0
        ? letrasVark.map(l => VARK_LABELS[l] || l).join(" · ")
        : "";

    const irADetalle = (id_curso) => {
        navigate("/cursos-detalle", { state: { id_curso } });
    };



    return {
        cursos,
        misCursos,
        cursosArchivados,
        todasDimensiones,
        cargando,
        animado,
        tab,
        setTab,
        busqueda,
        setBusqueda,
        filtroVark,
        setFiltroVark,
        perfilVark,
        letrasVark,
        nombrePerfil,
        cursosFiltrados,
        inscritosIds,
        filtroDim,
        setFiltroDim,
        filtroEstadoArch,
        setFiltroEstadoArch,
        ordenArch,
        setOrdenArch,
        desarchivar,
        inscribirse,
        cancelarInscripcion,
        irADetalle,
        recargar: cargarDatos,
    };
}