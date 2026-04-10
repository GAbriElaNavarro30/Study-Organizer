import { IoTrophyOutline, IoCloseOutline, IoCheckmarkCircleOutline } from "react-icons/io5";
import "../styles/modalCursoCompletado.css";

export function ModalCursoCompletado({ titulo, onCerrar }) {
    return (
        <div className="mcc-overlay" onClick={onCerrar}>
            <div className="mcc-card" onClick={e => e.stopPropagation()}>
                <button className="mcc-close" onClick={onCerrar}>
                    <IoCloseOutline size={20} />
                </button>

                <div className="mcc-icon-wrap">
                    <IoTrophyOutline size={38} className="mcc-trophy" />
                </div>

                <h2 className="mcc-titulo">¡Felicidades!</h2>
                <p className="mcc-sub">
                    Completaste el curso <strong>{titulo}</strong>.<br />
                    Ya puedes ver tus resultados.
                </p>

                <button className="mcc-btn mcc-btn--primary" onClick={onCerrar}>
                    <IoCheckmarkCircleOutline size={15} /> Aceptar
                </button>
            </div>
        </div>
    );
}