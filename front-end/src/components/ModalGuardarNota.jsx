import "../styles/modal-guardar.css";
import { useModalGuardarNota } from "../hooks/useModalGuardarNota";

export function ModalGuardarNota({ isOpen, modo, onCancel, onConfirm, notas = [] }) {
    const { titulo, errores, cargando, handleChange, handleConfirm } = useModalGuardarNota({
        isOpen,
        modo,
        notas,
        onConfirm,
    });

    if (!isOpen) return null;

    return (
        <div className="modal-overlay-guardar-nota">
            <div className="modal-guardar-guardar-nota">
                <h3>
                    {modo === "editar" ? "¿Guardar cambios?" : "Guardar nueva nota"}
                </h3>

                <hr className="modal-divider-guardar-nota" />

                {modo === "editar" ? (
                    <p>¿Estás seguro de guardar los cambios realizados en esta nota?</p>
                ) : (
                    <>
                        <p>Escribe un nombre para tu nota:</p>
                        <input
                            className={`input-titulo-nota-guardar-nota ${errores.length > 0 ? "input-error" : ""}`}
                            placeholder="Ej. Ideas del proyecto"
                            value={titulo}
                            onChange={handleChange}
                            maxLength={100}
                            disabled={cargando}
                            autoFocus
                        />

                        <div className="contador-caracteres-guardar">
                            {titulo.length}/100 caracteres
                        </div>

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