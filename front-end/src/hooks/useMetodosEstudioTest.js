// src/hooks/useMetodosEstudioTest.js
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";

export function useMetodosEstudioTest() {
    const navigate = useNavigate();

    const [dimensiones, setDimensiones] = useState([]);
    const [dimActual, setDimActual] = useState(0);
    const [respuestas, setRespuestas] = useState({});
    const [cargando, setCargando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState(null);
    const [muted, setMuted] = useState(true);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [mostrarAlertExito, setMostrarAlertExito] = useState(false);
    const [datosResultado, setDatosResultado] = useState(null);

    const iframeRef = useRef(null);
    const mainRef = useRef(null);

    // ── Carga inicial ──
    useEffect(() => {
        window.scrollTo(0, 0);
        cargarTest();
    }, []);

    // ── Carga preguntas desde la API ──
    const cargarTest = async () => {
        try {
            const { data } = await api.get("/metodosestudio/preguntas");
            setDimensiones(data.dimensiones);
        } catch {
            setError("No se pudo cargar el test. Intenta de nuevo.");
        } finally {
            setCargando(false);
        }
    };

    // ── Toggle música de fondo ──
    const toggleMute = () => {
        setMuted((prev) => {
            const next = !prev;
            if (iframeRef.current) {
                const base = "https://www.youtube.com/embed/MNM4D5CxJaU?autoplay=1&loop=1&playlist=MNM4D5CxJaU&controls=0";
                iframeRef.current.src = next ? base + "&mute=1" : base + "&mute=0";
            }
            return next;
        });
    };

    /**
     * Toggle selection:
     * - Si la opción ya está seleccionada → desmarcar (elimina la key)
     * - Si es diferente             → seleccionar la nueva (solo 1 a la vez)
     */
    const seleccionarRespuesta = (id_pregunta, opcion) => {
        setRespuestas((prev) => {
            const actual = prev[id_pregunta];
            if (actual?.id_opcion === opcion.id_opcion) {
                const { [id_pregunta]: _, ...resto } = prev;
                return resto;
            }
            return { ...prev, [id_pregunta]: opcion };
        });
    };

    // ── Verifica si toda una dimensión está completa ──
    const dimCompleta = (dim) =>
        dim?.preguntas?.every((p) => respuestas[p.id_pregunta]);

    // ── Navegar entre dimensiones y hacer scroll al top ──
    const irA = (index) => {
        setDimActual(index);
        mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        window.scrollTo({ top: 0, behavior: "smooth" });
        document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
    };

    // ── Enviar respuestas al backend ──
    const enviarTest = async () => {
        if (totalRespondidas !== totalPreguntas) {
            setError("Debes responder todas las preguntas antes de continuar.");
            return;
        }
        setEnviando(true);
        setError(null);
        try {
            const todasPreguntas = dimensiones.flatMap((d) => d.preguntas);
            const payload = todasPreguntas.map((p) => {
                const r = respuestas[p.id_pregunta];
                return {
                    id_pregunta: p.id_pregunta,
                    id_opcion: r.id_opcion,
                    id_dimension: p.id_dimension,
                    valor: r.valor,
                    es_negativa: p.es_negativa,
                };
            });
            const { data } = await api.post("/metodosestudio/guardar-respuestas", { respuestas: payload });
            setDatosResultado(data);
            setMostrarAlertExito(true);
        } catch (err) {
            setError(err.response?.data?.error || "Error al enviar el test.");
        } finally {
            setEnviando(false);
        }
    };

    // ── Confirmar alert de éxito y navegar a resultados ──
    const handleAlertAceptar = () => {
        setMostrarAlertExito(false);
        navigate("/resultado-metodos-estudio", { state: datosResultado });
    };

    // ── Abandonar el test y volver al inicio ──
    const handleAbandonar = () => {
        setMostrarModal(false);
        navigate("/metodos-estudio");
    };

    // ── Datos derivados ──
    const totalRespondidas = Object.keys(respuestas).length;
    const totalPreguntas = dimensiones.reduce((a, d) => a + d.preguntas.length, 0);
    const progreso = totalPreguntas > 0
        ? Math.round((totalRespondidas / totalPreguntas) * 100)
        : 0;

    const dim = dimensiones[dimActual];
    const preguntasRestantes = dim?.preguntas?.filter((p) => !respuestas[p.id_pregunta]).length || 0;

    return {
        // Refs
        iframeRef,
        mainRef,

        // Estados
        dimensiones,
        dimActual,
        respuestas,
        cargando,
        enviando,
        error,
        muted,
        mostrarModal,
        mostrarAlertExito,

        // Datos derivados
        dim,
        totalRespondidas,
        totalPreguntas,
        progreso,
        preguntasRestantes,

        // Setters que el componente necesita directamente
        setMostrarModal,

        // Acciones
        toggleMute,
        seleccionarRespuesta,
        dimCompleta,
        irA,
        enviarTest,
        handleAlertAceptar,
        handleAbandonar,
    };
}