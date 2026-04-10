import { IoArrowBackOutline, IoCloseOutline } from "react-icons/io5";
import "../styles/ModalConfirmarSalirCurso.css";

export function ModalConfirmarSalirCurso({ onConfirmar, onCancelar }) {
    return (
        <div className="csc-overlay" onClick={onCancelar}>
            <div className="csc-modal" onClick={e => e.stopPropagation()}>
                <button className="csc-close" onClick={onCancelar}>
                    <IoCloseOutline size={18} />
                </button>

                <div className="csc-icon">
                    <IoArrowBackOutline size={22} />
                </div>

                <h2 className="csc-titulo">¿Salir del curso?</h2>
                <p className="csc-desc">
                    Tu progreso está guardado. Puedes retomar el curso en cualquier momento desde donde lo dejaste.
                </p>

                <div className="csc-btns">
                    <button className="csc-btn csc-btn--cancelar" onClick={onCancelar}>
                        Seguir aprendiendo
                    </button>
                    <button className="csc-btn csc-btn--confirmar" onClick={onConfirmar}>
                        Sí, salir
                    </button>
                </div>
            </div>
        </div>
    );
}