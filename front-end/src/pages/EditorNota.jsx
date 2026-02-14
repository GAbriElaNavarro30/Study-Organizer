import "../styles/editor-nota.css";
import {
    ArrowLeft,
    Save,
    Bold,
    Italic,
    Underline,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    List,
    ListOrdered,
    Mic,
    PaintBucket,
    Palette,
    Highlighter,
    Eraser
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

import { ModalConfirmarSalir } from "../components/ModalConfirmarSalir";
import { ModalGuardarNota } from "../components/ModalGuardarNota";
import { CustomAlert } from "../components/CustomAlert";
import logo from "../assets/imagenes/logotipo.png";

export function EditorNota() {
    const navigate = useNavigate();
    const editorRef = useRef(null);

    const [titulo, setTitulo] = useState("");
    const [notaId, setNotaId] = useState(null);
    const [notas, setNotas] = useState([]);

    // Estados de formato
    const [fontFamily, setFontFamily] = useState("Arial");
    const [fontSize, setFontSize] = useState("16");
    const [editorBackgroundColor, setEditorBackgroundColor] = useState("#ffffff");

    // Estados de modales
    const [mostrarModalSalir, setMostrarModalSalir] = useState(false);
    const [mostrarModalGuardar, setMostrarModalGuardar] = useState(false);
    const [modoGuardar, setModoGuardar] = useState("editar");

    // Estados para CustomAlert
    const [mostrarAlert, setMostrarAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        type: "success",
        title: "",
        message: ""
    });

    // Estados de reconocimiento de voz MEJORADOS
    const [isRecording, setIsRecording] = useState(false);
    const [recognition, setRecognition] = useState(null);
    const recognitionTimeoutRef = useRef(null);

    // Estado para contenido inicial (para detectar cambios)
    const [contenidoInicial, setContenidoInicial] = useState("");
    const [tituloInicial, setTituloInicial] = useState("");

    // ✅ NUEVO: Estado para controlar redirección después de cerrar alerta
    const [shouldRedirectOnAlertClose, setShouldRedirectOnAlertClose] = useState(false);

    /* ===== FUNCIÓN HELPER PARA MOSTRAR ALERTAS ===== */
    const mostrarAlerta = (type, title, message) => {
        setAlertConfig({ type, title, message });
        setMostrarAlert(true);
    };

    /* ===== CARGAR DATOS AL INICIAR ===== */
    useEffect(() => {
        const savedData = localStorage.getItem('editorNota');

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

                console.log('Datos cargados desde localStorage');
            } catch (error) {
                console.error('Error al cargar datos:', error);
            }
        } else {
            setTitulo("");
            setNotaId(null);
            setFontFamily("Arial");
            setFontSize("16");
            setEditorBackgroundColor("#ffffff");
            setContenidoInicial("");
            setTituloInicial("");
            if (editorRef.current) {
                editorRef.current.innerHTML = "";
            }
            console.log('Editor limpio para nueva nota');
        }
    }, []);

    /* ===== AUTOGUARDADO CADA 2 SEGUNDOS ===== */
    useEffect(() => {
        const autoSaveInterval = setInterval(() => {
            if (editorRef.current) {
                const dataToSave = {
                    titulo: titulo,
                    contenido: editorRef.current.innerHTML,
                    backgroundColor: editorBackgroundColor,
                    fontFamily: fontFamily,
                    fontSize: fontSize,
                    notaId: notaId,
                    lastSaved: new Date().toISOString()
                };

                localStorage.setItem('editorNota', JSON.stringify(dataToSave));
                console.log('Autoguardado realizado:', new Date().toLocaleTimeString());
            }
        }, 2000);

        return () => clearInterval(autoSaveInterval);
    }, [titulo, editorBackgroundColor, fontFamily, fontSize, notaId]);

    /* ===== RECONOCIMIENTO DE VOZ MEJORADO ===== */
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognitionInstance = new SpeechRecognition();

            // Configuración optimizada
            recognitionInstance.continuous = true;
            recognitionInstance.interimResults = true;
            recognitionInstance.lang = 'es-ES';
            recognitionInstance.maxAlternatives = 1;

            recognitionInstance.onstart = () => {
                console.log('🎤 Reconocimiento de voz iniciado');
            };

            recognitionInstance.onresult = (event) => {
                if (!editorRef.current) return;

                let finalTranscript = '';

                // Solo procesar resultados finales
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;

                    if (event.results[i].isFinal) {
                        finalTranscript += transcript + ' ';
                    }
                }

                // Insertar transcripción final
                if (finalTranscript) {
                    editorRef.current.focus();

                    const selection = window.getSelection();
                    const range = document.createRange();
                    range.selectNodeContents(editorRef.current);
                    range.collapse(false);
                    selection.removeAllRanges();
                    selection.addRange(range);

                    document.execCommand('insertText', false, finalTranscript);
                }

                // Resetear timeout de silencio
                if (recognitionTimeoutRef.current) {
                    clearTimeout(recognitionTimeoutRef.current);
                }
            };

            recognitionInstance.onerror = (event) => {
                console.error('❌ Error en reconocimiento de voz:', event.error);

                if (event.error === 'no-speech') {
                    console.log('⏸️ No se detectó voz, continuando...');
                    return;
                }

                if (event.error === 'aborted') {
                    console.log('🛑 Reconocimiento abortado');
                    setIsRecording(false);
                }

                if (event.error === 'network') {
                    mostrarAlerta(
                        "error",
                        "Error de red",
                        "Verifica tu conexión a internet."
                    );
                    setIsRecording(false);
                }
            };

            recognitionInstance.onend = () => {
                console.log('🔴 Reconocimiento de voz finalizado');

                if (isRecording) {
                    try {
                        recognitionInstance.start();
                        console.log('🔄 Reconocimiento reiniciado automáticamente');
                    } catch (e) {
                        console.log('❌ No se pudo reiniciar:', e);
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
                try {
                    recognition.stop();
                } catch (e) {
                    console.log('Error al detener reconocimiento:', e);
                }
            }
            if (recognitionTimeoutRef.current) {
                clearTimeout(recognitionTimeoutRef.current);
            }
        };
    }, [isRecording]);

    /* ===== CARGAR NOTAS AL INICIAR ===== */
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

    /* ===== DETECTAR SI HAY CAMBIOS ===== */
    const hayaCambios = () => {
        const contenidoActual = editorRef.current?.innerHTML || "";
        const tituloActual = titulo;

        return (
            contenidoActual.trim() !== contenidoInicial.trim() ||
            tituloActual.trim() !== tituloInicial.trim()
        );
    };

    /* ===== FUNCIONES DE FORMATO MEJORADAS ===== */
    
    // ✅ FUNCIÓN CORREGIDA: Mantiene toda la selección al aplicar estilos
    const applyStyleToSelection = (styleProp, styleValue) => {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        if (range.collapsed) return;

        editorRef.current?.focus();

        try {
            // Guardar los puntos de inicio y fin de la selección original
            const startContainer = range.startContainer;
            const startOffset = range.startOffset;
            const endContainer = range.endContainer;
            const endOffset = range.endOffset;

            // Función recursiva para aplicar estilos a todos los nodos de texto
            const applyStyleToNode = (node) => {
                if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '') {
                    // Si el nodo de texto ya está dentro de un span, aplicar el estilo al span
                    if (node.parentNode.nodeName === 'SPAN') {
                        node.parentNode.style[styleProp] = styleValue;
                    } else {
                        // Envolver el nodo de texto en un span con el estilo
                        const span = document.createElement('span');
                        span.style[styleProp] = styleValue;
                        const parent = node.parentNode;
                        parent.insertBefore(span, node);
                        span.appendChild(node);
                    }
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    // Si es un elemento (li, div, etc.), aplicar el estilo directamente
                    if (node.style && (node.nodeName === 'LI' || node.nodeName === 'DIV' || node.nodeName === 'P' || node.nodeName === 'SPAN')) {
                        node.style[styleProp] = styleValue;
                    }
                    // Procesar los hijos del elemento
                    Array.from(node.childNodes).forEach(child => {
                        if (range.intersectsNode(child)) {
                            applyStyleToNode(child);
                        }
                    });
                }
            };

            // Obtener todos los nodos dentro del rango seleccionado
            const commonAncestor = range.commonAncestorContainer;
            
            if (commonAncestor.nodeType === Node.TEXT_NODE) {
                // Si es un nodo de texto, aplicar directamente
                applyStyleToNode(commonAncestor);
            } else if (commonAncestor.nodeType === Node.ELEMENT_NODE) {
                // Recorrer todos los hijos del ancestro común
                const processChildren = (parent) => {
                    Array.from(parent.childNodes).forEach(child => {
                        // Solo procesar nodos que intersectan con el rango
                        if (range.intersectsNode(child)) {
                            applyStyleToNode(child);
                        }
                    });
                };
                
                processChildren(commonAncestor);
            }

            // ✅ CLAVE: Restaurar la selección original después de aplicar estilos
            try {
                const newRange = document.createRange();
                newRange.setStart(startContainer, startOffset);
                newRange.setEnd(endContainer, endOffset);
                selection.removeAllRanges();
                selection.addRange(newRange);
            } catch (e) {
                // Si no se puede restaurar exactamente, intentar seleccionar el ancestro común
                console.log('No se pudo restaurar la selección exacta, usando alternativa');
                const newRange = document.createRange();
                newRange.selectNodeContents(commonAncestor);
                selection.removeAllRanges();
                selection.addRange(newRange);
            }

            console.log(`✅ Estilo ${styleProp} aplicado correctamente y selección mantenida`);
        } catch (e) {
            console.error(`Error al aplicar ${styleProp}:`, e);
        }
    };

    const toggleBold = () => {
        editorRef.current?.focus();
        document.execCommand('bold');
    };

    const toggleItalic = () => {
        editorRef.current?.focus();
        document.execCommand('italic');
    };

    const toggleUnderline = () => {
        editorRef.current?.focus();
        document.execCommand('underline');
    };

    const handleTextAlign = (align) => {
        const commands = {
            'left': 'justifyLeft',
            'center': 'justifyCenter',
            'right': 'justifyRight',
            'justify': 'justifyFull'
        };
        editorRef.current?.focus();
        document.execCommand(commands[align]);
    };

    const insertList = () => {
        editorRef.current?.focus();
        document.execCommand('insertUnorderedList');
    };

    const insertOrderedList = () => {
        editorRef.current?.focus();
        document.execCommand('insertOrderedList');
    };

    // ✅ CORRECCIÓN: handleFontFamily mantiene la selección completa
    const handleFontFamily = (font) => {
        editorRef.current?.focus();
        
        const selection = window.getSelection();
        if (!selection.rangeCount) {
            // Si no hay selección, solo actualizar el estado para nuevos textos
            setFontFamily(font);
            return;
        }

        const range = selection.getRangeAt(0);

        // Si hay texto seleccionado, aplicar la fuente SOLO a la selección
        if (!range.collapsed) {
            applyStyleToSelection('fontFamily', font);
            // NO actualizar el estado global para no afectar el resto del texto
        } else {
            // Si el cursor está en un punto sin selección, actualizar el estado
            setFontFamily(font);
        }
    };

    // ✅ CORRECCIÓN: handleFontSize mantiene la selección completa
    const handleFontSize = (size) => {
        editorRef.current?.focus();
        
        const selection = window.getSelection();
        if (!selection.rangeCount) {
            // Si no hay selección, solo actualizar el estado para nuevos textos
            setFontSize(size);
            return;
        }

        const range = selection.getRangeAt(0);

        // Si hay texto seleccionado, aplicar el tamaño SOLO a la selección
        if (!range.collapsed) {
            applyStyleToSelection('fontSize', `${size}px`);
            // NO actualizar el estado global para no afectar el resto del texto
        } else {
            // Si el cursor está en un punto sin selección, actualizar el estado
            setFontSize(size);
        }
    };

    const handleTextColor = (color) => {
        editorRef.current?.focus();
        const selection = window.getSelection();
        
        if (selection.rangeCount && !selection.getRangeAt(0).collapsed) {
            applyStyleToSelection('color', color);
        }
    };

    const handleBackgroundColor = (color) => {
        setEditorBackgroundColor(color);
    };

    const handleHighlightColor = (color) => {
        editorRef.current?.focus();
        const selection = window.getSelection();
        
        if (selection.rangeCount && !selection.getRangeAt(0).collapsed) {
            applyStyleToSelection('backgroundColor', color);
        }
    };

    // FUNCIÓN MEJORADA PARA REMOVER RESALTADO
    const removeHighlight = () => {
        const selection = window.getSelection();
        if (!selection.rangeCount) {
            mostrarAlerta(
                "success",
                "Selecciona texto",
                "Selecciona el texto del cual quieres quitar el resaltado"
            );
            return;
        }

        const range = selection.getRangeAt(0);

        if (range.collapsed) {
            mostrarAlerta(
                "success",
                "Selecciona texto",
                "Selecciona el texto del cual quieres quitar el resaltado"
            );
            return;
        }

        editorRef.current?.focus();

        try {
            // Crear un TreeWalker para recorrer todos los nodos del rango
            const startContainer = range.startContainer;
            const endContainer = range.endContainer;
            const commonAncestor = range.commonAncestorContainer;

            // Función para limpiar el backgroundColor de un elemento
            const removeBackgroundFromElement = (element) => {
                if (element.nodeType === Node.ELEMENT_NODE) {
                    // Solo eliminar backgroundColor, mantener todo lo demás
                    if (element.style && element.style.backgroundColor) {
                        element.style.backgroundColor = '';
                    }
                    // Si el elemento tiene atributo style pero está vacío, eliminarlo
                    if (element.style && element.getAttribute('style') === '') {
                        element.removeAttribute('style');
                    }
                }
            };

            // Procesar todos los elementos dentro del rango seleccionado
            const processNode = (node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    removeBackgroundFromElement(node);
                    
                    // Procesar hijos recursivamente
                    for (let i = 0; i < node.childNodes.length; i++) {
                        processNode(node.childNodes[i]);
                    }
                }
            };

            // Si la selección está dentro de un solo elemento
            if (commonAncestor.nodeType === Node.ELEMENT_NODE) {
                processNode(commonAncestor);
            }

            // También procesar los contenedores de inicio y fin
            let node = startContainer;
            while (node && node !== editorRef.current) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    removeBackgroundFromElement(node);
                }
                node = node.parentNode;
            }

            console.log('✅ Resaltado removido correctamente (solo backgroundColor)');
        } catch (e) {
            console.error('❌ Error al remover resaltado:', e);
            mostrarAlerta(
                "error",
                "Error",
                "No se pudo remover el resaltado. Intenta nuevamente."
            );
        }
    };

    const handleVoiceInput = () => {
        if (!recognition) {
            mostrarAlerta(
                "error",
                "No disponible",
                "Tu navegador no soporta reconocimiento de voz. Prueba con Chrome o Edge."
            );
            return;
        }

        if (isRecording) {
            try {
                recognition.stop();
                setIsRecording(false);
                console.log('🛑 Dictado detenido por el usuario');
            } catch (e) {
                console.error('Error al detener:', e);
                setIsRecording(false);
            }
        } else {
            try {
                recognition.start();
                setIsRecording(true);
                console.log('🎤 Dictado iniciado');
                editorRef.current?.focus();
            } catch (e) {
                console.error('Error al iniciar:', e);
                mostrarAlerta(
                    "error",
                    "Error al iniciar",
                    "No se pudo iniciar el dictado. Intenta nuevamente."
                );
            }
        }
    };

    /* ===== HANDLERS DE GUARDADO ===== */
    const handleGuardarClick = () => {
        const contenidoTexto = editorRef.current?.innerText?.trim() || "";

        if (!contenidoTexto) {
            mostrarAlerta(
                "error",
                "Contenido vacío",
                "El contenido de la nota es obligatorio. Por favor, escribe algo antes de guardar."
            );
            return;
        }

        if (titulo.trim() === "") {
            setModoGuardar("crear");
        } else {
            setModoGuardar("editar");
        }
        setMostrarModalGuardar(true);
    };

    // ✅ MODIFICADO: Nueva lógica de guardado con redirección controlada
    const handleConfirmarGuardar = async (tituloNota) => {
        try {
            const endpoint = modoGuardar === "crear"
                ? "http://localhost:3000/notas/crear-nota"
                : `http://localhost:3000/notas/actualizar-nota/${notaId}`;

            const method = modoGuardar === "crear" ? "POST" : "PUT";

            const response = await fetch(endpoint, {
                method: method,
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    titulo: modoGuardar === "crear" ? tituloNota : titulo,
                    contenido: editorRef.current?.innerHTML,
                    backgroundColor: editorBackgroundColor,
                    fontFamily: fontFamily,
                    fontSize: fontSize
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Error al guardar la nota");
            }

            const data = await response.json();
            console.log("Nota guardada:", data);

            // Cerrar modal de guardar
            setMostrarModalGuardar(false);

            // Limpiar localStorage en ambos casos
            localStorage.removeItem('editorNota');

            if (modoGuardar === "crear") {
                // ✅ Al CREAR: Mostrar alerta y marcar que debe redirigir al cerrarla
                mostrarAlerta(
                    "success",
                    "¡Nota creada!",
                    "Tu nota ha sido creada exitosamente."
                );
                setShouldRedirectOnAlertClose(true);
            } else {
                // ✅ Al EDITAR: Mostrar alerta y marcar que debe redirigir al cerrarla
                mostrarAlerta(
                    "success",
                    "¡Nota actualizada!",
                    "Los cambios han sido guardados exitosamente."
                );
                setShouldRedirectOnAlertClose(true);
            }

        } catch (error) {
            console.error("Error al guardar nota:", error);
            mostrarAlerta(
                "error",
                "Error al guardar",
                error.message || "No se pudo guardar la nota. Por favor, intenta nuevamente."
            );
        }
    };

    // ✅ NUEVO: Handler para cerrar alerta con redirección condicional
    const handleCloseAlert = () => {
        setMostrarAlert(false);
        
        // Si se debe redirigir, hacerlo después de cerrar la alerta
        if (shouldRedirectOnAlertClose) {
            setShouldRedirectOnAlertClose(false);
            navigate("/notas");
        }
    };

    /* ===== HANDLER DE VOLVER ===== */
    const handleVolverClick = () => {
        if (hayaCambios()) {
            setMostrarModalSalir(true);
        } else {
            if (isRecording && recognition) {
                recognition.stop();
                setIsRecording(false);
            }
            navigate(-1);
        }
    };

    const handleConfirmarSalir = () => {
        if (isRecording && recognition) {
            recognition.stop();
            setIsRecording(false);
        }

        setMostrarModalSalir(false);
        navigate(-1);
    };

    /* ===== ATAJOS DE TECLADO ===== */
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                toggleBold();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
                e.preventDefault();
                toggleItalic();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
                e.preventDefault();
                toggleUnderline();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleGuardarClick();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [titulo, notaId]);

    /* ===== RENDER ===== */
    return (
        <main className="editor-nota">
            {/* HEADER */}
            <header className="editor-header">
                <button
                    className="btn-volver-editor"
                    onClick={handleVolverClick}
                >
                    <ArrowLeft size={18} />
                    Volver
                </button>

                <h2 className="editor-titulo">
                    {titulo || "Un lugar tranquilo para organizar tus ideas"}
                </h2>

                <button
                    className="btn-guardar-editor"
                    onClick={handleGuardarClick}
                >
                    <Save size={18} />
                    Guardar
                </button>
            </header>

            {/* BODY */}
            <section className="editor-body">
                <div className="editor-texto">
                    <div
                        ref={editorRef}
                        contentEditable={true}
                        className="editor-contenteditable"
                        data-placeholder="Empieza a escribir tu nota aquí..."
                        suppressContentEditableWarning={true}
                        style={{
                            backgroundColor: editorBackgroundColor,
                            fontFamily: fontFamily,
                            fontSize: `${fontSize}px`
                        }}
                    />
                </div>

                <aside className="editor-herramientas">
                    {/* FILA 1: Fuente y Tamaño */}
                    <div className="herramientas-fila">
                        <select
                            defaultValue="Arial"
                            onChange={(e) => handleFontFamily(e.target.value)}
                            title="Tipo de fuente - Selecciona texto y luego elige la fuente"
                        >
                            <option value="Arial">Arial</option>
                            <option value="'Times New Roman', Times, serif">Times New Roman</option>
                            <option value="Georgia, serif">Georgia</option>
                            <option value="'Courier New', Courier, monospace">Courier New</option>
                            <option value="Verdana, Geneva, sans-serif">Verdana</option>
                            <option value="'Comic Sans MS', cursive">Comic Sans MS</option>
                            <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
                            <option value="'Lucida Console', monospace">Lucida Console</option>
                        </select>

                        <select
                            defaultValue="16"
                            onChange={(e) => handleFontSize(e.target.value)}
                            title="Tamaño de fuente - Selecciona texto y luego elige el tamaño"
                        >
                            <option value="10">10</option>
                            <option value="12">12</option>
                            <option value="14">14</option>
                            <option value="16">16</option>
                            <option value="18">18</option>
                            <option value="20">20</option>
                            <option value="24">24</option>
                            <option value="28">28</option>
                            <option value="32">32</option>
                            <option value="36">36</option>
                            <option value="48">48</option>
                        </select>
                    </div>

                    {/* FILA 2: Negrita, Cursiva, Subrayado */}
                    <div className="herramientas-fila">
                        <button onClick={toggleBold} title="Negrita (Ctrl+B)">
                            <Bold size={16} />
                        </button>
                        <button onClick={toggleItalic} title="Cursiva (Ctrl+I)">
                            <Italic size={16} />
                        </button>
                        <button onClick={toggleUnderline} title="Subrayado (Ctrl+U)">
                            <Underline size={16} />
                        </button>
                    </div>

                    {/* FILA 3: Alineación */}
                    <div className="herramientas-fila">
                        <button onClick={() => handleTextAlign('left')} title="Alinear a la izquierda">
                            <AlignLeft size={16} />
                        </button>
                        <button onClick={() => handleTextAlign('center')} title="Centrar">
                            <AlignCenter size={16} />
                        </button>
                        <button onClick={() => handleTextAlign('right')} title="Alinear a la derecha">
                            <AlignRight size={16} />
                        </button>
                        <button onClick={() => handleTextAlign('justify')} title="Justificar">
                            <AlignJustify size={16} />
                        </button>
                    </div>

                    {/* FILA 4: Listas */}
                    <div className="herramientas-fila">
                        <button onClick={insertList} title="Lista con viñetas">
                            <List size={16} />
                        </button>
                        <button onClick={insertOrderedList} title="Lista numerada">
                            <ListOrdered size={16} />
                        </button>
                    </div>

                    {/* FILA 5: Colores */}
                    <div className="herramientas-fila">
                        <div className="color-picker-wrapper" title="Color de texto">
                            <Palette size={16} />
                            <input
                                type="color"
                                defaultValue="#000000"
                                onChange={(e) => handleTextColor(e.target.value)}
                                className="color-input"
                            />
                        </div>
                        <div className="color-picker-wrapper" title="Color de fondo de la nota">
                            <PaintBucket size={16} />
                            <input
                                type="color"
                                value={editorBackgroundColor}
                                onChange={(e) => handleBackgroundColor(e.target.value)}
                                className="color-input"
                            />
                        </div>
                        <div className="color-picker-wrapper" title="Resaltar texto seleccionado">
                            <Highlighter size={16} />
                            <input
                                type="color"
                                defaultValue="#ffff00"
                                onChange={(e) => handleHighlightColor(e.target.value)}
                                className="color-input"
                            />
                        </div>
                        <button
                            onClick={removeHighlight}
                            title="Borrar resaltado del texto seleccionado"
                            className="btn-eraser"
                        >
                            <Eraser size={16} />
                        </button>
                    </div>

                    {/* FILA 6: Dictado de voz */}
                    <div className="herramientas-fila">
                        <button
                            className={`btn-voz ${isRecording ? 'recording' : ''}`}
                            onClick={handleVoiceInput}
                            title={isRecording ? "Detener dictado" : "Iniciar dictado"}
                        >
                            <Mic size={18} />
                            {isRecording ? '🔴 Grabando...' : 'Dictar texto'}
                        </button>
                    </div>
                </aside>
            </section>

            {/* MODALES */}
            <ModalConfirmarSalir
                isOpen={mostrarModalSalir}
                onCancel={() => setMostrarModalSalir(false)}
                onConfirm={handleConfirmarSalir}
            />

            <ModalGuardarNota
                isOpen={mostrarModalGuardar}
                modo={modoGuardar}
                onCancel={() => setMostrarModalGuardar(false)}
                onConfirm={handleConfirmarGuardar}
                notas={notas}
            />

            {/* CUSTOM ALERT - ✅ Usa handleCloseAlert en vez de setState directo */}
            {mostrarAlert && (
                <CustomAlert
                    type={alertConfig.type}
                    title={alertConfig.title}
                    message={alertConfig.message}
                    logo={logo}
                    onClose={handleCloseAlert}
                />
            )}
        </main>
    );
}