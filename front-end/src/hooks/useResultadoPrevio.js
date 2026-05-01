// src/hooks/useResultadoPrevio.js
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";

export function useResultadoPrevio() {
    const navigate = useNavigate();
    const [resultado, setResultado] = useState(null);
    const [cargando, setCargando]   = useState(true);

    useEffect(() => {
        const verificar = async () => {
            try {
                const { data } = await api.get("/estilosaprendizaje/resultado-guardado");
                setResultado(data);
            } catch (err) {
                // 404 es esperado cuando el usuario aún no ha hecho el test
                setResultado(null);
            } finally {
                setCargando(false);
            }
        };
        verificar();
    }, []);

    const verResultados = () => {
        navigate("/resultados-test-estilos-aprendizaje", { state: resultado });
    };

    return {
        resultado,
        cargando,
        verResultados,
    };
} 