import "../styles/notas.css";
import { FileText, Plus, Search, Download, Share2, Pencil, Trash2, Type } from "lucide-react";
import logoNotas from "../assets/imagenes/fondo-notas.png";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { ModalEliminarNota } from "../components/ModalEliminarNota";
import { ModalCompartirNota } from "../components/ModalCompartirNota";
import { ModalRenombrarNota } from "../components/ModalRenombrarNota";
import { CustomAlert } from "../components/CustomAlert";
import logo from "../assets/imagenes/logotipo.png";

export function Notas() {
    const navigate = useNavigate();

    // Estados de notas
    const [notas, setNotas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados de búsqueda y filtros
    const [busqueda, setBusqueda] = useState("");
    const [limit, setLimit] = useState(5);
    const [paginaActual, setPaginaActual] = useState(1);

    // Estados de modales
    const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
    const [notaSeleccionada, setNotaSeleccionada] = useState(null);

    const [mostrarModalCompartir, setMostrarModalCompartir] = useState(false);
    const [notaACompartir, setNotaACompartir] = useState(null);

    const [mostrarModalRenombrar, setMostrarModalRenombrar] = useState(false);
    const [notaARenombrar, setNotaARenombrar] = useState(null);

    // Estados para CustomAlert
    const [mostrarAlert, setMostrarAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        type: "success",
        title: "",
        message: ""
    });

    /* ===== FUNCIÓN HELPER PARA MOSTRAR ALERTAS ===== */
    const mostrarAlerta = (type, title, message) => {
        setAlertConfig({ type, title, message });
        setMostrarAlert(true);
    };

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

            // Mostrar alerta de éxito
            mostrarAlerta(
                "success",
                "¡Nota eliminada!",
                `La nota "${notaSeleccionada.titulo}" ha sido eliminada exitosamente.`
            );
        } catch (error) {
            console.error("Error al eliminar nota:", error);

            // Mostrar alerta de error
            mostrarAlerta(
                "error",
                "Error al eliminar",
                "No se pudo eliminar la nota. Por favor, intenta nuevamente."
            );
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

        // Mostrar alerta de éxito
        mostrarAlerta(
            "success",
            "¡Nota compartida!",
            `La nota "${notaACompartir.titulo}" ha sido compartida exitosamente.`
        );

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

            const data = await response.json();

            if (!response.ok) {
                // Si el backend detecta un error (por si acaso), mostrar alert
                throw new Error(data.error || "Error al renombrar la nota");
            }

            // Recargar notas después de renombrar
            await cargarNotas();

            // Mostrar alerta de éxito
            mostrarAlerta(
                "success",
                "¡Nota renombrada!",
                `La nota ha sido renombrada a "${nuevoNombre}" exitosamente.`
            );

            // Cerrar modal
            cerrarModalRenombrar();
        } catch (error) {
            console.error("Error al renombrar nota:", error);

            // Solo mostrar alert si es un error inesperado del servidor
            mostrarAlerta(
                "error",
                "Error al renombrar",
                error.message || "No se pudo renombrar la nota. Por favor, intenta nuevamente."
            );

            // NO cerrar el modal para que el usuario pueda corregir
        }
    };

    /* ===== DESCARGAR PDF ===== */
    const descargarPDF = async (nota) => {
        try {
            // Obtener datos actualizados del backend
            const response = await fetch(
                `http://localhost:3000/notas/exportar-pdf/${nota.id_nota}`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            if (!response.ok) {
                throw new Error("Error al obtener datos de la nota");
            }

            const data = await response.json();
            const notaData = data.nota;

            // Crear un div temporal con el contenido de la nota
            const pdfContainer = document.createElement("div");
            pdfContainer.style.cssText = `
                position: absolute;
                left: -9999px;
                top: 0;
                width: 210mm;
                min-height: 297mm;
                padding: 20mm;
                box-sizing: border-box;
                background-color: ${notaData.background_color || "#ffffff"};
                font-family: ${notaData.font_family || "Arial"};
                font-size: ${notaData.font_size || "16"}px;
            `;

            // Solo el contenido
            pdfContainer.innerHTML = `
                <div style="line-height: 1.6;">
                    ${notaData.contenido}
                </div>
            `;

            document.body.appendChild(pdfContainer);

            // Importar dinámicamente html2canvas y jsPDF
            const html2canvas = (await import("html2canvas")).default;
            const jsPDF = (await import("jspdf")).default;

            const canvas = await html2canvas(pdfContainer, {
                scale: 2,
                useCORS: true,
                backgroundColor: notaData.background_color || "#ffffff",
            });

            document.body.removeChild(pdfContainer);

            // Crear PDF con jsPDF
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            const backgroundColor = notaData.background_color || "#ffffff";

            // Convertir hex a RGB
            const hexToRgb = (hex) => {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16)
                } : { r: 255, g: 255, b: 255 };
            };

            const rgb = hexToRgb(backgroundColor);

            // Dimensiones de la página
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            // ✅ Definir márgenes (en mm)
            const margin = 20; // 20mm de margen en todos los lados
            const contentWidth = pageWidth - (margin * 2);
            const contentHeight = pageHeight - (margin * 2);

            // Calcular dimensiones de la imagen
            const imgData = canvas.toDataURL("image/png");
            const imgWidth = contentWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // ✅ PRIMERA PÁGINA: Pintar fondo completo
            pdf.setFillColor(rgb.r, rgb.g, rgb.b);
            pdf.rect(0, 0, pageWidth, pageHeight, 'F');

            // Variables para paginación
            let heightLeft = imgHeight;
            let position = margin; // Empezar en el margen superior

            // ✅ Agregar contenido con márgenes
            if (heightLeft <= contentHeight) {
                // Todo cabe en una página
                pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
            } else {
                // Contenido ocupa múltiples páginas
                let srcY = 0; // Posición Y en la imagen original

                while (heightLeft > 0) {
                    // Calcular cuánto contenido cabe en esta página
                    const pageContentHeight = Math.min(contentHeight, heightLeft);

                    // Si no es la primera página, agregar nueva página
                    if (srcY > 0) {
                        pdf.addPage();

                        // Pintar fondo completo de la nueva página
                        pdf.setFillColor(rgb.r, rgb.g, rgb.b);
                        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
                    }

                    // Calcular qué porción de la imagen mostrar
                    const srcHeight = (pageContentHeight * canvas.width) / imgWidth;
                    const destHeight = pageContentHeight;

                    // ✅ Crear un canvas temporal con solo la porción visible
                    const tempCanvas = document.createElement('canvas');
                    const tempCtx = tempCanvas.getContext('2d');

                    tempCanvas.width = canvas.width;
                    tempCanvas.height = srcHeight;

                    // Dibujar la porción correspondiente
                    tempCtx.drawImage(
                        canvas,
                        0, srcY,                    // Origen en canvas original
                        canvas.width, srcHeight,    // Tamaño a copiar
                        0, 0,                       // Destino en canvas temporal
                        canvas.width, srcHeight     // Tamaño en canvas temporal
                    );

                    // Convertir a imagen y agregar al PDF
                    const tempImgData = tempCanvas.toDataURL("image/png");
                    pdf.addImage(tempImgData, "PNG", margin, margin, imgWidth, destHeight);

                    // Actualizar contadores
                    srcY += srcHeight;
                    heightLeft -= pageContentHeight;
                }
            }

            // Descargar con el nombre del título
            pdf.save(`${notaData.titulo}.pdf`);

            console.log("✅ PDF descargado correctamente con márgenes");

            // Mostrar alerta de éxito
            mostrarAlerta(
                "success",
                "¡PDF descargado!",
                `El PDF de "${notaData.titulo}" se ha descargado correctamente.`
            );
        } catch (error) {
            console.error("❌ Error al generar PDF:", error);

            // Mostrar alerta de error
            mostrarAlerta(
                "error",
                "Error al generar PDF",
                "No se pudo generar el PDF. Por favor, intenta nuevamente."
            );
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
                {/* ===== LISTA DE NOTAS ===== */}
                {!loading && !error && (
                    <>
                        {notasPaginadas.length === 0 ? (
                            <div className="notes-empty">
                                <FileText size={48} style={{ opacity: 0.3 }} />

                                {/* Diferenciar entre "no hay notas" y "búsqueda sin resultados" */}
                                {busqueda.trim() !== "" ? (
                                    <>
                                        <p>No se encontraron resultados de la búsqueda</p>
                                        <p style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '8px' }}>
                                            <button
                                                onClick={() => setBusqueda("")}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#2563eb',
                                                    textDecoration: 'underline',
                                                    cursor: 'pointer',
                                                    padding: '0 4px',
                                                    font: 'inherit'
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

                        {/* ===== PAGINACIÓN - SIEMPRE VISIBLE CUANDO HAY NOTAS ===== */}
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
                notas={notas} // Pasar todas las notas
                notaActualId={notaARenombrar?.id_nota} // Pasar el ID de la nota actual
            />

            {/* ===== CUSTOM ALERT ===== */}
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