import "../styles/notas.css";
import { FileText, Plus, Search, Download, Share2, Pencil, Trash2, Type } from "lucide-react";
import logoNotas from "../assets/imagenes/fondo-notas.png";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { ModalEliminarNota } from "../components/ModalEliminarNota";
import { ModalCompartirNota } from "../components/ModalCompartirNota";
import { ModalRenombrarNota } from "../components/ModalRenombrarNota";

export function Notas() {
    const navigate = useNavigate();

    // Estados de notas
    const [notas, setNotas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados de búsqueda y filtros
    const [busqueda, setBusqueda] = useState("");
    const [limit, setLimit] = useState(10);
    const [paginaActual, setPaginaActual] = useState(1);

    // Estados de modales
    const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
    const [notaSeleccionada, setNotaSeleccionada] = useState(null);

    const [mostrarModalCompartir, setMostrarModalCompartir] = useState(false);
    const [notaACompartir, setNotaACompartir] = useState(null);

    const [mostrarModalRenombrar, setMostrarModalRenombrar] = useState(false);
    const [notaARenombrar, setNotaARenombrar] = useState(null);

    /* ===== CARGAR NOTAS AL INICIAR ===== */
    useEffect(() => {
        cargarNotas();
    }, []);

    const cargarNotas = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:3000/notas/obtener-notas", {
                method: "GET",
                credentials: "include", // Importante: envía las cookies
            });

            if (!response.ok) {
                throw new Error("Error al cargar las notas");
            }

            const data = await response.json();
            setNotas(data);
            setError(null);
        } catch (error) {
            console.error("Error al cargar notas:", error);
            setError("No se pudieron cargar las notas");
        } finally {
            setLoading(false);
        }
    };

    /* ===== FORMATEAR FECHA ===== */
    const formatearFecha = (fecha) => {
        if (!fecha) return "Sin fecha";
        const date = new Date(fecha);
        return date.toLocaleDateString("es-MX", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    /* ===== FILTRAR NOTAS ===== */
    const notasFiltradas = notas.filter((nota) =>
        nota.titulo.toLowerCase().includes(busqueda.toLowerCase())
    );

    /* ===== PAGINACIÓN ===== */
    const totalPaginas = Math.ceil(notasFiltradas.length / limit);
    const notasPaginadas = notasFiltradas.slice(
        (paginaActual - 1) * limit,
        paginaActual * limit
    );

    /* ===== MODAL ELIMINAR ===== */
    const abrirModalEliminar = (nota) => {
        setNotaSeleccionada(nota);
        setMostrarModalEliminar(true);
    };

    const cerrarModalEliminar = () => {
        setMostrarModalEliminar(false);
        setNotaSeleccionada(null);
    };

    const confirmarEliminarNota = async () => {
        try {
            const response = await fetch(
                `http://localhost:3000/notas/eliminar-nota/${notaSeleccionada.id_nota}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            if (!response.ok) {
                throw new Error("Error al eliminar la nota");
            }

            // Recargar notas después de eliminar
            await cargarNotas();
            alert("Nota eliminada exitosamente");
        } catch (error) {
            console.error("Error al eliminar nota:", error);
            alert("Error al eliminar la nota");
        } finally {
            cerrarModalEliminar();
        }
    };

    /* ===== MODAL COMPARTIR ===== */
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
        // Implementar lógica de compartir
        cerrarModalCompartir();
    };

    /* ===== MODAL RENOMBRAR ===== */
    const abrirModalRenombrar = (nota) => {
        setNotaARenombrar(nota);
        setMostrarModalRenombrar(true);
    };

    const cerrarModalRenombrar = () => {
        setMostrarModalRenombrar(false);
        setNotaARenombrar(null);
    };

    const confirmarRenombrarNota = async (nuevoNombre) => {
        try {
            const response = await fetch(
                `http://localhost:3000/notas/renombrar-nota/${notaARenombrar.id_nota}`,
                {
                    method: "PATCH",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        titulo: nuevoNombre
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Error al renombrar la nota");
            }

            // Recargar notas después de renombrar
            await cargarNotas();
            alert("Nota renombrada exitosamente");
        } catch (error) {
            console.error("Error al renombrar nota:", error);
            alert("Error al renombrar la nota");
        } finally {
            cerrarModalRenombrar();
        }
    };

    /* ===== DESCARGAR PDF ===== */
    const descargarPDF = async (nota) => {
        try {
            // Crear un div temporal con el contenido de la nota
            const pdfContainer = document.createElement("div");
            pdfContainer.style.cssText = `
                position: absolute;
                left: -9999px;
                top: 0;
                width: 210mm;
                padding: 20mm;
                background-color: ${nota.background_color || "#ffffff"};
                font-family: ${nota.font_family || "Arial"};
                font-size: ${nota.font_size || "16"}px;
            `;

            pdfContainer.innerHTML = `
                <div style="margin-bottom: 20px;">
                    <h1 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
                        ${nota.titulo}
                    </h1>
                </div>
                <div style="margin-top: 20px; line-height: 1.6;">
                    ${nota.contenido}
                </div>
                <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
                    Creado: ${formatearFecha(nota.created_at)}
                </div>
            `;

            document.body.appendChild(pdfContainer);

            // Importar dinámicamente html2canvas y jsPDF
            const html2canvas = (await import("html2canvas")).default;
            const jsPDF = (await import("jspdf")).default;

            const canvas = await html2canvas(pdfContainer, {
                scale: 2,
                useCORS: true,
                backgroundColor: nota.background_color || "#ffffff",
            });

            document.body.removeChild(pdfContainer);

            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            const imgData = canvas.toDataURL("image/png");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

            // Descargar
            pdf.save(`${nota.titulo}.pdf`);

            console.log("✅ PDF descargado");
        } catch (error) {
            console.error("Error al generar PDF:", error);
            alert("Error al generar el PDF");
        }
    };

    /* ===== EDITAR NOTA ===== */
    const editarNota = (nota) => {
        // Guardar la nota en localStorage para cargarla en el editor
        localStorage.setItem(
            "editorNota",
            JSON.stringify({
                notaId: nota.id_nota,
                titulo: nota.titulo,
                contenido: nota.contenido,
                backgroundColor: nota.background_color,
                fontFamily: nota.font_family,
                fontSize: nota.font_size,
            })
        );

        navigate("/editor-nota");
    };

    /* ===== CREAR NUEVA NOTA ===== */
    const crearNuevaNota = () => {
        // Limpiar completamente el localStorage
        localStorage.removeItem("editorNota");
        
        // Navegar al editor - el useEffect del editor detectará que no hay datos y mostrará un editor limpio
        navigate("/editor-nota");
    };

    /* ===== RENDER ===== */
    return (
        <main className="notes-app">
            <div className="notas-contenedor">
                <img src={logoNotas} alt="Mis notas" className="notas-logo" />
            </div>

            <div className="contenedor-notas-almacenadas">
                {/* ===== TOP ===== */}
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
                            onChange={(e) => {
                                setLimit(Number(e.target.value));
                                setPaginaActual(1);
                            }}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={20}>20</option>
                        </select>
                        <span>resultados</span>
                    </div>
                </header>

                {/* ===== ESTADOS DE CARGA ===== */}
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

                {/* ===== LISTA DE NOTAS ===== */}
                {!loading && !error && (
                    <>
                        {notasPaginadas.length === 0 ? (
                            <div className="notes-empty">
                                <FileText size={48} style={{ opacity: 0.3 }} />
                                <p>No hay notas todavía</p>
                                <button className="btn-new" onClick={crearNuevaNota}>
                                    <Plus size={16} />
                                    Crear primera nota
                                </button>
                            </div>
                        ) : (
                            <section className="notes-list">
                                {notasPaginadas.map((nota) => (
                                    <div className="note-row" key={nota.id_nota}>
                                        <FileText size={18} className="icono-notas" />

                                        <div className="note-content">
                                            <h3>{nota.titulo}</h3>
                                            <span>
                                                Creada: {formatearFecha(nota.created_at)}
                                            </span>
                                            <span>
                                                Modificada: {formatearFecha(nota.updated_at)}
                                            </span>
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

                        {/* ===== PAGINACIÓN ===== */}
                        {totalPaginas > 1 && (
                            <footer className="notes-pagination">
                                <button
                                    className={`page-arrow ${
                                        paginaActual === 1 ? "disabled" : ""
                                    }`}
                                    onClick={() =>
                                        setPaginaActual((prev) => Math.max(1, prev - 1))
                                    }
                                    disabled={paginaActual === 1}
                                >
                                    &laquo;
                                </button>

                                <div className="page-numbers">
                                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(
                                        (num) => (
                                            <button
                                                key={num}
                                                className={`page-number ${
                                                    paginaActual === num ? "active" : ""
                                                }`}
                                                onClick={() => setPaginaActual(num)}
                                            >
                                                {num}
                                            </button>
                                        )
                                    )}
                                </div>

                                <button
                                    className={`page-arrow ${
                                        paginaActual === totalPaginas ? "disabled" : ""
                                    }`}
                                    onClick={() =>
                                        setPaginaActual((prev) =>
                                            Math.min(totalPaginas, prev + 1)
                                        )
                                    }
                                    disabled={paginaActual === totalPaginas}
                                >
                                    &raquo;
                                </button>
                            </footer>
                        )}
                    </>
                )}
            </div>

            {/* ===== MODALES ===== */}
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
            />

            <ModalRenombrarNota
                isOpen={mostrarModalRenombrar}
                onClose={cerrarModalRenombrar}
                onConfirm={confirmarRenombrarNota}
                nombreActual={notaARenombrar?.titulo}
            />
        </main>
    );
}