import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function useEditorNota() {
    const navigate = useNavigate();
    const editorRef = useRef(null);

    // ── Datos de la nota ──
    const [titulo, setTitulo] = useState("");
    const [notaId, setNotaId] = useState(null);
    const [notas, setNotas] = useState([]);

    // ── Formato ──
    const [fontFamily, setFontFamily] = useState("Arial");
    const [fontSize, setFontSize] = useState("16");
    const [editorBackgroundColor, setEditorBackgroundColor] = useState("#ffffff");

    // ── Modales ──
    const [mostrarModalSalir, setMostrarModalSalir] = useState(false);
    const [mostrarModalGuardar, setMostrarModalGuardar] = useState(false);
    const [modoGuardar, setModoGuardar] = useState("editar");

    // ── Alertas ──
    const [mostrarAlert, setMostrarAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ type: "success", title: "", message: "" });
    const [shouldRedirectOnAlertClose, setShouldRedirectOnAlertClose] = useState(false);

    // ── Voz ──
    const [isRecording, setIsRecording] = useState(false);
    const [recognition, setRecognition] = useState(null);
    const recognitionTimeoutRef = useRef(null);

    // ── Detección de cambios ──
    const [contenidoInicial, setContenidoInicial] = useState("");
    const [tituloInicial, setTituloInicial] = useState("");

    /* ────────────────────────────────────────────
       HELPER ALERTAS
    ──────────────────────────────────────────── */
    const mostrarAlerta = (type, title, message) => {
        setAlertConfig({ type, title, message });
        setMostrarAlert(true);
    };

    /* ────────────────────────────────────────────
       CARGAR DATOS AL INICIAR
    ──────────────────────────────────────────── */
    useEffect(() => {
        const savedData = localStorage.getItem("editorNota");

        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                if (data.titulo) setTitulo(data.titulo);
                if (data.contenido && editorRef.current) {
                    editorRef.current.innerHTML = data.contenido;
                    setContenidoInicial(data.contenido);
                }
                if (data.backgroundColor) setEditorBackgroundColor(data.backgroundColor);
                if (data.fontFamily) setFontFamily(data.fontFamily);
                if (data.fontSize) setFontSize(data.fontSize);
                if (data.notaId) setNotaId(data.notaId);
                setTituloInicial(data.titulo || "");
            } catch (error) {
                console.error("Error al cargar datos:", error);
            }
        } else {
            setTitulo("");
            setNotaId(null);
            setFontFamily("Arial");
            setFontSize("16");
            setEditorBackgroundColor("#ffffff");
            setContenidoInicial("");
            setTituloInicial("");
            if (editorRef.current) editorRef.current.innerHTML = "";
        }
    }, []);

    /* ────────────────────────────────────────────
       AUTOGUARDADO CADA 2 SEGUNDOS
    ──────────────────────────────────────────── */
    useEffect(() => {
        const autoSaveInterval = setInterval(() => {
            if (editorRef.current) {
                const dataToSave = {
                    titulo,
                    contenido: editorRef.current.innerHTML,
                    backgroundColor: editorBackgroundColor,
                    fontFamily,
                    fontSize,
                    notaId,
                    lastSaved: new Date().toISOString(),
                };
                localStorage.setItem("editorNota", JSON.stringify(dataToSave));
            }
        }, 2000);

        return () => clearInterval(autoSaveInterval);
    }, [titulo, editorBackgroundColor, fontFamily, fontSize, notaId]);

    /* ────────────────────────────────────────────
       RECONOCIMIENTO DE VOZ
    ──────────────────────────────────────────── */
    useEffect(() => {
        if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognitionInstance = new SpeechRecognition();

            recognitionInstance.continuous = true;
            recognitionInstance.interimResults = true;
            recognitionInstance.lang = "es-ES";
            recognitionInstance.maxAlternatives = 1;

            recognitionInstance.onstart = () => {
                console.log("🎤 Reconocimiento de voz iniciado");
            };

            recognitionInstance.onresult = (event) => {
                if (!editorRef.current) return;
                let finalTranscript = "";

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) finalTranscript += transcript + " ";
                }

                if (finalTranscript) {
                    editorRef.current.focus();
                    const selection = window.getSelection();
                    const range = document.createRange();
                    range.selectNodeContents(editorRef.current);
                    range.collapse(false);
                    selection.removeAllRanges();
                    selection.addRange(range);
                    document.execCommand("insertText", false, finalTranscript);
                }

                if (recognitionTimeoutRef.current) clearTimeout(recognitionTimeoutRef.current);
            };

            recognitionInstance.onerror = (event) => {
                console.error("❌ Error en reconocimiento de voz:", event.error);
                if (event.error === "no-speech") return;
                if (event.error === "aborted") { setIsRecording(false); return; }
                if (event.error === "network") {
                    mostrarAlerta("error", "Error de red", "Verifica tu conexión a internet.");
                    setIsRecording(false);
                }
            };

            recognitionInstance.onend = () => {
                if (isRecording) {
                    try {
                        recognitionInstance.start();
                    } catch (e) {
                        setIsRecording(false);
                    }
                } else {
                    setIsRecording(false);
                }
            };

            setRecognition(recognitionInstance);
        }

        return () => {
            if (recognition) {
                try { recognition.stop(); } catch (e) { /* ignore */ }
            }
            if (recognitionTimeoutRef.current) clearTimeout(recognitionTimeoutRef.current);
        };
    }, [isRecording]);

    /* ────────────────────────────────────────────
       CARGAR NOTAS
    ──────────────────────────────────────────── */
    useEffect(() => {
        cargarNotas();
    }, []);

    const cargarNotas = async () => {
        try {
            const response = await fetch("http://localhost:3000/notas/obtener-notas", {
                method: "GET",
                credentials: "include",
            });
            if (response.ok) {
                const data = await response.json();
                setNotas(data);
            }
        } catch (error) {
            console.error("Error al cargar notas:", error);
        }
    };

    /* ────────────────────────────────────────────
       DETECCIÓN DE CAMBIOS
    ──────────────────────────────────────────── */
    const hayaCambios = () => {
        const contenidoActual = editorRef.current?.innerHTML || "";
        return (
            contenidoActual.trim() !== contenidoInicial.trim() ||
            titulo.trim() !== tituloInicial.trim()
        );
    };

    /* ────────────────────────────────────────────
       APLICAR ESTILOS A SELECCIÓN
    ──────────────────────────────────────────── */
    const applyStyleToSelection = (styleProp, styleValue) => {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        const range = selection.getRangeAt(0);
        if (range.collapsed) return;

        editorRef.current?.focus();

        try {
            const startContainer = range.startContainer;
            const startOffset = range.startOffset;
            const endContainer = range.endContainer;
            const endOffset = range.endOffset;

            const applyStyleToNode = (node) => {
                if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== "") {
                    if (node.parentNode.nodeName === "SPAN") {
                        node.parentNode.style[styleProp] = styleValue;
                    } else {
                        const span = document.createElement("span");
                        span.style[styleProp] = styleValue;
                        const parent = node.parentNode;
                        parent.insertBefore(span, node);
                        span.appendChild(node);
                    }
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    if (
                        node.style &&
                        ["LI", "DIV", "P", "SPAN"].includes(node.nodeName)
                    ) {
                        node.style[styleProp] = styleValue;
                    }
                    Array.from(node.childNodes).forEach((child) => {
                        if (range.intersectsNode(child)) applyStyleToNode(child);
                    });
                }
            };

            const commonAncestor = range.commonAncestorContainer;
            if (commonAncestor.nodeType === Node.TEXT_NODE) {
                applyStyleToNode(commonAncestor);
            } else if (commonAncestor.nodeType === Node.ELEMENT_NODE) {
                Array.from(commonAncestor.childNodes).forEach((child) => {
                    if (range.intersectsNode(child)) applyStyleToNode(child);
                });
            }

            try {
                const newRange = document.createRange();
                newRange.setStart(startContainer, startOffset);
                newRange.setEnd(endContainer, endOffset);
                selection.removeAllRanges();
                selection.addRange(newRange);
            } catch (e) {
                const newRange = document.createRange();
                newRange.selectNodeContents(commonAncestor);
                selection.removeAllRanges();
                selection.addRange(newRange);
            }
        } catch (e) {
            console.error(`Error al aplicar ${styleProp}:`, e);
        }
    };

    /* ────────────────────────────────────────────
       FUNCIONES DE FORMATO
    ──────────────────────────────────────────── */
    const toggleBold = () => {
        editorRef.current?.focus();
        document.execCommand("bold");
    };

    const toggleItalic = () => {
        editorRef.current?.focus();
        document.execCommand("italic");
    };

    const toggleUnderline = () => {
        editorRef.current?.focus();
        document.execCommand("underline");
    };

    const handleTextAlign = (align) => {
        const commands = {
            left: "justifyLeft",
            center: "justifyCenter",
            right: "justifyRight",
            justify: "justifyFull",
        };
        editorRef.current?.focus();
        document.execCommand(commands[align]);
    };

    const insertList = () => {
        editorRef.current?.focus();
        document.execCommand("insertUnorderedList");
    };

    const insertOrderedList = () => {
        editorRef.current?.focus();
        document.execCommand("insertOrderedList");
    };

    const handleFontFamily = (font) => {
        editorRef.current?.focus();
        const selection = window.getSelection();
        if (!selection.rangeCount) { setFontFamily(font); return; }
        const range = selection.getRangeAt(0);
        if (!range.collapsed) {
            applyStyleToSelection("fontFamily", font);
        } else {
            setFontFamily(font);
        }
    };

    const handleFontSize = (size) => {
        editorRef.current?.focus();
        const selection = window.getSelection();
        if (!selection.rangeCount) { setFontSize(size); return; }
        const range = selection.getRangeAt(0);
        if (!range.collapsed) {
            applyStyleToSelection("fontSize", `${size}px`);
        } else {
            setFontSize(size);
        }
    };

    const handleTextColor = (color) => {
        editorRef.current?.focus();
        const selection = window.getSelection();
        if (selection.rangeCount && !selection.getRangeAt(0).collapsed) {
            applyStyleToSelection("color", color);
        }
    };

    const handleBackgroundColor = (color) => {
        setEditorBackgroundColor(color);
    };

    const handleHighlightColor = (color) => {
        editorRef.current?.focus();
        const selection = window.getSelection();
        if (selection.rangeCount && !selection.getRangeAt(0).collapsed) {
            applyStyleToSelection("backgroundColor", color);
        }
    };

    const removeHighlight = () => {
        const selection = window.getSelection();
        if (!selection.rangeCount) {
            mostrarAlerta("success", "Selecciona texto", "Selecciona el texto del cual quieres quitar el resaltado");
            return;
        }
        const range = selection.getRangeAt(0);
        if (range.collapsed) {
            mostrarAlerta("success", "Selecciona texto", "Selecciona el texto del cual quieres quitar el resaltado");
            return;
        }

        editorRef.current?.focus();

        try {
            const removeBackgroundFromElement = (element) => {
                if (element.nodeType === Node.ELEMENT_NODE) {
                    if (element.style?.backgroundColor) element.style.backgroundColor = "";
                    if (element.style && element.getAttribute("style") === "") {
                        element.removeAttribute("style");
                    }
                }
            };

            const processNode = (node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    removeBackgroundFromElement(node);
                    for (let i = 0; i < node.childNodes.length; i++) {
                        processNode(node.childNodes[i]);
                    }
                }
            };

            const commonAncestor = range.commonAncestorContainer;
            if (commonAncestor.nodeType === Node.ELEMENT_NODE) processNode(commonAncestor);

            let node = range.startContainer;
            while (node && node !== editorRef.current) {
                if (node.nodeType === Node.ELEMENT_NODE) removeBackgroundFromElement(node);
                node = node.parentNode;
            }
        } catch (e) {
            console.error("❌ Error al remover resaltado:", e);
            mostrarAlerta("error", "Error", "No se pudo remover el resaltado. Intenta nuevamente.");
        }
    };

    /* ────────────────────────────────────────────
       VOZ
    ──────────────────────────────────────────── */
    const handleVoiceInput = () => {
        if (!recognition) {
            mostrarAlerta("error", "No disponible", "Tu navegador no soporta reconocimiento de voz. Prueba con Chrome o Edge.");
            return;
        }
        if (isRecording) {
            try {
                recognition.stop();
                setIsRecording(false);
            } catch (e) {
                console.error("Error al detener:", e);
                setIsRecording(false);
            }
        } else {
            try {
                recognition.start();
                setIsRecording(true);
                editorRef.current?.focus();
            } catch (e) {
                console.error("Error al iniciar:", e);
                mostrarAlerta("error", "Error al iniciar", "No se pudo iniciar el dictado. Intenta nuevamente.");
            }
        }
    };

    /* ────────────────────────────────────────────
       GUARDADO
    ──────────────────────────────────────────── */
    const handleGuardarClick = () => {
        const contenidoTexto = editorRef.current?.innerText?.trim() || "";
        if (!contenidoTexto) {
            mostrarAlerta("error", "Contenido vacío", "El contenido de la nota es obligatorio. Por favor, escribe algo antes de guardar.");
            return;
        }
        setModoGuardar(titulo.trim() === "" ? "crear" : "editar");
        setMostrarModalGuardar(true);
    };

    const handleConfirmarGuardar = async (tituloNota) => {
        try {
            const endpoint = modoGuardar === "crear"
                ? "http://localhost:3000/notas/crear-nota"
                : `http://localhost:3000/notas/actualizar-nota/${notaId}`;
            const method = modoGuardar === "crear" ? "POST" : "PUT";

            const response = await fetch(endpoint, {
                method,
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    titulo: modoGuardar === "crear" ? tituloNota : titulo,
                    contenido: editorRef.current?.innerHTML,
                    backgroundColor: editorBackgroundColor,
                    fontFamily,
                    fontSize,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Error al guardar la nota");
            }

            setMostrarModalGuardar(false);
            localStorage.removeItem("editorNota");

            mostrarAlerta(
                "success",
                modoGuardar === "crear" ? "¡Nota creada!" : "¡Nota actualizada!",
                modoGuardar === "crear"
                    ? "Tu nota ha sido creada exitosamente."
                    : "Los cambios han sido guardados exitosamente."
            );
            setShouldRedirectOnAlertClose(true);
        } catch (error) {
            console.error("Error al guardar nota:", error);
            mostrarAlerta("error", "Error al guardar", error.message || "No se pudo guardar la nota. Por favor, intenta nuevamente.");
        }
    };

    const handleCloseAlert = () => {
        setMostrarAlert(false);
        if (shouldRedirectOnAlertClose) {
            setShouldRedirectOnAlertClose(false);
            navigate("/notas");
        }
    };

    /* ────────────────────────────────────────────
       VOLVER
    ──────────────────────────────────────────── */
    const handleVolverClick = () => {
        if (hayaCambios()) {
            setMostrarModalSalir(true);
        } else {
            if (isRecording && recognition) { recognition.stop(); setIsRecording(false); }
            navigate(-1);
        }
    };

    const handleConfirmarSalir = () => {
        if (isRecording && recognition) { recognition.stop(); setIsRecording(false); }
        setMostrarModalSalir(false);
        navigate(-1);
    };

    /* ────────────────────────────────────────────
       ATAJOS DE TECLADO
    ──────────────────────────────────────────── */
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "b") { e.preventDefault(); toggleBold(); }
            if ((e.ctrlKey || e.metaKey) && e.key === "i") { e.preventDefault(); toggleItalic(); }
            if ((e.ctrlKey || e.metaKey) && e.key === "u") { e.preventDefault(); toggleUnderline(); }
            if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); handleGuardarClick(); }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [titulo, notaId]);

    /* ────────────────────────────────────────────
       API PÚBLICA
    ──────────────────────────────────────────── */
    return {
        // Refs
        editorRef,

        // Datos de la nota
        titulo, setTitulo,
        notaId,
        notas,

        // Formato
        fontFamily,
        fontSize,
        editorBackgroundColor,

        // Modales
        mostrarModalSalir, setMostrarModalSalir,
        mostrarModalGuardar, setMostrarModalGuardar,
        modoGuardar,

        // Alertas
        mostrarAlert,
        alertConfig,

        // Voz
        isRecording,

        // Handlers de formato
        toggleBold,
        toggleItalic,
        toggleUnderline,
        handleTextAlign,
        insertList,
        insertOrderedList,
        handleFontFamily,
        handleFontSize,
        handleTextColor,
        handleBackgroundColor,
        handleHighlightColor,
        removeHighlight,

        // Handlers de voz
        handleVoiceInput,

        // Handlers de guardado
        handleGuardarClick,
        handleConfirmarGuardar,
        handleCloseAlert,

        // Handlers de navegación
        handleVolverClick,
        handleConfirmarSalir,
    };
}