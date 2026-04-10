import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api.js";

export function useCursoResultado() {
    const { state } = useLocation();
    const id_curso  = state?.id_curso;
    const navigate  = useNavigate();

    // ← Leer retroalimentación que viene del visor
    const retroalimentacion = state?.retroalimentacion ?? [];

    const [resultado, setResultado] = useState(null);
    const [curso, setCurso]         = useState(null);
    const [progreso, setProgreso]   = useState(null);
    const [cargando, setCargando]   = useState(true);
    const [animado, setAnimado]     = useState(false);
    const [error, setError]         = useState(null);

    useEffect(() => {
        if (!id_curso) { navigate("/cursos"); return; }
        cargar();
        window.scrollTo(0, 0);
    }, [id_curso]);

    const cargar = async () => {
        setCargando(true);
        setError(null);
        try {
            const { data } = await api.get(`/cursos/detalle?id=${id_curso}`);
            setCurso(data.curso);
            setProgreso(data.progreso);

            const { data: res } = await api.get(`/cursos/resultado?id_curso=${id_curso}`);
            setResultado(res.resultado);
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
        retroalimentacion, // ← nuevo
    };
}