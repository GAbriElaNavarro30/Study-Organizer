import { useState, useEffect } from "react";
import "../styles/modalRenombrar.css";
import { Type } from "lucide-react";
import { ModalConfirmarCancelar } from "./ModalConfirmarCancelar";

export function ModalRenombrarNota({
    isOpen,
    onClose,
    onConfirm,
    nombreActual,
    notas = [], // ⬅️ Recibir todas las notas
    notaActualId, // ⬅️ Recibir el ID de la nota actual
}) {
    const [nuevoNombre, setNuevoNombre] = useState("");
    const [errores, setErrores] = useState([]);
    const [mostrarModalCancelar, setMostrarModalCancelar] = useState(false);
    const [cargando, setCargando] = useState(false);

    /* ============================
       CARGA / RESET
    ============================ */
    useEffect(() => {
        if (isOpen) {
            setNuevoNombre(nombreActual || "");
            setErrores([]);
        }
    }, [isOpen, nombreActual]);

    if (!isOpen) return null;

    /* ============================
       VALIDACIONES
    ============================ */
    const validarTitulo = (titulo) => {
        const erroresTemp = [];

        // 1. Verificar que no esté vacío
        if (!titulo.trim()) {
            erroresTemp.push("El título no puede estar vacío");
            return erroresTemp;
        }

        // 2. Longitud máxima
        if (titulo.trim().length > 100) {
            erroresTemp.push("El título no puede exceder los 100 caracteres");
        }

        // 3. Caracteres válidos
        const formatoValido = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-\_\.\,\:\!\?\(\)]+$/;
        if (!formatoValido.test(titulo.trim())) {
            erroresTemp.push("El título contiene caracteres no permitidos");
        }

        // 4. Verificar si ya existe una nota con ese título (excluyendo la nota actual)
        const tituloNormalizado = titulo.trim().toLowerCase();
        const existeDuplicado = notas.some(
            nota => 
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
        
        // Validar en tiempo real
        const erroresValidacion = validarTitulo(valor);
        setErrores(erroresValidacion);
    };

    const confirmarCambio = async () => {
        // Validar antes de enviar
        const erroresValidacion = validarTitulo(nuevoNombre);
        
        if (erroresValidacion.length > 0) {
            setErrores(erroresValidacion);
            return;
        }

        // Verificar si el título cambió
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
        // Verificar si hubo cambios
        const huCambios = nuevoNombre.trim() !== (nombreActual?.trim() || "");
        
        if (huCambios) {
            // Mostrar modal de confirmación
            setMostrarModalCancelar(true);
        } else {
            // Cerrar directamente si no hay cambios
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

    /* ============================
       RENDER
    ============================ */
    return (
        <>
            <div className="modal-overlay-renombrar">
                <div className="modal-contenedor-renombrar">

                    {/* HEADER */}
                    <div className="modal-header-renombrar">
                        <Type size={20} />
                        <h2>Cambiar título</h2>
                    </div>

                    <hr className="modal-divider-renombrar" />

                    {/* DESCRIPCIÓN */}
                    <p className="modal-descripcion-renombrar">
                        Escribe el nuevo nombre para la nota.
                    </p>

                    {/* INPUT */}
                    <div className="campo-renombrar">
                        <label>Nuevo título</label>
                        <input
                            type="text"
                            value={nuevoNombre}
                            onChange={handleChange}
                            placeholder="Ej. Ideas del proyecto final"
                            autoFocus
                            maxLength={100}
                            disabled={cargando}
                            className={errores.length > 0 ? "input-error" : ""}
                        />
                        
                        {/* Contador de caracteres */}
                        <div className="contador-caracteres">
                            {nuevoNombre.length}/100 caracteres
                        </div>
                    </div>

                    {/* ERRORES */}
                    {errores.length > 0 && (
                        <div className="errores-validacion">
                            {errores.map((error, index) => (
                                <div key={index} className="error-item">
                                    <span>{error}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* BOTONES */}
                    <div className="modal-botones-renombrar">
                        <button
                            className="btn btn-confirmar-renombrar"
                            onClick={confirmarCambio}
                            disabled={
                                !nuevoNombre.trim() || 
                                errores.length > 0 || 
                                cargando ||
                                nuevoNombre.trim() === nombreActual?.trim()
                            }
                        >
                            {cargando ? "Guardando..." : "Guardar cambios"}
                        </button>

                        <button
                            className="btn btn-cancelar-renombrar"
                            onClick={handleCancelar}
                            disabled={cargando}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>

            {/* MODAL DE CONFIRMACIÓN PARA CANCELAR */}
            <ModalConfirmarCancelar
                isOpen={mostrarModalCancelar}
                onCancel={cancelarCancelar}
                onConfirm={confirmarCancelar}
            />
        </>
    );
}