// src/hooks/useResultadoPrevioME.js
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";

export function useResultadoPrevioME() {
    const navigate = useNavigate();
    const [resultado, setResultado] = useState(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const verificar = async () => {
            try {
                const { data } = await api.get("/metodosestudio/historial");
                if (data.historial && data.historial.length > 0) {
                    setResultado(data.historial[0]); // el más reciente
                } else {
                    setResultado(null);
                }
            } catch {
                setResultado(null);
            } finally {
                setCargando(false);
            }
        };
        verificar();
    }, []);

    const verResultados = () => {
        navigate("/resultado-metodos-estudio", {
            state: { id_intento: resultado.id_intento },
        });
    };

    return { resultado, cargando, verResultados };
}