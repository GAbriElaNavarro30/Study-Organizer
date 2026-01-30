import "../styles/modal-confirmar.css";

export function ModalConfirmarSalir({ isOpen, onCancel, onConfirm }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay-volver">
            <div className="modal-confirmar-volver">
                <h3>¿Salir del editor?</h3>

                <hr className="modal-divider" />

                <p>
                    Los cambios que no hayas guardado se perderán.
                    ¿Deseas continuar?
                </p>

                <div className="modal-acciones-volver">
                    <button
                        className="btn-confirmar-volver"
                        onClick={onConfirm}
                    >
                        Salir
                    </button>

                    <button
                        className="btn-cancelar-volver"
                        onClick={onCancel}
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}
