import "../styles/notas.css";
import { FileText, Plus, Search, Download, Share2, Pencil, Trash2, Type } from "lucide-react";
import logoNotas from "../assets/imagenes/fondo-notas.png";

import { ModalEliminarNota } from "../components/ModalEliminarNota";
import { ModalCompartirNota } from "../components/ModalCompartirNota";
import { ModalRenombrarNota } from "../components/ModalRenombrarNota";
import { CustomAlert } from "../components/CustomAlert";
import logo from "../assets/imagenes/logotipo.png";
import { useNotas } from "../hooks/useNotas";

export function Notas() {
    const {
        // Estado de notas
        loading,
        error,
        cargarNotas,

        // Búsqueda y paginación
        busqueda, setBusqueda,
        limit,
        paginaActual, setPaginaActual,
        notasPaginadas,
        totalPaginas,
        handleCambiarLimit,
        handleLimpiarBusqueda,

        // Utilidades
        formatearFecha,

        // Modal eliminar
        mostrarModalEliminar,
        notaSeleccionada,
        abrirModalEliminar,
        cerrarModalEliminar,
        confirmarEliminarNota,

        // Modal compartir
        mostrarModalCompartir,
        notaACompartir,
        abrirModalCompartir,
        cerrarModalCompartir,
        confirmarCompartirNota,

        // Modal renombrar
        mostrarModalRenombrar,
        notaARenombrar,
        notas,
        abrirModalRenombrar,
        cerrarModalRenombrar,
        confirmarRenombrarNota,

        // Alertas
        mostrarAlert, setMostrarAlert,
        alertConfig,

        // Acciones
        descargarPDF,
        editarNota,
        crearNuevaNota,
    } = useNotas();

    return (
        <main className="notes-app">
            <div className="notas-contenedor">
                <img src={logoNotas} alt="Mis notas" className="notas-logo" />
            </div>

            <div className="contenedor-notas-almacenadas">

                {/* ── HEADER ── */}
                <header className="notes-header">
                    <div className="notes-header-actions">
                        <button className="btn-new" onClick={crearNuevaNota}>
                            <Plus size={16} />
                            Nueva nota
                        </button>
                    </div>

                    <div className="notes-search">
                        <Search size={16} />
                        <input
                            placeholder="Buscar notas..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>

                    <div className="notes-limit">
                        <span>Mostrar</span>
                        <select
                            value={limit}
                            onChange={(e) => handleCambiarLimit(Number(e.target.value))}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={20}>20</option>
                        </select>
                        <span>resultados</span>
                    </div>
                </header>

                {/* ── CARGA ── */}
                {loading && (
                    <div className="notes-loading">
                        <p>Cargando notas...</p>
                    </div>
                )}

                {error && (
                    <div className="notes-error">
                        <p>{error}</p>
                        <button onClick={cargarNotas}>Reintentar</button>
                    </div>
                )}

                {/* ── LISTA DE NOTAS ── */}
                {!loading && !error && (
                    <>
                        {notasPaginadas.length === 0 ? (
                            <div className="notes-empty">
                                <FileText size={48} style={{ opacity: 0.3 }} />

                                {busqueda.trim() !== "" ? (
                                    <>
                                        <p>No se encontraron resultados de la búsqueda</p>
                                        <p style={{ fontSize: "0.9rem", color: "#6b7280", marginTop: "8px" }}>
                                            <button
                                                onClick={handleLimpiarBusqueda}
                                                style={{
                                                    background: "none",
                                                    border: "none",
                                                    color: "#2563eb",
                                                    textDecoration: "underline",
                                                    cursor: "pointer",
                                                    padding: "0 4px",
                                                    font: "inherit",
                                                }}
                                            >
                                                Limpiar búsqueda
                                            </button>
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p>No hay notas todavía</p>
                                        <button className="btn-new" onClick={crearNuevaNota}>
                                            <Plus size={16} />
                                            Crear primera nota
                                        </button>
                                    </>
                                )}
                            </div>
                        ) : (
                            <section className="notes-list">
                                {notasPaginadas.map((nota) => (
                                    <div className="note-row" key={nota.id_nota}>
                                        <FileText size={18} className="icono-notas" />

                                        <div className="note-content">
                                            <h3>{nota.titulo}</h3>
                                            <span>Creada: {formatearFecha(nota.created_at)}</span>
                                            <span>Modificada: {formatearFecha(nota.updated_at)}</span>
                                        </div>

                                        <div className="note-actions">
                                            <Download
                                                size={16}
                                                className="icono-notas-exportar"
                                                onClick={() => descargarPDF(nota)}
                                                title="Descargar PDF"
                                            />
                                            <Share2
                                                size={16}
                                                className="icono-notas-compartir"
                                                onClick={() => abrirModalCompartir(nota)}
                                                title="Compartir"
                                            />
                                            <Pencil
                                                size={16}
                                                className="icono-notas-editar"
                                                onClick={() => editarNota(nota)}
                                                title="Editar"
                                            />
                                            <Type
                                                size={16}
                                                className="icono-notas-renombrar"
                                                onClick={() => abrirModalRenombrar(nota)}
                                                title="Renombrar"
                                            />
                                            <Trash2
                                                size={16}
                                                className="icono-notas-eliminar"
                                                onClick={() => abrirModalEliminar(nota)}
                                                title="Eliminar"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </section>
                        )}

                        {/* ── PAGINACIÓN ── */}
                        {notasPaginadas.length > 0 && (
                            <footer className="notes-pagination">
                                <button
                                    className={`page-arrow ${paginaActual === 1 ? "disabled" : ""}`}
                                    onClick={() => setPaginaActual((prev) => Math.max(1, prev - 1))}
                                    disabled={paginaActual === 1}
                                >
                                    &laquo;
                                </button>

                                <div className="page-numbers">
                                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
                                        <button
                                            key={num}
                                            className={`page-number ${paginaActual === num ? "active" : ""}`}
                                            onClick={() => setPaginaActual(num)}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    className={`page-arrow ${paginaActual === totalPaginas ? "disabled" : ""}`}
                                    onClick={() => setPaginaActual((prev) => Math.min(totalPaginas, prev + 1))}
                                    disabled={paginaActual === totalPaginas}
                                >
                                    &raquo;
                                </button>
                            </footer>
                        )}
                    </>
                )}
            </div>

            {/* ── MODALES ── */}
            <ModalEliminarNota
                isOpen={mostrarModalEliminar}
                onClose={cerrarModalEliminar}
                onConfirm={confirmarEliminarNota}
                nombreNota={notaSeleccionada?.titulo}
            />

            <ModalCompartirNota
                isOpen={mostrarModalCompartir}
                onClose={cerrarModalCompartir}
                onConfirm={confirmarCompartirNota}
                nombreNota={notaACompartir?.titulo}
                contenidoTexto={notaACompartir?.contenido?.replace(/<[^>]*>/g, "") || ""}
            />

            <ModalRenombrarNota
                isOpen={mostrarModalRenombrar}
                onClose={cerrarModalRenombrar}
                onConfirm={confirmarRenombrarNota}
                nombreActual={notaARenombrar?.titulo}
                notas={notas}
                notaActualId={notaARenombrar?.id_nota}
            />

            {/* ── ALERTA ── */}
            {mostrarAlert && (
                <CustomAlert
                    type={alertConfig.type}
                    title={alertConfig.title}
                    message={alertConfig.message}
                    logo={logo}
                    onClose={() => setMostrarAlert(false)}
                />
            )}
        </main>
    );
}