import "../styles/notas.css";
import { FileText, Plus, Search, Download, Share2, Pencil, Trash2, Type } from "lucide-react";
import logoNotas from "../assets/imagenes/fondo-notas.png";

import { useState } from "react";
import { ModalEliminarNota } from "./ModalEliminarNota";

import { ModalCompartirNota } from "../components/ModalCompartirNota";

export function Notas() {
    const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
    const [notaSeleccionada, setNotaSeleccionada] = useState(null);

    const [mostrarModalCompartir, setMostrarModalCompartir] = useState(false);
    const [notaACompartir, setNotaACompartir] = useState(null);

    const abrirModalEliminar = (nota) => {
        setNotaSeleccionada(nota);
        setMostrarModalEliminar(true);
    };

    const cerrarModalEliminar = () => {
        setMostrarModalEliminar(false);
        setNotaSeleccionada(null);
    };

    const confirmarEliminarNota = () => {
        console.log("Eliminar nota:", notaSeleccionada);
        // aquí luego conectas API o estado
        cerrarModalEliminar();
    };




    const abrirModalCompartir = (nota) => {
        setNotaACompartir(nota);
        setMostrarModalCompartir(true);
    };

    const cerrarModalCompartir = () => {
        setMostrarModalCompartir(false);
        setNotaACompartir(null);
    };

    const confirmarCompartirNota = () => {
        console.log("Compartir nota:", notaACompartir);
        cerrarModalCompartir();
    };


    return (
        <main className="notes-app">
            <div className="notas-contenedor">
                <img src={logoNotas} alt="Mis notas" className="notas-logo" />
            </div>

            <div className="contenedor-notas-almacenadas">
                {/* ===== TOP ===== */}
                <header className="notes-header">
                    <div className="notes-header-actions">
                        <button className="btn-new">
                            <Plus size={16} />
                            Nueva nota
                        </button>

                        <button className="btn-ghost">
                            <Download size={16} />
                            Exportar PDF
                        </button>
                    </div>


                    <div className="notes-search">
                        <Search size={16} />
                        <input placeholder="Buscar notas..." />
                    </div>

                    <div className="notes-limit">
                        <span>Mostrar</span>
                        <select>
                            <option>5</option>
                            <option>10</option>
                            <option>15</option>
                            <option>20</option>
                        </select>
                        <span>resultados</span>
                    </div>

                </header>


                {/* ===== LIST ===== */}
                <section className="notes-list">

                    <div className="note-row">
                        <FileText size={18} className="icono-notas" />

                        <div className="note-content">
                            <h3>Ideas para el proyecto final</h3>
                            <span>Creada: 28/01/2026 · 10:30</span>
                            <span>Modificada: 28/01/2026 · 12:10</span>
                        </div>

                        <div className="note-actions">
                            <Share2
                                size={16}
                                className="icono-notas-compartir"
                                onClick={() =>
                                    abrirModalCompartir("Ideas para el proyecto final")
                                }
                            />

                            <Pencil size={16} className="icono-notas-editar" />

                            <Type size={16} className="icono-notas-renombrar"/>

                            <Trash2
                                size={16}
                                className="icono-notas-eliminar"
                                onClick={() =>
                                    abrirModalEliminar("Ideas para el proyecto final")
                                }
                            />

                        </div>
                    </div>

                    <div className="note-row">
                        <FileText size={18} className="icono-notas" />

                        <div className="note-content">
                            <h3>Notas de la reunión</h3>
                            <span>Creada: 27/01/2026 · 20:15</span>
                            <span>Modificada: 27/01/2026 · 21:00</span>
                        </div>

                        <div className="note-actions">
                            <Share2
                                size={16}
                                className="icono-notas-compartir"
                                onClick={() =>
                                    abrirModalCompartir("Ideas para el proyecto final")
                                }
                            />

                            <Pencil size={16} className="icono-notas-editar" />

                            <Type size={16} className="icono-notas-renombrar"/>

                            <Trash2
                                size={16}
                                className="icono-notas-eliminar"
                                onClick={() =>
                                    abrirModalEliminar("Ideas para el proyecto final")
                                }
                            />

                        </div>
                    </div>

                    <div className="note-row">
                        <FileText size={18} className="icono-notas" />

                        <div className="note-content">
                            <h3>Notas de la reunión</h3>
                            <span>Creada: 27/01/2026 · 20:15</span>
                            <span>Modificada: 27/01/2026 · 21:00</span>
                        </div>

                        <div className="note-actions">
                            <Share2
                                size={16}
                                className="icono-notas-compartir"
                                onClick={() =>
                                    abrirModalCompartir("Ideas para el proyecto final")
                                }
                            />

                            <Pencil size={16} className="icono-notas-editar" />
                            
                            <Type size={16} className="icono-notas-renombrar"/>

                            <Trash2
                                size={16}
                                className="icono-notas-eliminar"
                                onClick={() =>
                                    abrirModalEliminar("Ideas para el proyecto final")
                                }
                            />

                        </div>
                    </div>

                </section>

                {/* ===== PAGINACIÓN ===== */}
                <footer className="notes-pagination">
                    <button className="page-arrow disabled">&laquo;</button>

                    <div className="page-numbers">
                        <button className="page-number active">1</button>
                        <button className="page-number">2</button>
                        <button className="page-number">3</button>
                    </div>

                    <button className="page-arrow">&raquo;</button>
                </footer>


            </div>

            <ModalEliminarNota
                isOpen={mostrarModalEliminar}
                onClose={cerrarModalEliminar}
                onConfirm={confirmarEliminarNota}
                nombreNota={notaSeleccionada}
            />

            <ModalCompartirNota
                isOpen={mostrarModalCompartir}
                onClose={cerrarModalCompartir}
                onConfirm={confirmarCompartirNota}
                nombreNota={notaACompartir}
            />


        </main>
    );
}
