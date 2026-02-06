import "../styles/modal-confirmar.css";

export function ModalConfirmarCancelar({ isOpen, onCancel, onConfirm }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay-volver">
            <div className="modal-confirmar-volver">
                <h3>¿Desea cancelar?</h3>

                <hr className="modal-divider" />

                <p>
                    Los cambios que haya realizado se perderán.
                    ¿Desea continuar?
                </p>

                <div className="modal-acciones-volver">
                    <button
                        className="btn-confirmar-volver"
                        onClick={onConfirm}
                    >
                        Sí, cancelar
                    </button>

                    <button
                        className="btn-cancelar-volver"
                        onClick={onCancel}
                    >
                        No, volver
                    </button>
                </div>
            </div>
        </div>
    );
}
