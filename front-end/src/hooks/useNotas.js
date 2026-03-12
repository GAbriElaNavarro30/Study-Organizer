import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";

export function useNotas() {
    const navigate = useNavigate();

    // ── Notas ──
    const [notas, setNotas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ── Búsqueda y paginación ──
    const [busqueda, setBusqueda] = useState("");
    const [limit, setLimit] = useState(5);
    const [paginaActual, setPaginaActual] = useState(1);

    // ── Modal eliminar ──
    const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
    const [notaSeleccionada, setNotaSeleccionada] = useState(null);

    // ── Modal compartir ──
    const [mostrarModalCompartir, setMostrarModalCompartir] = useState(false);
    const [notaACompartir, setNotaACompartir] = useState(null);

    // ── Modal renombrar ──
    const [mostrarModalRenombrar, setMostrarModalRenombrar] = useState(false);
    const [notaARenombrar, setNotaARenombrar] = useState(null);

    // ── Alertas ──
    const [mostrarAlert, setMostrarAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ type: "success", title: "", message: "" });

    /* ────────────────────────────────────────────
       HELPER ALERTAS
    ──────────────────────────────────────────── */
    const mostrarAlerta = (type, title, message) => {
        setAlertConfig({ type, title, message });
        setMostrarAlert(true);
    };

    /* ────────────────────────────────────────────
       CARGAR NOTAS
    ──────────────────────────────────────────── */
    useEffect(() => {
        cargarNotas();
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const cargarNotas = async () => {
        try {
            setLoading(true);
            const { data } = await api.get("/notas/obtener-notas");
            setNotas(data);
            setError(null);
        } catch (error) {
            console.error("Error al cargar notas:", error);
            setError("No se pudieron cargar las notas");
        } finally {
            setLoading(false);
        }
    };

    /* ────────────────────────────────────────────
       UTILIDADES
    ──────────────────────────────────────────── */
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

    const construirHTMLNota = (nota) => {
        const bg = nota.background_color || "#ffffff";
        return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>${nota.titulo}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @page {
            size: Letter;
            margin: 2.54cm;
            background: ${bg};
        }
        body {
            background-color: ${bg};
            font-family: ${nota.font_family || "Arial"}, sans-serif;
            font-size: ${nota.font_size || 16}px;
            color: #111111;
            line-height: 1.6;
        }
        ul { list-style-type: disc; padding-left: 2em; margin: 0.5em 0; }
        ol { list-style-type: decimal; padding-left: 2em; margin: 0.5em 0; }
        li { margin: 0.2em 0; display: list-item; }
        ul ul { list-style-type: circle; }
        ul ul ul { list-style-type: square; }
    </style>
</head>
<body>
    ${nota.contenido || "<p>Sin contenido</p>"}
</body>
</html>`;
    };

    /* ────────────────────────────────────────────
       FILTRADO Y PAGINACIÓN
    ──────────────────────────────────────────── */
    const notasFiltradas = notas.filter((nota) =>
        nota.titulo.toLowerCase().includes(busqueda.toLowerCase())
    );

    const totalPaginas = Math.ceil(notasFiltradas.length / limit);

    const notasPaginadas = notasFiltradas.slice(
        (paginaActual - 1) * limit,
        paginaActual * limit
    );

    const handleCambiarLimit = (nuevoLimit) => {
        setLimit(nuevoLimit);
        setPaginaActual(1);
    };

    const handleLimpiarBusqueda = () => setBusqueda("");

    /* ────────────────────────────────────────────
       MODAL ELIMINAR
    ──────────────────────────────────────────── */
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
            await api.delete(`/notas/eliminar-nota/${notaSeleccionada.id_nota}`);
            await cargarNotas();
            mostrarAlerta(
                "success",
                "¡Nota eliminada!",
                `La nota "${notaSeleccionada.titulo}" ha sido eliminada exitosamente.`
            );
        } catch (error) {
            console.error("Error al eliminar nota:", error);
            mostrarAlerta("error", "Error al eliminar", "No se pudo eliminar la nota. Por favor, intenta nuevamente.");
        } finally {
            cerrarModalEliminar();
        }
    };

    /* ────────────────────────────────────────────
       MODAL COMPARTIR
    ──────────────────────────────────────────── */
    const abrirModalCompartir = (nota) => {
        setNotaACompartir(nota);
        setMostrarModalCompartir(true);
    };

    const cerrarModalCompartir = () => {
        setMostrarModalCompartir(false);
        setNotaACompartir(null);
    };

    const confirmarCompartirNota = async ({ tipo, email, chatId, telefono }) => {
        try {
            const htmlCompleto = construirHTMLNota(notaACompartir);

            if (tipo === "email") {
                await api.post(`/notas/compartir-nota/${notaACompartir.id_nota}`, { email, html: htmlCompleto });
                mostrarAlerta("success", "¡Nota compartida!", `El PDF fue enviado a ${email}`);

            } else if (tipo === "telegram") {
                await api.post(`/notas/compartir-telegram/${notaACompartir.id_nota}`, { chatId, html: htmlCompleto });
                mostrarAlerta("success", "¡Nota compartida!", "El PDF fue enviado por Telegram");

            } else if (tipo === "whatsapp") {
                await api.post(`/notas/compartir-whatsapp/${notaACompartir.id_nota}`, { telefono, html: htmlCompleto });
                mostrarAlerta("success", "¡Nota compartida!", `El PDF fue enviado por WhatsApp a ${telefono}`);
            }

            cerrarModalCompartir();
        } catch (error) {
            mostrarAlerta("error", "Error al compartir", error.response?.data?.error || error.message);
        }
    };

    /* ────────────────────────────────────────────
       MODAL RENOMBRAR
    ──────────────────────────────────────────── */
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
            await api.patch(`/notas/renombrar-nota/${notaARenombrar.id_nota}`, { titulo: nuevoNombre });
            await cargarNotas();
            mostrarAlerta("success", "¡Nota renombrada!", `La nota ha sido renombrada a "${nuevoNombre}" exitosamente.`);
            cerrarModalRenombrar();
        } catch (error) {
            console.error("Error al renombrar nota:", error);
            mostrarAlerta("error", "Error al renombrar", error.response?.data?.error || error.message || "No se pudo renombrar la nota.");
        }
    };

    /* ────────────────────────────────────────────
       DESCARGAR PDF
    ──────────────────────────────────────────── */
    const descargarPDF = async (nota) => {
        try {
            mostrarAlerta("success", "Generando PDF...", "Por favor espera un momento.");
            const htmlCompleto = construirHTMLNota(nota);
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/notas/exportar-pdf/${nota.id_nota}`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ html: htmlCompleto }),
                }
            );
            if (!response.ok) throw new Error("Error al generar el PDF");
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${nota.titulo}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
            mostrarAlerta("success", "¡PDF descargado!", `El PDF de "${nota.titulo}" se ha descargado correctamente.`);
        } catch (error) {
            console.error("Error al descargar PDF:", error);
            mostrarAlerta("error", "Error al generar PDF", "No se pudo generar el PDF. Por favor, intenta nuevamente.");
        }
    };

    const editarNota = (nota) => {
        localStorage.setItem(
            "editorNota",
            JSON.stringify({
                notaId: nota.id_nota,
                titulo: nota.titulo,
                contenido: nota.contenido,
                backgroundColor: nota.background_color,  // ← antes: nota.color_fondo
                fontFamily: nota.font_family,             // ← antes: nota.tipo_letra
                fontSize: nota.font_size,                 // ← antes: nota.tamano_letra
            })
        );
        navigate("/editor-nota");
    };

    const crearNuevaNota = () => {
        localStorage.removeItem("editorNota");
        navigate("/editor-nota");
    };

    return {
        // Estado de notas
        notas,
        loading,
        error,
        cargarNotas,

        // Búsqueda y paginación
        busqueda, setBusqueda,
        limit,
        paginaActual, setPaginaActual,
        notasFiltradas,
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
    };
}