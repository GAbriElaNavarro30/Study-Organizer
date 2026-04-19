import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function formatearFechaHora(fechaRaw) {
    const fecha = new Date(fechaRaw);
    const fechaStr = fecha.toLocaleDateString("es-MX", {
        day: "2-digit", month: "2-digit", year: "numeric",
    });
    const horaStr = fecha.toLocaleTimeString("es-MX", {
        hour: "2-digit", minute: "2-digit",
    });
    return `${fechaStr} · ${horaStr}`;
}

export function useDashboard() {
    const { usuario, refrescarUsuario } = useContext(AuthContext);

    // ══ 1. ESTADOS ══
    const [modalOtraVisible, setModalOtraVisible] = useState(false);
    const [pendienteRegistro, setPendienteRegistro] = useState(null);
    const [emociones, setEmociones] = useState([]);
    const [emocionSeleccionada, setEmocionSeleccionada] = useState(null);
    const [historial, setHistorial] = useState([]);
    const [fraseHoy, setFraseHoy] = useState(null);
    const [mostrarAlertaFrase, setMostrarAlertaFrase] = useState(false);
    const [vark, setVark] = useState(null);
    const [estudio, setEstudio] = useState(null);
    const [cargandoVark, setCargandoVark] = useState(true);
    const [cargandoMe, setCargandoMe] = useState(true);
    const [cursosEstudiante, setCursosEstudiante] = useState([]);
    const [hoy, setHoy] = useState(
        new Date().toLocaleDateString("sv-SE", { timeZone: "America/Mexico_City" })
    );
    const [mostrarAlertaEspecialista, setMostrarAlertaEspecialista] = useState(false);
    const [alertasEspecialista, setAlertasEspecialista] = useState([]);

    // ══ 2. DERIVACIONES ══
    const emocionHoy = historial.find(h => h.fecha === hoy) || null;

    const mostrarAlerta = (() => {
        const sorted = [...historial].sort((a, b) => a.fecha > b.fecha ? -1 : 1).slice(0, 3);
        return sorted.length >= 3 && sorted.every(h => h.clasif === "negativa");
    })();

    // ══ 3. FUNCIONES ══
    const seleccionarEmocion = (id_emocion, label, clasif) => {
        if (emocionHoy) return;
        setPendienteRegistro({ id_emocion, label, clasif });
    };

    const confirmarRegistro = async (nivel) => {
        if (!pendienteRegistro) return;
        const { id_emocion, label, clasif } = pendienteRegistro;

        try {
            const res = await fetch("http://localhost:3000/dashboard/emociones/registrar-dia", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_emocion, nivel }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.mensaje);
                setPendienteRegistro(null);
                return;
            }

            setHistorial(prev => [...prev, { fecha: hoy, emo: label, clasif, nivel }]);
            setEmocionSeleccionada(label);
            setPendienteRegistro(null);

            if (data.frase) {
                setFraseHoy(data.frase);
                setMostrarAlertaFrase(data.mostrar_alerta_frase ?? false);
            }

            if (data.mostrar_alerta_especialista) {
                const resAlertas = await fetch("http://localhost:3000/dashboard/alertas", {
                    credentials: "include",
                });
                if (resAlertas.ok) {
                    const dataAlertas = await resAlertas.json();
                    setAlertasEspecialista(dataAlertas.alertas || []);
                }
                setMostrarAlertaEspecialista(true);
            }

        } catch (error) {
            console.error("Error al registrar emoción:", error);
        }
    };

    const handleNuevaEmocionGuardada = ({ label, clasif, id }) => {
        setEmociones(prev => [...prev, { label, clasif, id_emocion: id }]);
        setPendienteRegistro({ id_emocion: id, label, clasif });
        setModalOtraVisible(false);
    };

    const cerrarAlertaEspecialista = async () => {
        setMostrarAlertaEspecialista(false);
        const alertaNoVista = alertasEspecialista.find(a => !a.vista);
        if (alertaNoVista) {
            try {
                await fetch(`http://localhost:3000/dashboard/alertas/${alertaNoVista.id_alerta}/vista`, {
                    method: "PATCH",
                    credentials: "include",
                });
                setAlertasEspecialista(prev =>
                    prev.map(a =>
                        a.id_alerta === alertaNoVista.id_alerta ? { ...a, vista: true } : a
                    )
                );
            } catch (error) {
                console.error("Error al marcar alerta como vista:", error);
            }
        }
    };

    // ══ 4. EFECTOS ══
    useEffect(() => { refrescarUsuario(); }, []);
    useEffect(() => { window.scrollTo(0, 0); }, []);

    useEffect(() => {
        if (!emocionHoy) return;
        const cargarFrase = async () => {
            try {
                const res = await fetch("http://localhost:3000/dashboard/frase-hoy", {
                    credentials: "include",
                });
                if (!res.ok) return;
                const data = await res.json();
                if (data.frase) setFraseHoy(data.frase);
            } catch (error) {
                console.error("Error al cargar frase del día:", error);
            }
        };
        cargarFrase();
    }, [emocionHoy]);

    useEffect(() => {
        const verificar = async () => {
            try {
                const res = await fetch("http://localhost:3000/dashboard/emociones/verificar-hoy", {
                    credentials: "include",
                });
                if (!res.ok) return;
                const data = await res.json();
                if (data.registrado) {
                    setHistorial(prev => {
                        const yaEsta = prev.find(h => h.fecha === hoy);
                        if (yaEsta) return prev;
                        return [...prev, {
                            fecha: hoy,
                            emo: data.emocion,
                            clasif: data.categoria,
                            nivel: data.nivel,
                        }];
                    });
                }
            } catch (error) {
                console.error("Error al verificar registro de hoy:", error);
            }
        };
        verificar();
    }, []);

    useEffect(() => {
        const cargarHistorial = async () => {
            try {
                const res = await fetch("http://localhost:3000/dashboard/emociones/historial", {
                    credentials: "include",
                });
                if (!res.ok) return;
                const data = await res.json();
                const normalizado = data.historial.map(h => ({
                    fecha: h.fecha_registro.slice(0, 10),
                    emo: h.nombre_emocion,
                    clasif: h.categoria,
                    nivel: h.nivel ?? "medio",
                }));
                setHistorial(normalizado);
            } catch (error) {
                console.error("Error al cargar historial:", error);
            }
        };
        cargarHistorial();
    }, []);

    useEffect(() => {
        const cargar = async () => {
            try {
                const res = await fetch("http://localhost:3000/dashboard/obtener-emociones", {
                    credentials: "include",
                });
                if (!res.ok) return;
                const data = await res.json();
                setEmociones(data.emociones.map(e => ({
                    label: e.nombre_emocion,
                    clasif: e.categoria,
                    id_emocion: e.id_emocion,
                })));
            } catch (error) {
                console.error("Error al cargar emociones:", error);
            }
        };
        cargar();
    }, []);

    useEffect(() => {
        const calcularMsHastaMedianoche = () => {
            const ahora = new Date();
            const manana = new Date();
            manana.setDate(ahora.getDate() + 1);
            manana.setHours(0, 0, 0, 0);
            return manana - ahora;
        };

        const timeout = setTimeout(() => {
            setHoy(new Date().toLocaleDateString("sv-SE", { timeZone: "America/Mexico_City" }));
            setEmocionSeleccionada(null);
            setPendienteRegistro(null);
            setFraseHoy(null);
        }, calcularMsHastaMedianoche());

        return () => clearTimeout(timeout);
    }, [hoy]);

    useEffect(() => {
        const cargar = async () => {
            try {
                const res = await fetch("http://localhost:3000/cursos/inscripciones/mis-cursos-resultados", {
                    credentials: "include",
                });
                if (!res.ok) return;
                const data = await res.json();
                setCursosEstudiante(data.cursos || []);
            } catch (error) {
                console.error("Error al cargar cursos:", error);
            }
        };
        cargar();
    }, []);

    useEffect(() => {
        const cargar = async () => {
            try {
                const res = await fetch("http://localhost:3000/estilosaprendizaje/resultado-guardado", {
                    credentials: "include",
                });
                if (!res.ok) return;
                const data = await res.json();
                setVark({
                    fecha: formatearFechaHora(data.fecha_intento),
                    resultado: data.nombre_perfil,
                    detalle: {
                        visual: data.porcentajes.v,
                        auditivo: data.porcentajes.a,
                        lector: data.porcentajes.r,
                        kinestesico: data.porcentajes.k,
                    },
                });
            } catch (error) {
                console.error("Error al cargar resultado VARK:", error);
            } finally {
                setCargandoVark(false);
            }
        };
        cargar();
    }, []);

    useEffect(() => {
        const cargar = async () => {
            try {
                const res = await fetch("http://localhost:3000/metodosestudio/ultimo-resultado", {
                    credentials: "include",
                });
                if (!res.ok) return;
                const data = await res.json();
                setEstudio({
                    fecha: formatearFechaHora(data.fecha_intento),
                    resultado: data.nivel_global,
                    compatibilidad: Math.round(data.puntaje_global),
                    dimensiones: data.resultados_por_dimension,
                });
            } catch (error) {
                console.error("Error al cargar resultado ME:", error);
            } finally {
                setCargandoMe(false);
            }
        };
        cargar();
    }, []);

    useEffect(() => {
        const cargarAlertas = async () => {
            try {
                const res = await fetch("http://localhost:3000/dashboard/alertas", {
                    credentials: "include",
                });
                if (!res.ok) return;
                const data = await res.json();
                setAlertasEspecialista(data.alertas || []);
            } catch (error) {
                console.error("Error al cargar alertas:", error);
            }
        };
        cargarAlertas();
    }, []);

    return {
        // auth
        usuario,
        // estados UI
        modalOtraVisible,
        setModalOtraVisible,
        pendienteRegistro,
        setPendienteRegistro,
        emocionSeleccionada,
        // datos
        emociones,
        historial,
        fraseHoy,
        mostrarAlertaFrase,
        vark,
        estudio,
        cargandoVark,
        cargandoMe,
        cursosEstudiante,
        alertasEspecialista,
        // modales
        mostrarAlertaEspecialista,
        // derivaciones
        emocionHoy,
        mostrarAlerta,
        // funciones
        seleccionarEmocion,
        confirmarRegistro,
        handleNuevaEmocionGuardada,
        cerrarAlertaEspecialista,
    };
}