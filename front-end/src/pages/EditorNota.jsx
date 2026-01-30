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
    Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { ModalConfirmarSalir } from "../components/ModalConfirmarSalir";

export function EditorNota() {
    const navigate = useNavigate();

    const [titulo, setTitulo] = useState("");
    const [contenido, setContenido] = useState("");

    const [mostrarModalSalir, setMostrarModalSalir] = useState(false);

    return (
        <main className="editor-nota">
            {/* ===== HEADER ===== */}
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

                <button className="btn-guardar-editor">
                    <Save size={18} />
                    Guardar
                </button>
            </header>

            {/* ===== BODY ===== */}
            <section className="editor-body">
                {/* ===== EDITOR TEXTO ===== */}
                <div className="editor-texto">
                    <textarea
                        placeholder="Empieza a escribir tu nota aquí..."
                        value={contenido}
                        onChange={(e) => setContenido(e.target.value)}
                    />
                </div>

                {/* ===== PANEL DERECHO ===== */}
                <aside className="editor-herramientas">
                    {/* FILA 1 */}
                    <div className="herramientas-fila">
                        <select>
                            <option>Arial</option>
                            <option>Times New Roman</option>
                            <option>Georgia</option>
                            <option>Courier New</option>
                        </select>

                        <select>
                            <option>12</option>
                            <option>14</option>
                            <option>16</option>
                            <option>18</option>
                            <option>24</option>
                        </select>
                    </div>

                    {/* FILA 2 */}
                    <div className="herramientas-fila">
                        <button><Bold size={16} /></button>
                        <button><Italic size={16} /></button>
                        <button><Underline size={16} /></button>
                    </div>

                    {/* FILA 3 */}
                    <div className="herramientas-fila">
                        <button><AlignLeft size={16} /></button>
                        <button><AlignCenter size={16} /></button>
                        <button><AlignRight size={16} /></button>
                        <button><AlignJustify size={16} /></button>
                    </div>

                    {/* FILA 4 */}
                    <div className="herramientas-fila">
                        <button><List size={16} /></button>
                        <button><ListOrdered size={16} /></button>
                    </div>

                    {/* FILA 5 - color del fondo, color de la letra, subrayar la letra, borrar subrayado */}
                    <div className="herramientas-fila">
                        <button title="Color de texto">
                            <Palette size={16} />
                        </button>

                        <button title="Color de fondo">
                            <PaintBucket size={16} />
                        </button>

                        <button title="Resaltar texto">
                            <Highlighter size={16} />
                        </button>
                    </div>

                    {/* FILA 6 */}
                    <div className="herramientas-fila">
                        <button className="btn-voz">
                            <Mic size={18} />
                            Dictar texto
                        </button>
                    </div>
                </aside>
            </section>

            <ModalConfirmarSalir
                isOpen={mostrarModalSalir}
                onCancel={() => setMostrarModalSalir(false)}
                onConfirm={() => navigate(-1)}
            />

        </main>
    );
}
