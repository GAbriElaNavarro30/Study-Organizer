// src/hooks/useCursosE.js
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";

const VARK_LABELS = { V: "Visual", A: "Auditivo", R: "Lector / Escritor", K: "Kinestésico" };

export function useCursosE() {
    const navigate = useNavigate();

    const [cursos, setCursos] = useState([]);
    const [misCursos, setMisCursos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [animado, setAnimado] = useState(false);
    const [tab, setTab] = useState("recomendados"); // "recomendados" | "mis-cursos"
    const [busqueda, setBusqueda] = useState("");
    const [filtroVark, setFiltroVark] = useState("todos");
    const [perfilVark, setPerfilVark] = useState("");

    useEffect(() => {
        cargarDatos();
    }, []);

    {/*const cargarDatos = async () => {
        setCargando(true);
        try {
            // Obtener perfil VARK del usuario
            const { data: perfilData } = await api.get("/estilosaprendizaje/resultado-guardado");
            const perfil = perfilData?.perfil_dominante || "VARK";
            setPerfilVark(perfil);

            // Cargar cursos recomendados
            const { data: recData } = await api.get(`/cursos/recomendados/por-dimension?perfil=${perfil}`);
            setCursos(recData.cursos || []);

            // Cargar mis cursos inscritos
            const { data: misData } = await api.get("/cursos/inscripciones/mis-cursos");
            setMisCursos(misData.cursos || []);
        } catch {
            setCursos([]);
            setMisCursos([]);
        } finally {
            setCargando(false);
            setTimeout(() => setAnimado(true), 80);
        }
    */};

    const cargarDatos = async () => {
        setCargando(true);
        try {
            // resultado-guardado ya trae perfil + cursos recomendados por el SE
            const { data: perfilData } = await api.get("/estilosaprendizaje/resultado-guardado");
            const perfil = perfilData?.perfil_dominante || "VARK";
            setPerfilVark(perfil);

            // ← usar los cursos que el SE ya recomendó, no llamar a otro endpoint
            setCursos(perfilData.cursos_recomendados || []);

            // Cargar mis cursos inscritos
            const { data: misData } = await api.get("/cursos/inscripciones/mis-cursos");
            setMisCursos(misData.cursos || []);
        } catch {
            setCursos([]);
            setMisCursos([]);
        } finally {
            setCargando(false);
            setTimeout(() => setAnimado(true), 80);
        }
    };

    // IDs de cursos ya inscritos
    const inscritosIds = useMemo(
        () => new Set(misCursos.map(c => c.id_curso)),
        [misCursos]
    );

    // Cursos filtrados
    const cursosFiltrados = useMemo(() => {
        const lista = tab === "recomendados" ? cursos : misCursos;
        return lista.filter(c => {
            const matchBusqueda = busqueda === "" ||
                c.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
                c.nombre_tutor?.toLowerCase().includes(busqueda.toLowerCase()) ||
                c.nombre_dimension?.toLowerCase().includes(busqueda.toLowerCase());
            const matchVark = filtroVark === "todos" ||
                c.perfil_vark?.includes(filtroVark);
            return matchBusqueda && matchVark;
        });
    }, [tab, cursos, misCursos, busqueda, filtroVark]);

    // Letras del perfil para mostrar en header
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
        irADetalle,
        recargar: cargarDatos,
    };
}