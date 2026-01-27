import "../styles/modalCerrarSesion.css";
import { IoClose } from "react-icons/io5";

export function ModalCerrarSesion({ isOpen, onClose, onConfirm }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay-logout" onClick={onClose}>
            <div
                className="modal-container-logout"
                onClick={(e) => e.stopPropagation()}
            >
                <button className="modal-close-btn" onClick={onClose}>
                    <IoClose />
                </button>

                <h3>¿Cerrar sesión?</h3>

                <hr className="linea-menu-usuario" />

                <p>¿Estás seguro de que desea cerrar su sesión?</p>

                <div className="modal-buttons-logout">
                    <button className="btn btn-cancelar" onClick={onClose}>
                        Cancelar
                    </button>
                    <button className="btn btn-confirmar" onClick={onConfirm}>
                        Cerrar sesión
                    </button>
                </div>
            </div>
        </div>
    );
}
