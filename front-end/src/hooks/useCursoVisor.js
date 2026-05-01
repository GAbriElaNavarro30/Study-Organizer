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
    }, [seccionIdx]);

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
            setContenidosVistos(new Set(vistosDelServidor));

            // ── Restaurar respuestas del intento activo (si existe y no está completado) ──
            if (!data.curso?.archivado) {
                try {
                    const { data: dataRespuestas } = await api.get(`/cursos/respuestas-intento?id_curso=${id}`);

                    if (dataRespuestas?.respuestas?.length > 0) {
                        // Agrupar respuestas por sección
                        const respuestasPorSeccion = {};
                        const resultadosPorSeccion = {};

                        // Construir mapa de id_seccion -> índice de sección
                        const mapaSeccion = {};
                        (data.curso?.secciones || []).forEach((seccion, si) => {
                            mapaSeccion[seccion.id_seccion] = si;
                        });

                        // Agrupar respuestas elegidas por sección
                        dataRespuestas.respuestas.forEach(r => {
                            const si = mapaSeccion[r.id_seccion];
                            if (si === undefined) return;

                            if (!respuestasPorSeccion[si]) respuestasPorSeccion[si] = {};
                            respuestasPorSeccion[si][r.id_test] = r.id_opcion;
                        });

                        // Calcular resultado por sección
                        (data.curso?.secciones || []).forEach((seccion, si) => {
                            const respSec = respuestasPorSeccion[si];
                            if (!respSec || !seccion.preguntas?.length) return;

                            // Solo marcar como respondido si respondió todas las preguntas de esa sección
                            const todasRespondidas = seccion.preguntas.every(p => respSec[p.id_test] !== undefined);
                            if (!todasRespondidas) return;

                            let correctas = 0;
                            seccion.preguntas.forEach(p => {
                                const opcionElegida = p.opciones?.find(o => o.id_opcion === respSec[p.id_test]);
                                if (opcionElegida?.es_correcta) correctas++;
                            });

                            resultadosPorSeccion[si] = {
                                correctas,
                                total: seccion.preguntas.length,
                            };
                        });

                        if (Object.keys(respuestasPorSeccion).length > 0) {
                            setRespuestasPorSeccion(respuestasPorSeccion);
                        }
                        if (Object.keys(resultadosPorSeccion).length > 0) {
                            setResultadosPorSeccion(resultadosPorSeccion);
                        }

                    } else if (dataRespuestas?.intento_completado) {
                        // El intento ya está completado — marcar todos los tests como restaurados
                        const resultadosRestaurados = {};
                        (data.curso?.secciones || []).forEach((seccion, si) => {
                            if (seccion.preguntas?.length > 0) {
                                resultadosRestaurados[si] = {
                                    correctas: null,
                                    total: seccion.preguntas.length,
                                    restaurado: true,
                                };
                            }
                        });
                        if (Object.keys(resultadosRestaurados).length > 0) {
                            setResultadosPorSeccion(resultadosRestaurados);
                        }
                    }
                } catch {
                    // Si falla no es crítico
                }
            }

            if (data.curso?.secciones) {
                let ultimoSi = 0;
                let ultimoCi = 0;

                for (let si = 0; si < data.curso.secciones.length; si++) {
                    const seccContenidos = data.curso.secciones[si].contenidos || [];
                    for (let ci = 0; ci < seccContenidos.length; ci++) {
                        if (vistosDelServidor.has(seccContenidos[ci].id_contenido)) {
                            ultimoSi = si;
                            ultimoCi = ci;
                        }
                    }
                }

                setSeccionIdx(ultimoSi);
                setContenidoIdx(ultimoCi);
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
    const hayAnterior = seccionIdx > 0;
    const haysSiguiente = seccionIdx < secciones.length - 1;

    const tieneTest = preguntasActuales.length > 0;
    const testPendiente = tieneTest && resultadoTest === null;
    const siguienteBloqueado = !soloLectura && (!marcadoEnSesion || testPendiente);

    useEffect(() => {
        if (!seccionActual || soloLectura) return;
        const contenidos = seccionActual.contenidos || [];

        // Si todos ya estaban vistos desde el servidor, marcar inmediatamente
        const todosVistosInicialmente = contenidos.every(c => contenidosVistosIniciales.has(c.id_contenido));
        if (todosVistosInicialmente) {
            setMarcadoEnSesion(true);
            return;
        }

        // Si hay test pendiente, esperar a que lo complete
        if (preguntasActuales.length > 0 && resultadoTest === null) return;

        // Marcar todos los contenidos de la sección como vistos
        const timer = setTimeout(() => {
            contenidos.forEach(con => {
                if (!contenidosVistos.has(con.id_contenido)) {
                    setContenidosVistos(prev => new Set([...prev, con.id_contenido]));
                    api.post(`/cursos/progreso/${con.id_contenido}`, { id_curso: id })
                        .then(({ data }) => {
                            if (data.completado && data.resultado?.retroalimentacion?.length) {
                                setRetroalimentacion(data.resultado.retroalimentacion);
                            }
                        })
                        .catch(() => { });
                }
            });
            setMarcadoEnSesion(true);
        }, 1000);
        return () => clearTimeout(timer);
    }, [seccionIdx, soloLectura, preguntasActuales.length, resultadoTest, contenidosVistosIniciales]);

    useEffect(() => {
        if (!seccionActual) return;
        const contenidos = seccionActual.contenidos || [];
        const todosVistos = contenidos.every(c => contenidosVistos.has(c.id_contenido));
        if (todosVistos) setMarcadoEnSesion(true);
    }, [contenidosVistos, seccionActual]);

    const marcarVisto = useCallback((id_contenido) => {
        if (!id_contenido || contenidosVistos.has(id_contenido)) return;
        setContenidosVistos(prev => new Set([...prev, id_contenido]));
        if (!soloLectura) {
            api.post(`/cursos/progreso/${id_contenido}`, { id_curso: id })
                .then(({ data }) => {
                    // Capturar retroalimentación cuando el curso se completa
                    if (data.completado && data.resultado?.retroalimentacion?.length) {
                        setRetroalimentacion(data.resultado.retroalimentacion);
                    }
                })
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
                await api.post("/cursos/test/respuestas", {
                    id_curso: id,
                    respuestas: Object.entries(respuestasActuales).map(([id_test, id_opcion]) => ({
                        id_test: Number(id_test),
                        id_opcion: Number(id_opcion),
                    })),
                });
                // ← Se quitó la captura de retroalimentacion porque
                //    ahora viene de marcarVisto cuando el curso se completa
            } catch { }
        }
    };

    const irASiguiente = () => {
        if (seccionIdx < secciones.length - 1) {
            setSeccionIdx(si => si + 1);
            setContenidoIdx(0);
        }
    };

    const irAAnterior = () => {
        if (seccionIdx > 0) {
            setSeccionIdx(si => si - 1);
            setContenidoIdx(0);
        }
    };

    const irAContenido = (si, ci) => {
        if (soloLectura) {
            setSeccionIdx(si);
            setContenidoIdx(0);
            return;
        }

        // Ir hacia atrás siempre permitido
        if (si <= seccionIdx) {
            setSeccionIdx(si);
            setContenidoIdx(0);
            return;
        }

        // Ir hacia adelante: solo a la siguiente inmediata y si está desbloqueada
        if (!marcadoEnSesion || testPendiente) return;
        if (si > seccionIdx + 1) return;

        setSeccionIdx(si);
        setContenidoIdx(0);
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