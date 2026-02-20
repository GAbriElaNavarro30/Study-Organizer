import "../styles/editor-nota.css";
import {
    ArrowLeft, Save, Bold, Italic, Underline,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    List, ListOrdered, Mic, PaintBucket, Palette, Highlighter, Eraser,
} from "lucide-react";

import { ModalConfirmarSalir } from "../components/ModalConfirmarSalir";
import { ModalGuardarNota } from "../components/ModalGuardarNota";
import { CustomAlert } from "../components/CustomAlert";
import logo from "../assets/imagenes/logotipo.png";
import { useEditorNota } from "../hooks/useEditorNota";

export function EditorNota() {
    const {
        // Refs
        editorRef,

        // Datos
        titulo, setTitulo,
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
    } = useEditorNota();

    return (
        <main className="editor-nota">

            {/* ── HEADER ── */}
            <header className="editor-header">
                <button className="btn-volver-editor" onClick={handleVolverClick}>
                    <ArrowLeft size={18} />
                    Volver
                </button>

                <h2 className="editor-titulo">
                    {titulo || "Un lugar tranquilo para organizar tus ideas"}
                </h2>

                <button className="btn-guardar-editor" onClick={handleGuardarClick}>
                    <Save size={18} />
                    Guardar
                </button>
            </header>

            {/* ── BODY ── */}
            <section className="editor-body">

                {/* Área de escritura */}
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
                            fontSize: `${fontSize}px`,
                        }}
                    />
                </div>

                {/* Barra de herramientas */}
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
                        <button onClick={() => handleTextAlign("left")} title="Alinear a la izquierda">
                            <AlignLeft size={16} />
                        </button>
                        <button onClick={() => handleTextAlign("center")} title="Centrar">
                            <AlignCenter size={16} />
                        </button>
                        <button onClick={() => handleTextAlign("right")} title="Alinear a la derecha">
                            <AlignRight size={16} />
                        </button>
                        <button onClick={() => handleTextAlign("justify")} title="Justificar">
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
                            className={`btn-voz ${isRecording ? "recording" : ""}`}
                            onClick={handleVoiceInput}
                            title={isRecording ? "Detener dictado" : "Iniciar dictado"}
                        >
                            <Mic size={18} />
                            {isRecording ? "🔴 Grabando..." : "Dictar texto"}
                        </button>
                    </div>
                </aside>
            </section>

            {/* ── MODALES ── */}
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

            {/* ── ALERTA ── */}
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