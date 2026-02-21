import { IoWarningOutline } from "react-icons/io5";
import "../styles/modal-abandonar-test.css";

export function ModalAbandonarTest({ respondidas, onContinuar, onAbandonar }) {
    return (
        <div className="modal-overlay-ea" onClick={onContinuar}>
            <div className="modal-box-ea" onClick={(e) => e.stopPropagation()}>
                <div className="modal-icon-ea">
                    <IoWarningOutline size={26} />
                </div>

                <h2 className="modal-title-ea">¿Abandonar el test?</h2>

                <p className="modal-desc-ea">
                    {respondidas > 0
                        ? <>Has respondido <strong>{respondidas} pregunta{respondidas !== 1 ? "s" : ""}</strong>. Si abandonas ahora, perderás tu progreso y tendrás que empezar de nuevo.</>
                        : <>Si abandonas ahora, perderás tu progreso y tendrás que empezar de nuevo.</>
                    }
                </p>

                <div className="modal-actions-ea">
                    <button className="modal-btn-ea modal-btn-cancelar-ea" onClick={onContinuar}>
                        Continuar el test
                    </button>
                    <button className="modal-btn-ea modal-btn-abandonar-ea" onClick={onAbandonar}>
                        Sí, abandonar
                    </button>
                </div>
            </div>
        </div>
    );
}