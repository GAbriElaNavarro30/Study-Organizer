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

    const cargarDatos = async () => {
        setCargando(true);
        try {
            // ── 1. Perfil VARK + todas las dimensiones de BD ────────
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

            // Guardar TODAS las dimensiones de la BD
            setTodasDimensiones(dimsData.dimensiones || []);

            // Cursos VARK recomendados
            const cursosVark = (perfilData.cursos_recomendados || []).map(c => ({
                ...c,
                prioridad: c.perfil_vark === perfil ? 0 : 1,
            }));

            // ── 2. Cursos por dimensión (desde último resultado ME) ──
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
                        .map(c => ({ ...c, prioridad: c.prioridad ?? 1 }));
                }
            } catch (e) {
                console.info("Sin historial de métodos de estudio:", e?.response?.status);
            }

            // ── 3. Combinar sin duplicados ───────────────────────────
            setCursos([...cursosVark, ...cursosDimension]);
            setMisCursos(misData.cursos || []);
            setCursosArchivados(misData.archivados || []);

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
            if (filtroEstadoArch === "progreso") lista = lista.filter(c => (c.contenidos_vistos || 0) > 0 && !c.completado);
            if (filtroEstadoArch === "sin") lista = lista.filter(c => (c.contenidos_vistos || 0) === 0);
            if (filtroEstadoArch === "completado") lista = lista.filter(c => !!c.completado);
            if (ordenArch === "mayor") lista.sort((a, b) => {
                const pctA = Math.round(((a.contenidos_vistos || 0) / Math.max(a.total_contenidos || 1, 1)) * 100);
                const pctB = Math.round(((b.contenidos_vistos || 0) / Math.max(b.total_contenidos || 1, 1)) * 100);
                return pctB - pctA;
            });
            if (ordenArch === "menor") lista.sort((a, b) => {
                const pctA = Math.round(((a.contenidos_vistos || 0) / Math.max(a.total_contenidos || 1, 1)) * 100);
                const pctB = Math.round(((b.contenidos_vistos || 0) / Math.max(b.total_contenidos || 1, 1)) * 100);
                return pctA - pctB;
            });
        }

        return lista.filter(c => {
            const matchBusqueda = busqueda === "" ||
                c.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
                c.nombre_tutor?.toLowerCase().includes(busqueda.toLowerCase()) ||
                c.nombre_dimension?.toLowerCase().includes(busqueda.toLowerCase());
            const matchVark = filtroVark === "todos" || c.perfil_vark?.includes(filtroVark);
            const matchDim = !filtroDim || c.nombre_dimension === filtroDim;
            return matchBusqueda && matchVark && (tab !== "recomendados" && tab !== "mis-cursos" ? true : matchDim);
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
        irADetalle,
        recargar: cargarDatos,
    };
}