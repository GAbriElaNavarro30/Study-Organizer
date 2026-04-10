import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api.js";

export function useCursoVisor() {
    const { state } = useLocation();
    const id = state?.id_curso;
    const navigate = useNavigate();

    const [curso, setCurso] = useState(null);
    const [soloLectura, setSoloLectura] = useState(false);
    const [contenidosVistosIniciales, setContenidosVistosIniciales] = useState(new Set());
    const [contenidosVistos, setContenidosVistos] = useState(new Set());
    const [cargando, setCargando] = useState(true);
    const [animado, setAnimado] = useState(false);
    const [seccionIdx, setSeccionIdx] = useState(0);
    const [contenidoIdx, setContenidoIdx] = useState(0);
    const [marcadoEnSesion, setMarcadoEnSesion] = useState(false);
    const [mostrarModalSalir, setMostrarModalSalir] = useState(false);

    // ── Test — guardado por sección ──
    const [respuestasPorSeccion, setRespuestasPorSeccion] = useState({});
    const [resultadosPorSeccion, setResultadosPorSeccion] = useState({});

    // ── Retroalimentación del sistema experto ──
    const [retroalimentacion, setRetroalimentacion] = useState([]);

    useEffect(() => {
        if (!id) { navigate("/cursos"); return; }
        cargar();
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        setMarcadoEnSesion(false);
    }, [seccionIdx, contenidoIdx]);

    const cargar = async () => {
        setCargando(true);
        try {
            const { data } = await api.get(`/cursos/detalle?id=${id}`);

            if (!data.inscrito) {
                navigate("/cursos/detalle", { state: { id_curso: id } });
                return;
            }

            setCurso(data.curso);

            if (data.curso?.archivado) setSoloLectura(true);

            const vistosDelServidor = new Set(data.progreso?.contenidos_vistos || []);
            setContenidosVistosIniciales(vistosDelServidor);
            setContenidosVistos(new Set());

            if (data.curso?.secciones) {
                let encontrado = false;
                for (let si = 0; si < data.curso.secciones.length; si++) {
                    const seccContenidos = data.curso.secciones[si].contenidos || [];
                    for (let ci = 0; ci < seccContenidos.length; ci++) {
                        if (!vistosDelServidor.has(seccContenidos[ci].id_contenido)) {
                            setSeccionIdx(si);
                            setContenidoIdx(ci);
                            encontrado = true;
                            break;
                        }
                    }
                    if (encontrado) break;
                }
            }
        } catch {
            navigate("/cursos");
        } finally {
            setCargando(false);
            setTimeout(() => setAnimado(true), 80);
        }
    };

    const progreso = useMemo(() => {
        if (!curso?.secciones) return { vistos: 0, total: 0, porcentaje: 0, completado: false };
        const total = curso.secciones.reduce((acc, s) => acc + (s.contenidos?.length || 0), 0);
        const vistos = contenidosVistos.size;
        const porcentaje = total > 0 ? Math.round((vistos / total) * 100) : 0;
        return { vistos, total, porcentaje, completado: vistos >= total && total > 0 };
    }, [curso, contenidosVistos]);

    const seccionActual = curso?.secciones?.[seccionIdx];
    const contenidoActual = seccionActual?.contenidos?.[contenidoIdx];
    const preguntasActuales = seccionActual?.preguntas || [];

    const respuestas = respuestasPorSeccion[seccionIdx] || {};
    const resultadoTest = resultadosPorSeccion[seccionIdx] ?? null;

    const secciones = curso?.secciones || [];
    const hayAnterior = seccionIdx > 0 || contenidoIdx > 0;
    const haysSiguiente =
        seccionIdx < secciones.length - 1 ||
        contenidoIdx < (secciones[seccionIdx]?.contenidos?.length || 1) - 1;

    const tieneTest = preguntasActuales.length > 0;
    const testPendiente = tieneTest && resultadoTest === null;
    const siguienteBloqueado = !soloLectura && (!marcadoEnSesion || testPendiente);

    useEffect(() => {
        if (!contenidoActual?.id_contenido || soloLectura) return;
        if (contenidosVistosIniciales.has(contenidoActual.id_contenido)) {
            setMarcadoEnSesion(true);
            return;
        }
        if (preguntasActuales.length > 0 && resultadoTest === null) return;

        const timer = setTimeout(() => {
            marcarVisto(contenidoActual.id_contenido);
            setMarcadoEnSesion(true);
        }, 1000);
        return () => clearTimeout(timer);
    }, [contenidoActual?.id_contenido, soloLectura, preguntasActuales.length, resultadoTest]);

    useEffect(() => {
        if (contenidoActual?.id_contenido && contenidosVistos.has(contenidoActual.id_contenido)) {
            setMarcadoEnSesion(true);
        }
    }, [contenidosVistos, contenidoActual?.id_contenido]);

    const marcarVisto = useCallback((id_contenido) => {
        if (!id_contenido || contenidosVistos.has(id_contenido)) return;
        setContenidosVistos(prev => new Set([...prev, id_contenido]));
        if (!soloLectura) {
            api.post(`/cursos/progreso/${id_contenido}`, { id_curso: id })
                .catch(() => { });
        }
    }, [contenidosVistos, id, soloLectura]);

    const seleccionarRespuesta = (id_test, id_opcion) => {
        if (soloLectura) return;
        setRespuestasPorSeccion(prev => ({
            ...prev,
            [seccionIdx]: { ...(prev[seccionIdx] || {}), [id_test]: id_opcion }
        }));
    };

    // ── enviarTest — ahora captura la retroalimentación ──  ← MODIFICADO
    const enviarTest = async () => {
        const respuestasActuales = respuestasPorSeccion[seccionIdx] || {};
        let correctas = 0;
        for (const pregunta of preguntasActuales) {
            const opcionElegida = pregunta.opciones?.find(
                o => o.id_opcion === respuestasActuales[pregunta.id_test]
            );
            if (opcionElegida?.es_correcta) correctas++;
        }
        setResultadosPorSeccion(prev => ({
            ...prev,
            [seccionIdx]: { correctas, total: preguntasActuales.length }
        }));

        if (!soloLectura) {
            try {
                const { data } = await api.post("/cursos/test/respuestas", {
                    id_curso: id,
                    respuestas: Object.entries(respuestasActuales).map(([id_test, id_opcion]) => ({
                        id_test: Number(id_test),
                        id_opcion: Number(id_opcion),
                    })),
                });
                // Guardar retroalimentación que viene del sistema experto
                if (data.retroalimentacion?.length) {
                    setRetroalimentacion(data.retroalimentacion);
                }
            } catch { }
        }
    };

    const irASiguiente = () => {
        const contenidos = secciones[seccionIdx]?.contenidos || [];
        if (contenidoIdx < contenidos.length - 1) {
            setContenidoIdx(ci => ci + 1);
        } else if (seccionIdx < secciones.length - 1) {
            setSeccionIdx(si => si + 1);
            setContenidoIdx(0);
        }
    };

    const irAAnterior = () => {
        if (contenidoActual?.id_contenido) {
            setContenidosVistos(prev => {
                const next = new Set(prev);
                next.delete(contenidoActual.id_contenido);
                return next;
            });
        }
        if (contenidoIdx > 0) {
            setContenidoIdx(ci => ci - 1);
        } else if (seccionIdx > 0) {
            const prevSec = curso.secciones[seccionIdx - 1];
            setSeccionIdx(si => si - 1);
            setContenidoIdx((prevSec?.contenidos?.length || 1) - 1);
        }
    };

    const irAContenido = (si, ci) => {
        setSeccionIdx(si);
        setContenidoIdx(ci);
    };

    const handleSiguiente = () => {
        if (siguienteBloqueado) return;
        irASiguiente();
    };

    // ── handleVerResultados — pasa retroalimentación al navegar ──  ← MODIFICADO
    const handleVerResultados = () => {
        if (siguienteBloqueado) return;
        marcarVisto(contenidoActual.id_contenido);
        navigate("/cursos/resultado", {
            state: {
                id_curso: curso.id_curso,
                retroalimentacion,          // ← viene del estado
            }
        });
    };

    const handleConfirmarSalir = () => {
        navigate("/cursos-detalle", { state: { id_curso: curso.id_curso } });
    };

    return {
        curso,
        progreso,
        soloLectura,
        contenidosVistos,
        contenidosVistosIniciales,
        cargando,
        animado,
        seccionIdx,
        contenidoIdx,
        seccionActual,
        contenidoActual,
        preguntasActuales,
        hayAnterior,
        haysSiguiente,
        respuestas,
        resultadoTest,
        marcadoEnSesion,
        tieneTest,
        testPendiente,
        siguienteBloqueado,
        mostrarModalSalir,
        setMostrarModalSalir,
        seleccionarRespuesta,
        enviarTest,
        marcarVisto,
        irASiguiente,
        irAAnterior,
        irAContenido,
        handleSiguiente,
        handleVerResultados,
        handleConfirmarSalir,
        navigate,
        retroalimentacion,
    };
}