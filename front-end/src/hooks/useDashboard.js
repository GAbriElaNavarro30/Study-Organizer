import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

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
    const [alertData, setAlertData] = useState({ visible: false, type: "success", title: "", message: "" });

    // ══ 2. DERIVACIONES ══
    const emocionHoy = historial.find(h => h.fecha === hoy) || null;

    const mostrarAlerta = (() => {
        const sorted = [...historial].sort((a, b) => a.fecha > b.fecha ? -1 : 1).slice(0, 3);
        return sorted.length >= 3 && sorted.every(h => h.clasif === "negativa");
    })();

    const showAlert = (type, title, message) => {
        setAlertData({ visible: true, type, title, message });
    };

    const handleCloseAlert = () => {
        setAlertData(prev => ({ ...prev, visible: false }));
    };

    // ══ 3. FUNCIONES ══
    const seleccionarEmocion = (id_emocion, label, clasif) => {
        if (emocionHoy) return;
        setPendienteRegistro({ id_emocion, label, clasif });
    };

    const confirmarRegistro = async (nivel) => {
        if (!pendienteRegistro) return;
        const { id_emocion, label, clasif } = pendienteRegistro;

        try {
            const { data } = await api.post("/dashboard/emociones/registrar-dia", {
                id_emocion,
                nivel,
            });

            setHistorial(prev => [...prev, { fecha: hoy, emo: label, clasif, nivel }]);
            setEmocionSeleccionada(label);
            setPendienteRegistro(null);

            // ALERTA DE ÉXITO AL REGISTRAR EMOCIÓN
            showAlert("success", "¡Emoción registrada!", `Tu emoción de hoy es: ${label}`);

            if (data.frase) {
                setFraseHoy(data.frase);
                setMostrarAlertaFrase(data.mostrar_alerta_frase ?? false);
            }

            if (data.mostrar_alerta_especialista) {
                try {
                    const { data: dataAlertas } = await api.get("/dashboard/alertas");
                    setAlertasEspecialista(dataAlertas.alertas || []);
                } catch (error) {
                    console.error("Error al cargar alertas:", error);
                }
                setMostrarAlertaEspecialista(true);
            }

        } catch (error) {
            const data = error.response?.data;
            showAlert("error", "Error", data?.mensaje || "Error al registrar emoción.");
            setPendienteRegistro(null);
        }
    };

    const handleNuevaEmocionGuardada = ({ label, clasif, id }) => {
        setEmociones(prev => [...prev, { label, clasif, id_emocion: id }]);
        setPendienteRegistro({ id_emocion: id, label, clasif });
        setModalOtraVisible(false);

        // ALERTA DE ÉXITO AL CREAR NUEVA EMOCIÓN
        showAlert("success", "¡Emoción creada!", `"${label}" fue agregada a tu lista.`);
    };

    const cerrarAlertaEspecialista = async () => {
        setMostrarAlertaEspecialista(false);
        const alertaNoVista = alertasEspecialista.find(a => !a.vista);
        if (alertaNoVista) {
            try {
                await api.patch(`/dashboard/alertas/${alertaNoVista.id_alerta}/vista`);
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
                const { data } = await api.get("/dashboard/frase-hoy");
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
                const { data } = await api.get("/dashboard/emociones/verificar-hoy");
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
                const { data } = await api.get("/dashboard/emociones/historial");
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
                const { data } = await api.get("/dashboard/obtener-emociones");
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
                const { data } = await api.get("/cursos/inscripciones/mis-cursos-resultados");
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
                const { data } = await api.get("/estilosaprendizaje/resultado-guardado");
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
                const { data } = await api.get("/metodosestudio/ultimo-resultado");
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
                const { data } = await api.get("/dashboard/alertas");
                setAlertasEspecialista(data.alertas || []);
            } catch (error) {
                console.error("Error al cargar alertas:", error);
            }
        };
        cargarAlertas();
    }, []);

    return {
        usuario,
        modalOtraVisible,
        setModalOtraVisible,
        pendienteRegistro,
        setPendienteRegistro,
        emocionSeleccionada,
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
        mostrarAlertaEspecialista,
        emocionHoy,
        mostrarAlerta,
        seleccionarEmocion,
        confirmarRegistro,
        handleNuevaEmocionGuardada,
        cerrarAlertaEspecialista,
        alertData,
        handleCloseAlert,
    };
}