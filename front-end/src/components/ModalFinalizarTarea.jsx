import React from "react";
import "../styles/modalFinalizar.css";

export function ModalFinalizarTarea({ isOpen, onClose, onConfirm, tarea }) {
    if (!isOpen || !tarea) return null;

    const accion = tarea.completed ? "marcar como pendiente" : "marcar como finalizada";

    return (
        <div className="modal-overlay-finalizar">
            <div className="modal-contenedor-finalizar">
                <h2>Confirmar Acción</h2>

                <hr className="linea-separadora-finalizar" />

                <p>
                    ¿Estás seguro que deseas <strong>{accion}</strong> la tarea <strong>{tarea.title}</strong>?
                </p>

                <div className="modal-botones-finalizar">
                    <button
                        className="btn btn-confirmar-finalizar"
                        onClick={onConfirm}
                    >
                        Confirmar
                    </button>
                    <button
                        className="btn btn-cancelar-finalizar"
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}
