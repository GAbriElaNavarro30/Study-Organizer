// src/hooks/useCursoVisor.js
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api.js";

export function useCursoVisor() {
    const { state } = useLocation();
    const id = state?.id_curso;
    const navigate = useNavigate();

    const [curso, setCurso] = useState(null);

    // contenidosVistosIniciales: los que ya venían vistos del servidor al cargar.
    // Solo se usan para saber si mostrar el badge "Ya viste este contenido".
    // NO se usan para el cálculo del progreso de la sesión actual.
    const [contenidosVistosIniciales, setContenidosVistosIniciales] = useState(new Set());

    // contenidosVistos: los marcados como vistos EN ESTA SESIÓN.
    // Se agregan al avanzar y se quitan al retroceder con "Anterior".
    const [contenidosVistos, setContenidosVistos] = useState(new Set());

    const [cargando, setCargando] = useState(true);
    const [animado, setAnimado] = useState(false);
    const [seccionIdx, setSeccionIdx] = useState(0);
    const [contenidoIdx, setContenidoIdx] = useState(0);
    const [sidebarAbierto, setSidebarAbierto] = useState(true);

    // ── Test ──
    const [modoTest, setModoTest] = useState(false);
    const [respuestas, setRespuestas] = useState({});
    const [resultadoTest, setResultadoTest] = useState(null);

    useEffect(() => {
        if (!id) { navigate("/cursos"); return; }
        cargar();
        window.scrollTo(0, 0);
    }, [id]);

    // Resetear test al cambiar de sección/contenido
    useEffect(() => {
        setModoTest(false);
        setRespuestas({});
        setResultadoTest(null);
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

            const vistosDelServidor = new Set(data.progreso?.contenidos_vistos || []);

            // Guardamos los vistos del servidor solo para el badge informativo
            setContenidosVistosIniciales(vistosDelServidor);

            // La sesión actual arranca vacía — el progreso se construye conforme avanza
            setContenidosVistos(new Set());

            // Ir al primer contenido no visto
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

    // ── Progreso calculado 100% en el frontend ──
    // Cuenta solo los contenidos vistos en esta sesión.
    // Al retroceder con "Anterior" se quitan del Set y el % baja al instante.
    const progreso = useMemo(() => {
        if (!curso?.secciones) {
            return { vistos: 0, total: 0, porcentaje: 0, completado: false };
        }

        const total = curso.secciones.reduce(
            (acc, s) => acc + (s.contenidos?.length || 0), 0
        );
        const vistos = contenidosVistos.size;
        const porcentaje = total > 0 ? Math.round((vistos / total) * 100) : 0;

        return {
            vistos,
            total,
            porcentaje,
            completado: vistos >= total && total > 0,
        };
    }, [curso, contenidosVistos]);

    const seccionActual = curso?.secciones?.[seccionIdx];
    const contenidoActual = seccionActual?.contenidos?.[contenidoIdx];
    const preguntasActuales = seccionActual?.preguntas || [];

    // ── Marcar visto ──
    // Agrega al Set de sesión y persiste en back-end en segundo plano.
    const marcarVisto = useCallback((id_contenido) => {
        if (!id_contenido || contenidosVistos.has(id_contenido)) return;

        setContenidosVistos(prev => new Set([...prev, id_contenido]));

        api.post(`/cursos/progreso/${id_contenido}`, { id_curso: id })
            .catch(() => { /* silencioso */ });

    }, [contenidosVistos, id]);

    // ── Seleccionar respuesta ──
    const seleccionarRespuesta = (id_test, id_opcion) => {
        setRespuestas(prev => ({ ...prev, [id_test]: id_opcion }));
    };

    // ── Enviar test — calcula resultado local y persiste en BD ──
    const enviarTest = async () => {
        let correctas = 0;
        for (const pregunta of preguntasActuales) {
            const opcionElegida = pregunta.opciones?.find(
                o => o.id_opcion === respuestas[pregunta.id_test]
            );
            if (opcionElegida?.es_correcta) correctas++;
        }

        setResultadoTest({ correctas, total: preguntasActuales.length });

        api.post("/cursos/test/respuestas", {
            id_curso: id,
            respuestas: Object.entries(respuestas).map(([id_test, id_opcion]) => ({
                id_test: Number(id_test),
                id_opcion: Number(id_opcion),
            })),
        }).catch(() => { /* silencioso */ });
    };

    const reiniciarTest = () => {
        setRespuestas({});
        setResultadoTest(null);
    };

    const irASiguiente = () => {
        const secciones = curso?.secciones || [];
        const contenidos = secciones[seccionIdx]?.contenidos || [];
        if (contenidoIdx < contenidos.length - 1) {
            setContenidoIdx(ci => ci + 1);
        } else if (seccionIdx < secciones.length - 1) {
            setSeccionIdx(si => si + 1);
            setContenidoIdx(0);
        }
    };

    // ── Ir atrás: quita el contenido actual del Set de vistos ──
    // Así el porcentaje baja correctamente al retroceder.
    const irAAnterior = () => {
        // Quitar el contenido actual de vistos antes de moverse
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

    const secciones = curso?.secciones || [];
    const hayAnterior = seccionIdx > 0 || contenidoIdx > 0;
    const haysSiguiente =
        seccionIdx < secciones.length - 1 ||
        contenidoIdx < (secciones[seccionIdx]?.contenidos?.length || 1) - 1;

    return {
        curso,
        progreso,
        contenidosVistos,
        contenidosVistosIniciales,  // ← para el badge "Ya viste este contenido"
        cargando,
        animado,
        seccionIdx,
        contenidoIdx,
        seccionActual,
        contenidoActual,
        preguntasActuales,
        sidebarAbierto,
        setSidebarAbierto,
        hayAnterior,
        haysSiguiente,
        totalContenidos: progreso.total,
        modoTest, setModoTest,
        respuestas,
        resultadoTest,
        seleccionarRespuesta,
        enviarTest,
        reiniciarTest,
        marcarVisto,
        irASiguiente,
        irAAnterior,
        irAContenido,
        navigate,
    };
}