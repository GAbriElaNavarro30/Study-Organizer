import { useState, useEffect } from "react";

export function useModalRenombrarNota({ isOpen, nombreActual, notas = [], notaActualId, onConfirm, onClose }) {
    const [nuevoNombre, setNuevoNombre] = useState("");
    const [errores, setErrores] = useState([]);
    const [mostrarModalCancelar, setMostrarModalCancelar] = useState(false);
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setNuevoNombre(nombreActual || "");
            setErrores([]);
        }
    }, [isOpen, nombreActual]);

    /* ============================
       VALIDACIONES
    ============================ */
    const validarTitulo = (titulo) => {
        const erroresTemp = [];

        if (!titulo.trim()) {
            erroresTemp.push("El título no puede estar vacío");
            return erroresTemp;
        }

        if (titulo.trim().length > 100) {
            erroresTemp.push("El título no puede exceder los 100 caracteres");
        }

        const formatoValido = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-\_\.\,\:\!\?\(\)]+$/;
        if (!formatoValido.test(titulo.trim())) {
            erroresTemp.push("El título contiene caracteres no permitidos");
        }

        const tituloNormalizado = titulo.trim().toLowerCase();
        const existeDuplicado = notas.some(
            (nota) =>
                nota.titulo.toLowerCase() === tituloNormalizado &&
                nota.id_nota !== notaActualId
        );

        if (existeDuplicado) {
            erroresTemp.push("Ya tienes una nota con ese título");
        }

        return erroresTemp;
    };

    /* ============================
       HANDLERS
    ============================ */
    const handleChange = (e) => {
        const valor = e.target.value;
        setNuevoNombre(valor);
        setErrores(validarTitulo(valor));
    };

    const confirmarCambio = async () => {
        const erroresValidacion = validarTitulo(nuevoNombre);

        if (erroresValidacion.length > 0) {
            setErrores(erroresValidacion);
            return;
        }

        if (nuevoNombre.trim() === nombreActual?.trim()) {
            setErrores(["El nuevo título es igual al actual"]);
            return;
        }

        setCargando(true);
        try {
            await onConfirm(nuevoNombre.trim());
        } finally {
            setCargando(false);
        }
    };

    const handleCancelar = () => {
        const huboCambios = nuevoNombre.trim() !== (nombreActual?.trim() || "");
        if (huboCambios) {
            setMostrarModalCancelar(true);
        } else {
            onClose();
        }
    };

    const confirmarCancelar = () => {
        setMostrarModalCancelar(false);
        onClose();
    };

    const cancelarCancelar = () => {
        setMostrarModalCancelar(false);
    };

    const botonConfirmarDeshabilitado =
        !nuevoNombre.trim() ||
        errores.length > 0 ||
        cargando ||
        nuevoNombre.trim() === nombreActual?.trim();

    return {
        nuevoNombre,
        errores,
        cargando,
        mostrarModalCancelar,
        botonConfirmarDeshabilitado,
        handleChange,
        confirmarCambio,
        handleCancelar,
        confirmarCancelar,
        cancelarCancelar,
    };
}