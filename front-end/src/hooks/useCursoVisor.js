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
        const contenidos = secciones[seccionIdx]?.contenidos || [];
        if (contenidoIdx < contenidos.length - 1) {
            setContenidoIdx(ci => ci + 1);
        } else if (seccionIdx < secciones.length - 1) {
            setSeccionIdx(si => si + 1);
            setContenidoIdx(0);
        }
    };

    const irAAnterior = () => {
        if (contenidoIdx > 0) {
            setContenidoIdx(ci => ci - 1);
        } else if (seccionIdx > 0) {
            const prevSec = curso.secciones[seccionIdx - 1];
            setSeccionIdx(si => si - 1);
            setContenidoIdx((prevSec?.contenidos?.length || 1) - 1);
        }
    };

    const irAContenido = (si, ci) => {
        if (soloLectura) {
            setSeccionIdx(si);
            setContenidoIdx(ci);
            return;
        }

        // Calcular índice plano del destino y del actual
        const secciones = curso?.secciones || [];

        const toPlano = (si, ci) => {
            let idx = 0;
            for (let s = 0; s < si; s++) idx += secciones[s]?.contenidos?.length || 0;
            return idx + ci;
        };

        const idxActual = toPlano(seccionIdx, contenidoIdx);
        const idxDestino = toPlano(si, ci);

        // Siempre puede ir hacia atrás
        if (idxDestino <= idxActual) {
            setSeccionIdx(si);
            setContenidoIdx(ci);
            return;
        }

        // Para ir hacia adelante: el actual debe estar visto y sin test pendiente
        if (!marcadoEnSesion || testPendiente) return;

        // Solo puede avanzar al inmediato siguiente, no saltar
        if (idxDestino > idxActual + 1) return;

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