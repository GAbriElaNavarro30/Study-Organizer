import { useState, useEffect } from "react";

export function useModalGuardarNota({ isOpen, modo, notas = [], onConfirm }) {
    const [titulo, setTitulo] = useState("");
    const [errores, setErrores] = useState([]);
    const [cargando, setCargando] = useState(false);

    /* ============================
       RESET AL ABRIR/CERRAR
    ============================ */
    useEffect(() => {
        if (isOpen) {
            setTitulo("");
            setErrores([]);
        }
    }, [isOpen]);

    /* ============================
       VALIDACIONES
    ============================ */
    const validarTitulo = (tituloInput) => {
        const erroresTemp = [];

        if (!tituloInput.trim()) {
            erroresTemp.push("El título no puede estar vacío");
            return erroresTemp;
        }

        if (tituloInput.trim().length > 100) {
            erroresTemp.push("El título no puede exceder los 100 caracteres");
        }

        const formatoValido = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-\_\.\,\:\!\?\(\)]+$/;
        if (!formatoValido.test(tituloInput.trim())) {
            erroresTemp.push("El título contiene caracteres no permitidos");
        }

        const tituloNormalizado = tituloInput.trim().toLowerCase();
        const existeDuplicado = notas.some(
            (nota) => nota.titulo.toLowerCase() === tituloNormalizado
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
        setTitulo(valor);

        if (modo === "crear") {
            setErrores(validarTitulo(valor));
        }
    };

    const handleConfirm = async () => {
        if (modo === "crear") {
            const erroresValidacion = validarTitulo(titulo);
            if (erroresValidacion.length > 0) {
                setErrores(erroresValidacion);
                return;
            }
        }

        setCargando(true);
        try {
            await onConfirm(titulo.trim());
        } finally {
            setCargando(false);
        }
    };

    return {
        titulo,
        errores,
        cargando,
        handleChange,
        handleConfirm,
    };
}