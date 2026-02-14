import { useState, useEffect } from "react";
import "../styles/modal-guardar.css";

export function ModalGuardarNota({
    isOpen,
    modo, // "editar" | "crear"
    onCancel,
    onConfirm,
    notas = [],
}) {
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

    if (!isOpen) return null;

    /* ============================
       VALIDACIONES
    ============================ */
    const validarTitulo = (tituloInput) => {
        const erroresTemp = [];

        // 1. Verificar que no esté vacío
        if (!tituloInput.trim()) {
            erroresTemp.push("El título no puede estar vacío");
            return erroresTemp;
        }

        // 2. Longitud máxima
        if (tituloInput.trim().length > 100) {
            erroresTemp.push("El título no puede exceder los 100 caracteres");
        }

        // 3. Caracteres válidos
        const formatoValido = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-\_\.\,\:\!\?\(\)]+$/;
        if (!formatoValido.test(tituloInput.trim())) {
            erroresTemp.push("El título contiene caracteres no permitidos");
        }

        // 4. Verificar si ya existe una nota con ese título
        const tituloNormalizado = tituloInput.trim().toLowerCase();
        const existeDuplicado = notas.some(
            nota => nota.titulo.toLowerCase() === tituloNormalizado
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
        
        // Solo validar en modo crear
        if (modo === "crear") {
            const erroresValidacion = validarTitulo(valor);
            setErrores(erroresValidacion);
        }
    };

    const handleConfirm = async () => {
        if (modo === "crear") {
            // Validar antes de confirmar
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

    /* ============================
       RENDER
    ============================ */
    return (
        <div className="modal-overlay-guardar-nota">
            <div className="modal-guardar-guardar-nota">
                <h3>
                    {modo === "editar"
                        ? "¿Guardar cambios?"
                        : "Guardar nueva nota"}
                </h3>

                <hr className="modal-divider-guardar-nota" />

                {modo === "editar" ? (
                    <p>
                        ¿Estás seguro de guardar los cambios realizados en esta nota?
                    </p>
                ) : (
                    <>
                        <p>Escribe un nombre para tu nota:</p>
                        <input
                            className={`input-titulo-nota-guardar-nota ${
                                errores.length > 0 ? "input-error" : ""
                            }`}
                            placeholder="Ej. Ideas del proyecto"
                            value={titulo}
                            onChange={handleChange}
                            maxLength={100}
                            disabled={cargando}
                            autoFocus
                        />
                        
                        {/* Contador de caracteres */}
                        <div className="contador-caracteres-guardar">
                            {titulo.length}/100 caracteres
                        </div>

                        {/* Errores */}
                        {errores.length > 0 && (
                            <div className="errores-validacion-guardar">
                                {errores.map((error, index) => (
                                    <div key={index} className="error-item-guardar">
                                        <span>{error}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                <div className="modal-acciones-guardar-nota">
                    <button
                        className="btn-confirmar-guardar-nota"
                        onClick={handleConfirm}
                        disabled={cargando}
                    >
                        {cargando ? "Guardando..." : "Guardar"}
                    </button>

                    <button
                        className="btn-cancelar-guardar-nota"
                        onClick={onCancel}
                        disabled={cargando}
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}