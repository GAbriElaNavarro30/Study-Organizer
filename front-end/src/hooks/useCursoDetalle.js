// src/hooks/useCursoDetalle.js
import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import api from "../services/api.js";

export function useCursoDetalle() {
    const { state } = useLocation();
    const id_curso = state?.id_curso;

    const [curso, setCurso] = useState(null);
    const [inscrito, setInscrito] = useState(false);
    const [progreso, setProgreso] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [inscribiendo, setInscribiendo] = useState(false);
    const [animado, setAnimado] = useState(false);
    const [error, setError] = useState(null);
    const [ultimoResultado, setUltimoResultado] = useState(null);

    /* ── Carga inicial ── */
    const cargar = useCallback(async () => {
        setCargando(true);
        setError(null);
        try {
            const { data } = await api.get(`/cursos/detalle?id=${id_curso}`);
            setCurso(data.curso);
            setInscrito(data.inscrito);
            setProgreso(data.progreso);
            setUltimoResultado(data.ultimoResultado ?? null);
        } catch {
            setError("No se pudo cargar el curso.");
        } finally {
            setCargando(false);
            setTimeout(() => setAnimado(true), 80);
        }
    }, [id_curso]);

    useEffect(() => {
        if (!id_curso) {
            setError("Curso no encontrado.");
            setCargando(false);
            return;
        }
        cargar();
    }, [cargar, id_curso]);

    /* ── Acciones ──
       Devuelven Promises resueltas/rechazadas para que el componente
       pueda decidir qué hacer (navegar, mostrar alertas, etc.)        */

    const inscribirse = useCallback(async () => {
        setInscribiendo(true);
        try {
            await api.post(`/cursos/inscripciones`, { id_curso });
            setInscrito(true);
            setProgreso({ total: 0, vistos: 0, porcentaje: 0, completado: false, contenidos_vistos: [] });
        } finally {
            setInscribiendo(false);
        }
    }, [id_curso]);

    const cancelarInscripcion = useCallback(async () => {
        await api.delete(`/cursos/inscripciones`, { data: { id_curso } });
        setInscrito(false);
        setProgreso(null);
    }, [id_curso]);

    /**
     * Crea un intento si el curso NO está archivado.
     * Resuelve sin valor; el componente navega tras llamarla.
     */
    const iniciarIntento = useCallback(async () => {
        if (!curso?.archivado) {
            try {
                await api.post("/cursos/intentos", { id_curso });
            } catch {
                /* si ya existe un intento activo, continuamos igual */
            }
        }
    }, [curso?.archivado, id_curso]);

    return {
        /* estado */
        curso,
        inscrito,
        progreso,
        cargando,
        inscribiendo,
        animado,
        error,
        ultimoResultado,
        id_curso,

        /* acciones puras (sin navegación) */
        inscribirse,
        cancelarInscripcion,
        iniciarIntento,
    };
}