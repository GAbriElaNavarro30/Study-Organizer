// src/hooks/useMetodosEstudioHistorial.js
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";

// ── Helpers de nivel (por puntaje numérico) ──
export const nivelColor = (p) =>
    p >= 95 ? "#1A6E3C" : p >= 80 ? "#2E8B57" : p >= 65 ? "#2B7AB8" : p >= 50 ? "#A05A00" : "#B03030";

export const nivelLabel = (p) =>
    p >= 95 ? "Excelente" : p >= 80 ? "Muy bueno" : p >= 65 ? "Bueno" : p >= 50 ? "Regular" : "Deficiente";

export const nivelCssKey = (p) =>
    p >= 95 ? "excelente" : p >= 80 ? "muy-bueno" : p >= 65 ? "bueno" : p >= 50 ? "regular" : "deficiente";

// ── Puntaje con 2 decimales sin redondeo ──
export const formatPuntaje = (p) => (Math.floor(Number(p) * 100) / 100).toFixed(2);

// ── Formato de fecha ──
export const formatFecha = (f) =>
    new Date(f).toLocaleString("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

// ── Hook principal ──
export function useMetodosEstudioHistorial() {
    const navigate = useNavigate();

    const [intentos, setIntentos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [animado, setAnimado] = useState(false);

    useEffect(() => {
        api
            .get("/metodosestudio/historial")
            .then(({ data }) => setIntentos(data.historial || []))
            .catch(() => { })
            .finally(() => {
                setCargando(false);
                setTimeout(() => setAnimado(true), 120);
            });
    }, []);

    // ── Scroll al inicio al montar ──
    useEffect(() => { window.scrollTo(0, 0); }, []);

    const mejorIntento = intentos.length
        ? intentos.reduce((a, b) =>
            Number(b.puntaje_global || 0) > Number(a.puntaje_global || 0) ? b : a
        )
        : null;

    const verResultado = (id_intento) => {
        navigate("/resultado-metodos-estudio", {
            state: { id_intento },
        });
    };

    const irAlTest = () => navigate("/test-metodos-estudio");
    const irAlInicio = () => navigate("/metodos-estudio");

    return {
        // Estado
        intentos,
        cargando,
        animado,
        mejorIntento,

        // Acciones
        verResultado,
        irAlTest,
        irAlInicio,
    };
}