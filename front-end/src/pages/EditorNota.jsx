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
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { ModalConfirmarSalir } from "../components/ModalConfirmarSalir";
import { ModalGuardarNota } from "../components/ModalGuardarNota";

export function EditorNota() {
    const navigate = useNavigate();
    const editorRef = useRef(null);

    const [titulo, setTitulo] = useState("");
    const [notaId, setNotaId] = useState(null); // Para editar notas existentes

    // Estados de formato
    const [fontFamily, setFontFamily] = useState("Arial");
    const [fontSize, setFontSize] = useState("16");
    const [editorBackgroundColor, setEditorBackgroundColor] = useState("#ffffff");

    // Estados de modales
    const [mostrarModalSalir, setMostrarModalSalir] = useState(false);
    const [mostrarModalGuardar, setMostrarModalGuardar] = useState(false);
    const [modoGuardar, setModoGuardar] = useState("editar");

    // Estados de reconocimiento de voz
    const [isRecording, setIsRecording] = useState(false);
    const [recognition, setRecognition] = useState(null);
    const interimTextRef = useRef('');

    /* ===== CARGAR DATOS AL INICIAR ===== */
    useEffect(() => {
        const savedData = localStorage.getItem('editorNota');

        if (savedData) {
            try {
                const data = JSON.parse(savedData);

                if (data.titulo) setTitulo(data.titulo);
                if (data.contenido && editorRef.current) {
                    editorRef.current.innerHTML = data.contenido;
                }
                if (data.backgroundColor) setEditorBackgroundColor(data.backgroundColor);
                if (data.fontFamily) setFontFamily(data.fontFamily);
                if (data.fontSize) setFontSize(data.fontSize);
                if (data.notaId) setNotaId(data.notaId);

                console.log('Datos cargados desde localStorage');
            } catch (error) {
                console.error('Error al cargar datos:', error);
            }
        } else {
            // No hay datos guardados, limpiar todo para nueva nota
            setTitulo("");
            setNotaId(null);
            setFontFamily("Arial");
            setFontSize("16");
            setEditorBackgroundColor("#ffffff");
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

    /* ===== RECONOCIMIENTO DE VOZ ===== */
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognitionInstance = new SpeechRecognition();

            recognitionInstance.continuous = true;
            recognitionInstance.interimResults = true;
            recognitionInstance.lang = 'es-ES';
            recognitionInstance.maxAlternatives = 1;

            recognitionInstance.onstart = () => {
                console.log('Reconocimiento de voz iniciado');
                interimTextRef.current = '';
            };

            recognitionInstance.onresult = (event) => {
                if (!editorRef.current) return;

                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;

                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    }
                }

                if (finalTranscript) {
                    editorRef.current.focus();

                    const selection = window.getSelection();
                    const range = document.createRange();
                    range.selectNodeContents(editorRef.current);
                    range.collapse(false);
                    selection.removeAllRanges();
                    selection.addRange(range);

                    document.execCommand('insertText', false, finalTranscript + ' ');

                    interimTextRef.current = '';
                }
            };

            recognitionInstance.onerror = (event) => {
                console.error('Error en reconocimiento de voz:', event.error);

                if (event.error === 'no-speech') {
                    console.log('No se detectó voz, continuando...');
                    return;
                }

                if (event.error === 'aborted') {
                    console.log('Reconocimiento abortado');
                    setIsRecording(false);
                }

                if (event.error === 'network') {
                    alert('Error de red. Verifica tu conexión a internet.');
                    setIsRecording(false);
                }
            };

            recognitionInstance.onend = () => {
                console.log('Reconocimiento de voz finalizado');

                if (isRecording) {
                    try {
                        recognitionInstance.start();
                        console.log('Reconocimiento reiniciado automáticamente');
                    } catch (e) {
                        console.log('No se pudo reiniciar:', e);
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
        };
    }, [isRecording]);

    /* ===== GENERAR PDF CON jsPDF ===== */
    const generatePDF = async () => {
        try {
            const element = editorRef.current;
            
            // Crear contenedor temporal con estilos
            const pdfContainer = document.createElement('div');
            pdfContainer.style.cssText = `
                position: absolute;
                left: -9999px;
                top: 0;
                width: 210mm;
                padding: 20mm;
                background-color: ${editorBackgroundColor};
                font-family: ${fontFamily};
                font-size: ${fontSize}px;
            `;
            
            pdfContainer.innerHTML = `
                <div style="margin-bottom: 20px;">
                    <h1 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
                        ${titulo}
                    </h1>
                </div>
                <div style="margin-top: 20px; line-height: 1.6;">
                    ${element.innerHTML}
                </div>
                <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
                    Creado: ${new Date().toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </div>
            `;
            
            document.body.appendChild(pdfContainer);

            // Convertir a canvas
            const canvas = await html2canvas(pdfContainer, {
                scale: 2,
                useCORS: true,
                backgroundColor: editorBackgroundColor
            });

            document.body.removeChild(pdfContainer);

            // Crear PDF
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

            // Convertir a Blob
            const pdfBlob = pdf.output('blob');
            return pdfBlob;

        } catch (error) {
            console.error('Error al generar PDF:', error);
            throw error;
        }
    };

    /* ===== FUNCIONES DE FORMATO ===== */
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

    const handleFontFamily = (font) => {
        setFontFamily(font);
        const selection = window.getSelection();
        if (!selection.rangeCount) {
            editorRef.current?.focus();
            return;
        }

        const range = selection.getRangeAt(0);

        if (!range.collapsed) {
            const span = document.createElement('span');
            span.style.fontFamily = font;

            try {
                const fragment = range.extractContents();
                span.appendChild(fragment);
                range.insertNode(span);

                range.selectNodeContents(span);
                selection.removeAllRanges();
                selection.addRange(range);
            } catch (e) {
                console.error('Error al aplicar fuente:', e);
            }
        }

        editorRef.current?.focus();
    };

    const handleFontSize = (size) => {
        setFontSize(size);
        const selection = window.getSelection();
        if (!selection.rangeCount) {
            editorRef.current?.focus();
            return;
        }

        const range = selection.getRangeAt(0);

        if (!range.collapsed) {
            const span = document.createElement('span');
            span.style.fontSize = `${size}px`;

            try {
                const fragment = range.extractContents();
                span.appendChild(fragment);
                range.insertNode(span);

                range.selectNodeContents(span);
                selection.removeAllRanges();
                selection.addRange(range);
            } catch (e) {
                console.error('Error al aplicar tamaño:', e);
            }
        }

        editorRef.current?.focus();
    };

    const handleTextColor = (color) => {
        editorRef.current?.focus();
        document.execCommand('foreColor', false, color);
    };

    const handleBackgroundColor = (color) => {
        setEditorBackgroundColor(color);
    };

    const handleHighlightColor = (color) => {
        editorRef.current?.focus();
        document.execCommand('hiliteColor', false, color);
    };

    const removeHighlight = () => {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);

        if (!range.collapsed) {
            editorRef.current?.focus();
            document.execCommand('hiliteColor', false, 'transparent');
            document.execCommand('backColor', false, 'transparent');
        } else {
            alert('Selecciona el texto del cual quieres quitar el resaltado');
        }
    };

    const handleVoiceInput = () => {
        if (!recognition) {
            alert('Tu navegador no soporta reconocimiento de voz. Prueba con Chrome o Edge.');
            return;
        }

        if (isRecording) {
            try {
                recognition.stop();
                setIsRecording(false);
                console.log('Dictado detenido por el usuario');
            } catch (e) {
                console.error('Error al detener:', e);
                setIsRecording(false);
            }
        } else {
            try {
                interimTextRef.current = '';
                recognition.start();
                setIsRecording(true);
                console.log('Dictado iniciado');
                editorRef.current?.focus();
            } catch (e) {
                console.error('Error al iniciar:', e);
                alert('No se pudo iniciar el dictado. Intenta nuevamente.');
            }
        }
    };

    /* ===== HANDLERS DE GUARDADO ===== */
    const handleGuardarClick = () => {
        if (titulo.trim() === "") {
            setModoGuardar("crear");
        } else {
            setModoGuardar("editar");
        }
        setMostrarModalGuardar(true);
    };

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
                throw new Error(errorData.mensaje || "Error al guardar la nota");
            }

            const data = await response.json();
            console.log("Nota guardada:", data);

            if (modoGuardar === "crear") {
                setTitulo(tituloNota);
                setNotaId(data.nota.id_nota);
            }

            alert("¡Nota guardada exitosamente!");
            setMostrarModalGuardar(false);

        } catch (error) {
            console.error("Error al guardar nota:", error);
            alert(error.message || "Error al guardar la nota. Intenta nuevamente.");
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

    /* ===== RENDER ===== */
    return (
        <main className="editor-nota">
            {/* HEADER */}
            <header className="editor-header">
                <button
                    className="btn-volver-editor"
                    onClick={() => setMostrarModalSalir(true)}
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
                            value={fontFamily}
                            onChange={(e) => handleFontFamily(e.target.value)}
                        >
                            <option value="Arial">Arial</option>
                            <option value="'Times New Roman', Times, serif">Times New Roman</option>
                            <option value="Georgia, serif">Georgia</option>
                            <option value="'Courier New', Courier, monospace">Courier New</option>
                            <option value="Verdana, Geneva, sans-serif">Verdana</option>
                            <option value="'Comic Sans MS', cursive">Comic Sans MS</option>
                        </select>

                        <select
                            value={fontSize}
                            onChange={(e) => handleFontSize(e.target.value)}
                        >
                            <option value="12">12</option>
                            <option value="14">14</option>
                            <option value="16">16</option>
                            <option value="18">18</option>
                            <option value="20">20</option>
                            <option value="24">24</option>
                            <option value="28">28</option>
                            <option value="32">32</option>
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
            />
        </main>
    );
}