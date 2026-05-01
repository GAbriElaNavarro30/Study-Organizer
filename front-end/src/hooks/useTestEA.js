// src/hooks/useTestEA.js
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js"; // axios 
 
// ─── DATOS ───────────────────────────────────────────────────────────────────
// Los id de cada opción deben coincidir con los id reales en Opcion_VARK de la BD

export const PREGUNTAS = [
    {
        id: 1,
        texto: "¿Cómo prefieres recibir instrucciones para llegar a un lugar?",
        opciones: [
            { id: 1,  texto: "Veo un mapa o diagrama del recorrido", cat: "V" },
            { id: 2,  texto: "Alguien me lo explica verbalmente o escucho indicaciones", cat: "A" },
            { id: 3,  texto: "Leo las instrucciones escritas paso a paso", cat: "R" },
            { id: 4,  texto: "Recorro el camino yo mismo hasta aprenderlo", cat: "K" },
        ],
    },
    {
        id: 2,
        texto: "Cuando aprendes a usar un programa nuevo, ¿qué prefieres?",
        opciones: [
            { id: 5,  texto: "Ver tutoriales en video con capturas de pantalla", cat: "V" },
            { id: 6,  texto: "Escuchar a alguien explicarme cómo funciona", cat: "A" },
            { id: 7,  texto: "Leer el manual o la documentación del programa", cat: "R" },
            { id: 8,  texto: "Probarlo directamente y aprender con la práctica", cat: "K" },
        ],
    },
    {
        id: 3,
        texto: "Si tienes que recordar una lista de cosas, ¿qué haces?",
        opciones: [
            { id: 9,  texto: "Hago una lista visual o mapa mental con colores", cat: "V" },
            { id: 10, texto: "Las repito en voz alta varias veces", cat: "A" },
            { id: 11, texto: "Las escribo en un papel o cuaderno", cat: "R" },
            { id: 12, texto: "Las asocio con acciones o movimientos que puedo hacer", cat: "K" },
        ],
    },
    {
        id: 4,
        texto: "¿Cómo prefieres que te expliquen un tema difícil?",
        opciones: [
            { id: 13, texto: "Con gráficas, esquemas o imágenes ilustrativas", cat: "V" },
            { id: 14, texto: "Con una explicación oral detallada o un podcast", cat: "A" },
            { id: 15, texto: "Con textos, artículos o apuntes bien redactados", cat: "R" },
            { id: 16, texto: "Con ejemplos prácticos y ejercicios que pueda realizar", cat: "K" },
        ],
    },
    {
        id: 5,
        texto: "Cuando estudias para un examen, ¿qué método usas más?",
        opciones: [
            { id: 17, texto: "Reviso diagramas, mapas conceptuales y esquemas visuales", cat: "V" },
            { id: 18, texto: "Escucho grabaciones de clase o explico en voz alta", cat: "A" },
            { id: 19, texto: "Leo mis apuntes y resumo la información en texto", cat: "R" },
            { id: 20, texto: "Hago ejercicios, resuelvo problemas o practico casos", cat: "K" },
        ],
    },
    {
        id: 6,
        texto: "Si tienes un problema, ¿cómo sueles resolverlo?",
        opciones: [
            { id: 21, texto: "Visualizo el problema y busco patrones o diagramas", cat: "V" },
            { id: 22, texto: "Lo hablo con alguien o lo pienso en voz alta", cat: "A" },
            { id: 23, texto: "Investigo y leo sobre el tema antes de actuar", cat: "R" },
            { id: 24, texto: "Lo intento directamente y aprendo del ensayo y error", cat: "K" },
        ],
    },
    {
        id: 7,
        texto: "¿Qué tipo de clases disfrutas más?",
        opciones: [
            { id: 25, texto: "Las que usan imágenes, videos y presentaciones visuales", cat: "V" },
            { id: 26, texto: "Las que incluyen debates, exposiciones o discusiones orales", cat: "A" },
            { id: 27, texto: "Las que tienen lecturas, ensayos y materiales escritos", cat: "R" },
            { id: 28, texto: "Las que tienen actividades prácticas, talleres o laboratorios", cat: "K" },
        ],
    },
    {
        id: 8,
        texto: "Cuando compras algo nuevo, ¿qué haces primero?",
        opciones: [
            { id: 29, texto: "Reviso fotos, videos o imágenes del producto", cat: "V" },
            { id: 30, texto: "Pregunto a alguien que ya lo haya usado o busco reseñas en audio", cat: "A" },
            { id: 31, texto: "Leo las instrucciones o las especificaciones técnicas", cat: "R" },
            { id: 32, texto: "Lo pruebo directamente para ver cómo funciona", cat: "K" },
        ],
    },
    {
        id: 9,
        texto: "¿Cómo prefieres que sea una presentación en clase?",
        opciones: [
            { id: 33, texto: "Con muchas imágenes, gráficos y recursos visuales", cat: "V" },
            { id: 34, texto: "Con una buena explicación oral y espacio para preguntas", cat: "A" },
            { id: 35, texto: "Con diapositivas con texto claro y referencias para leer después", cat: "R" },
            { id: 36, texto: "Con demostraciones en vivo y actividades para participar", cat: "K" },
        ],
    },
    {
        id: 10,
        texto: "Si tuvieras que enseñarle algo a alguien, ¿cómo lo harías?",
        opciones: [
            { id: 37, texto: "Dibujando esquemas, mapas o imágenes explicativas", cat: "V" },
            { id: 38, texto: "Explicándoselo en voz alta con ejemplos orales", cat: "A" },
            { id: 39, texto: "Escribiendo un resumen o guía que pueda leer", cat: "R" },
            { id: 40, texto: "Haciéndolo practicar directamente con ejercicios", cat: "K" },
        ],
    },
    {
        id: 11,
        texto: "Cuando visitas un lugar nuevo, ¿cómo lo recuerdas mejor?",
        opciones: [
            { id: 41, texto: "Por las imágenes y el aspecto visual del lugar", cat: "V" },
            { id: 42, texto: "Por los sonidos, conversaciones o música del ambiente", cat: "A" },
            { id: 43, texto: "Por el nombre del lugar y detalles que anoté", cat: "R" },
            { id: 44, texto: "Por las sensaciones y experiencias que viví ahí", cat: "K" },
        ],
    },
    {
        id: 12,
        texto: "¿Qué te ayuda más a concentrarte al estudiar?",
        opciones: [
            { id: 45, texto: "Tener un espacio ordenado con colores y organización visual", cat: "V" },
            { id: 46, texto: "Escuchar música suave o estar en un ambiente con sonido controlado", cat: "A" },
            { id: 47, texto: "Tener mis apuntes bien organizados y leer en silencio", cat: "R" },
            { id: 48, texto: "Cambiar de postura, caminar o tomar descansos activos", cat: "K" },
        ],
    },
    {
        id: 13,
        texto: "Cuando algo no te queda claro, ¿qué haces?",
        opciones: [
            { id: 49, texto: "Busco un video o imagen que lo explique visualmente", cat: "V" },
            { id: 50, texto: "Le pido a alguien que me lo explique con sus palabras", cat: "A" },
            { id: 51, texto: "Busco más textos, artículos o apuntes sobre el tema", cat: "R" },
            { id: 52, texto: "Intento aplicarlo en un ejemplo práctico hasta entenderlo", cat: "K" },
        ],
    },
    {
        id: 14,
        texto: "¿Cómo prefieres recibir retroalimentación de un trabajo?",
        opciones: [
            { id: 53, texto: "Con anotaciones visuales, gráficas o subrayados en el documento", cat: "V" },
            { id: 54, texto: "En una conversación donde me expliquen verbalmente", cat: "A" },
            { id: 55, texto: "Con comentarios escritos detallados en mi trabajo", cat: "R" },
            { id: 56, texto: "Con una demostración de cómo mejorar lo que hice", cat: "K" },
        ],
    },
    {
        id: 15,
        texto: "Al planificar tus actividades, ¿cómo lo haces?",
        opciones: [
            { id: 57, texto: "Uso un calendario visual, tablero o mapa de actividades", cat: "V" },
            { id: 58, texto: "Me digo a mí mismo o comento con alguien mis planes del día", cat: "A" },
            { id: 59, texto: "Escribo una lista detallada de tareas en papel o app de notas", cat: "R" },
            { id: 60, texto: "Simplemente empiezo a hacer las cosas más urgentes", cat: "K" },
        ],
    },
    {
        id: 16,
        texto: "¿Qué tipo de material de estudio prefieres?",
        opciones: [
            { id: 61, texto: "Infografías, mapas mentales y material con muchas imágenes", cat: "V" },
            { id: 62, texto: "Podcasts, audiolibros o videos con buena explicación oral", cat: "A" },
            { id: 63, texto: "Libros, artículos, apuntes y resúmenes escritos", cat: "R" },
            { id: 64, texto: "Guías de ejercicios, casos prácticos y simulaciones", cat: "K" },
        ],
    },
];

export const SELECTED_COLOR = "#1C5A90";
export const SELECTED_BG    = "#E0EEF9";
export const LETRAS         = ["A", "B", "C", "D"];

// ─── HOOK ────────────────────────────────────────────────────────────────────

export function useTestEA() {
    const navigate = useNavigate();

    // ── Estado ──
    const [respuestas, setRespuestas]                = useState({});
    const [actual, setActual]                         = useState(0);
    const [muted, setMuted]                           = useState(true);
    const [mostrarModal, setMostrarModal]             = useState(false);
    const [enviando, setEnviando]                     = useState(false);
    const [errorEnvio, setErrorEnvio]                 = useState(null);
    const [mostrarAlertExito, setMostrarAlertExito]   = useState(false);
    const [resultadoPendiente, setResultadoPendiente] = useState(null);

    // ── Referencias ──
    const iframeRef = useRef(null);
    const mainRef   = useRef(null);

    // ── Derivados ──
    const totalPreguntas  = PREGUNTAS.length;
    const respondidas     = Object.keys(respuestas).length;
    const progreso        = Math.round((respondidas / totalPreguntas) * 100);
    const preguntaActual  = PREGUNTAS[actual];
    const seleccionActual = respuestas[preguntaActual.id] || [];
    const todasRespondidas = respondidas === totalPreguntas;

    // ── Música ──
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

    // ── Seleccionar opción ──
    const seleccionar = (opcionIndex) => {
        setRespuestas((prev) => {
            const seleccionadas  = prev[preguntaActual.id] || [];
            const yaSeleccionada = seleccionadas.includes(opcionIndex);
            const nuevas = yaSeleccionada
                ? seleccionadas.filter((i) => i !== opcionIndex)
                : [...seleccionadas, opcionIndex];
            if (nuevas.length === 0) {
                const { [preguntaActual.id]: _, ...resto } = prev;
                return resto;
            }
            return { ...prev, [preguntaActual.id]: nuevas };
        });
    };

    // ── Navegación ──
    const irA      = (index) => { setActual(index); mainRef.current?.scrollTo({ top: 0, behavior: "smooth" }); };
    const siguiente = () => { if (actual < totalPreguntas - 1) irA(actual + 1); };
    const anterior  = () => { if (actual > 0) irA(actual - 1); };

    // ── Enviar al backend ──
    const enviar = async () => {
        setEnviando(true);
        setErrorEnvio(null);

        try {
            // Construir array con id_opcion y categoria de cada respuesta marcada
            const respuestasArray = PREGUNTAS.flatMap((pregunta) => {
                const indices = respuestas[pregunta.id] || [];
                return indices.map((opcionIndex) => ({
                    id_opcion: pregunta.opciones[opcionIndex].id,
                    categoria: pregunta.opciones[opcionIndex].cat,
                }));
            });

            // 1. Guardar respuestas en BDredponder
            const { data: saveData } = await api.post(
                "/estilosaprendizaje/responder",
                { respuestas: respuestasArray }
            );

            // 2. Obtener resultado del sistema experto de ese intento en especifico
            const { data: resultado } = await api.get(
                `/estilosaprendizaje/resultado?id_intento=${saveData.id_intento}`
            );

            setResultadoPendiente(resultado);
            setMostrarAlertExito(true);

        } catch (err) {
            setErrorEnvio(
                err.response?.data?.error ||
                err.message ||
                "Ocurrió un error al enviar el test. Intenta de nuevo."
            );
        } finally {
            setEnviando(false);
        }
    };

    // ── Handlers de modales y alertas ──
    const handleCerrarAlertExito = () => {
        setMostrarAlertExito(false);
        navigate("/resultados-test-estilos-aprendizaje", { state: resultadoPendiente });
    };

    const handleAbandonar = () => {
        setMostrarModal(false);
        navigate("/estilos-aprendizaje");
    };

    // ── Scroll al inicio al montar ──
    useEffect(() => { window.scrollTo(0, 0); }, []);

    return {
        // Referencias
        iframeRef,
        mainRef,

        // Estado
        respuestas,
        actual,
        muted,
        mostrarModal, setMostrarModal,
        enviando,
        errorEnvio,
        mostrarAlertExito,
        resultadoPendiente,

        // Derivados
        totalPreguntas,
        respondidas,
        progreso,
        preguntaActual,
        seleccionActual,
        todasRespondidas,

        // Handlers
        toggleMute,
        seleccionar,
        irA,
        siguiente,
        anterior,
        enviar,
        handleCerrarAlertExito,
        handleAbandonar,
    };
} 