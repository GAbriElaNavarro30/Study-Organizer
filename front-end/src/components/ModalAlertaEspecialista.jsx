import { IoCloseOutline, IoHeartOutline } from "react-icons/io5";
import "../styles/ModalAlertaEspecialista.css";

export function ModalAlertaEspecialista({ visible, onClose }) {
    if (!visible) return null;

    return (
        <>
            <div className="mae-overlay" aria-hidden="true" />
            <div className="mae-box" role="dialog" aria-modal="true" aria-labelledby="mae-titulo">

                <div className="mae-header">
                    <div className="mae-icon">
                        <IoHeartOutline size={22} color="#0ea5e9" />
                    </div>
                    <button className="mae-close" onClick={onClose} aria-label="Cerrar">
                        <IoCloseOutline size={20} />
                    </button>
                </div>

                <div className="mae-body">
                    <h3 id="mae-titulo" className="mae-titulo">
                        Queremos que estés bien
                    </h3>
                    <p className="mae-mensaje">
                        Hemos notado que estos días no han sido fáciles.
                        Hablar con un especialista puede ayudarte a sentirte mejor.
                        No tienes que pasar por esto solo.
                    </p>
                </div>

                <div className="mae-footer">
                    <button className="mae-btn-ok" onClick={onClose}>
                        Entendido
                    </button>
                </div>

            </div>
        </>
    );
}