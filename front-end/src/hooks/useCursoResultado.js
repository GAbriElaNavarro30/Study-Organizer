// useCursoResultado.js

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api.js";

export function useCursoResultado() {
    const { state } = useLocation();
    const id_curso  = state?.id_curso;
    const navigate  = useNavigate();

    const [resultado, setResultado]           = useState(null);
    const [curso, setCurso]                   = useState(null);
    const [progreso, setProgreso]             = useState(null);
    const [retroalimentacion, setRetro]       = useState(
        state?.retroalimentacion ?? []        // si viene del visor, úsala de inmediato
    );
    const [cargando, setCargando]             = useState(true);
    const [animado, setAnimado]               = useState(false);
    const [error, setError]                   = useState(null);

    useEffect(() => {
        if (!id_curso) { navigate("/cursos"); return; }
        cargar();
        window.scrollTo(0, 0);
    }, [id_curso]);

    const cargar = async () => {
        setCargando(true);
        setError(null);
        try {
            const { data: detalleData } = await api.get(`/cursos/detalle?id=${id_curso}`);
            setCurso(detalleData.curso);
            setProgreso(detalleData.progreso);

            const { data: resData } = await api.get(`/cursos/resultado?id_curso=${id_curso}`);
            setResultado(resData.resultado);

            // ← Usar la retroalimentación del backend siempre que llegue,
            //   así funciona tanto desde el visor como desde "Ver resultado"
            if (resData.retroalimentacion?.length > 0) {
                setRetro(resData.retroalimentacion);
            }
        } catch {
            setError("No se pudo cargar el resultado.");
        } finally {
            setCargando(false);
            setTimeout(() => setAnimado(true), 80);
        }
    };

    return {
        resultado,
        curso,
        progreso,
        cargando,
        animado,
        error,
        navigate,
        retroalimentacion,
    };
}