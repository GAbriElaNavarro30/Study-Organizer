// src/hooks/useHistorialResultadoEstudianteCurso.js
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";

export function useHistorialResultadoEstudianteCurso() {
    const navigate = useNavigate();
    const { state } = useLocation();

    const [historial, setHistorial] = useState([]);
    const [estudiante, setEstudiante] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!state?.idCurso) {
            setError("Faltan parámetros de navegación.");
            setCargando(false);
            return;
        }
        (async () => {
            try {
                let url;
                if (state.idUsuario) {
                    url = `/cursos/cursos/${state.idCurso}/estudiantes/${state.idUsuario}/historial`;
                } else {
                    url = `/cursos/mi-historial?id=${state.idCurso}`;
                }
                const { data } = await api.get(url);
                setHistorial(data.historial || []);
                setEstudiante(data.estudiante || null);
            } catch (err) {
                setError(err.response?.data?.mensaje || "No se pudo cargar el historial.");
            } finally {
                setCargando(false);
            }
        })();
    }, [state]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const promedio = historial.length
        ? historial.reduce((s, r) => s + Number(r.puntaje || 0), 0) / historial.length
        : 0;

    const mejorPuntaje = historial.length
        ? Math.max(...historial.map(r => Number(r.puntaje || 0)))
        : 0;

    const mejorIdx = historial.findIndex(r => Number(r.puntaje) === mejorPuntaje);
    const ultimoNivel = historial.at(-1)?.nivel || "—";
    const maxP = mejorPuntaje || 100;

    return {
        navigate,
        state,
        historial,
        estudiante,
        cargando,
        error,
        promedio,
        mejorPuntaje,
        mejorIdx,
        ultimoNivel,
        maxP,
    };
}