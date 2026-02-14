import "../styles/modalEliminar.css";

export function ModalEliminarNota({ isOpen, onClose, onConfirm, nombreNota }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay-eliminar">
            <div className="modal-contenedor-eliminar">
                <h2>Eliminar nota</h2>

                <hr className="linea-separadora-eliminar" />

                <p>
                    ¿Está seguro que desea eliminar la nota: "
                    <strong>{nombreNota}</strong>"?
                </p>

                <div className="modal-botones-eliminar">
                    <button
                        className="btn btn-confirmar-eliminar"
                        onClick={onConfirm}
                    >
                        Eliminar
                    </button>

                    <button
                        className="btn btn-cancelar-eliminar"
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}