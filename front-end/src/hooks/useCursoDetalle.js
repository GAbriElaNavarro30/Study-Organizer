// src/hooks/useCursoDetalle.js
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api.js";

export function useCursoDetalle() {
    const { state } = useLocation();
    const id_curso = state?.id_curso;
    const navigate = useNavigate();

    const [curso, setCurso] = useState(null);
    const [inscrito, setInscrito] = useState(false);
    const [progreso, setProgreso] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [inscribiendo, setInscribiendo] = useState(false);
    const [animado, setAnimado] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id_curso) {
            setError("Curso no encontrado.");
            setCargando(false);
            return;
        }
        cargar();
        window.scrollTo(0, 0);
    }, [id_curso]);

    const cargar = async () => {
        setCargando(true);
        setError(null);
        try {
            const { data } = await api.get(`/cursos/detalle?id=${id_curso}`);
            setCurso(data.curso);
            setInscrito(data.inscrito);
            setProgreso(data.progreso);
        } catch {
            setError("No se pudo cargar el curso.");
        } finally {
            setCargando(false);
            setTimeout(() => setAnimado(true), 80);
        }
    };

    const handleInscribirse = async () => {
        if (inscribiendo) return;
        setInscribiendo(true);
        try {
            await api.post(`/cursos/inscripciones`, { id_curso });
            setInscrito(true);
            setProgreso({ total: 0, vistos: 0, porcentaje: 0, completado: false, contenidos_vistos: [] });
        } catch (err) {
            alert(err?.response?.data?.mensaje || "Error al inscribirse.");
        } finally {
            setInscribiendo(false);
        }
    };

    const handleCancelarInscripcion = async () => {
        const confirmar = window.confirm("¿Seguro que quieres cancelar tu inscripción?");
        if (!confirmar) return;
        try {
            await api.delete(`/cursos/inscripciones`, { data: { id_curso } });
            setInscrito(false);
            setProgreso(null);
        } catch (err) {
            alert(err?.response?.data?.mensaje || "Error al cancelar la inscripción.");
        }
    };

    const handleIniciarCurso = async () => {
        try {
            await api.post("/cursos/intentos", { id_curso });
        } catch { /* si ya existe intento activo, continúa igual */ }
        navigate("/cursos-visor", { state: { id_curso } });
    };

    const handleRetomarCurso = () => {
        navigate("/cursos-visor", { state: { id_curso } });
    };

    const handleVerResultados = () => {
        navigate("/cursos/resultado", { state: { id_curso } });
    };

    const totalContenidos = curso?.secciones?.reduce(
        (acc, s) => acc + (s.contenidos?.length || 0), 0
    ) ?? 0;

    const totalPreguntas = curso?.secciones?.reduce(
        (acc, s) => acc + (s.preguntas?.length || 0), 0
    ) ?? 0;

    return {
        curso,
        inscrito,
        progreso,
        cargando,
        inscribiendo,
        animado,
        error,
        totalContenidos,
        totalPreguntas,
        handleInscribirse,
        handleCancelarInscripcion,
        handleIniciarCurso,
        handleRetomarCurso,
        handleVerResultados,
        navigate,
    };
}