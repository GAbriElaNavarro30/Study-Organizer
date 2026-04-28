// src/hooks/useResultadoIntento.js
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";

export function useResultadoIntento() {
    const navigate = useNavigate();
    const { state } = useLocation();
    // state: { id_intento, nombreCurso }

    const [resultado, setResultado] = useState(null);
    const [curso, setCurso] = useState(null);
    const [retroalimentacion, setRetro] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!state?.id_intento) {
            setError("Faltan parámetros de navegación.");
            setCargando(false);
            return;
        }
        (async () => {
            try {
                const { data } = await api.get(
                    `/cursos/intentos/${state.id_intento}/resultado`
                );
                setResultado(data.resultado);
                setCurso(data.curso);
                setRetro(data.retroalimentacion || []);
            } catch (err) {
                setError(err.response?.data?.mensaje || "No se pudo cargar el resultado.");
            } finally {
                setCargando(false);
            }
        })();
    }, [state]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const aprobado = resultado ? Number(resultado.puntaje) >= 70 : false;

    return {
        navigate,
        state,
        resultado,
        curso,
        retroalimentacion,
        cargando,
        error,
        aprobado,
    };
} 