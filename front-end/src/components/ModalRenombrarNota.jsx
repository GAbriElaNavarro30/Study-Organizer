import "../styles/modalRenombrar.css";
import { Type } from "lucide-react";
import { ModalConfirmarCancelar } from "./ModalConfirmarCancelar";
import { useModalRenombrarNota } from "../hooks/useModalRenombrarNota";

export function ModalRenombrarNota({ isOpen, onClose, onConfirm, nombreActual, notas = [], notaActualId }) {
    const {
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
    } = useModalRenombrarNota({ isOpen, nombreActual, notas, notaActualId, onConfirm, onClose });

    if (!isOpen) return null;

    return (
        <>
            <div className="modal-overlay-renombrar">
                <div className="modal-contenedor-renombrar">

                    <div className="modal-header-renombrar">
                        <Type size={20} />
                        <h2>Cambiar título</h2>
                    </div>

                    <hr className="modal-divider-renombrar" />

                    <p className="modal-descripcion-renombrar">
                        Escribe el nuevo nombre para la nota.
                    </p>

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
                        <div className="contador-caracteres">
                            {nuevoNombre.length}/100 caracteres
                        </div>
                    </div>

                    {errores.length > 0 && (
                        <div className="errores-validacion">
                            {errores.map((error, index) => (
                                <div key={index} className="error-item">
                                    <span>{error}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="modal-botones-renombrar">
                        <button
                            className="btn btn-confirmar-renombrar"
                            onClick={confirmarCambio}
                            disabled={botonConfirmarDeshabilitado}
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

            <ModalConfirmarCancelar
                isOpen={mostrarModalCancelar}
                onCancel={cancelarCancelar}
                onConfirm={confirmarCancelar}
            />
        </>
    );
}