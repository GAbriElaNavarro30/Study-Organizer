import React from "react";
import "../styles/modalEliminar.css";

export function ModalEliminar({ isOpen, onClose, onConfirm, nombreUsuario }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay-eliminar">
            <div className="modal-contenedor-eliminar">
                <h2>Confirmar Eliminación</h2>

                <hr className="linea-separadora-eliminar" />

                <p>¿Estás seguro que deseas eliminar a <strong>{nombreUsuario}</strong>?</p>

                <div className="modal-botones-eliminar">
                    <button className="btn btn-confirmar-eliminar" onClick={onConfirm}>
                        Eliminar
                    </button>

                    <button className="btn btn-cancelar-eliminar" onClick={onClose}>
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}
