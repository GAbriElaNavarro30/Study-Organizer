import { IoCheckmarkCircle, IoEyeOff } from "react-icons/io5";
import "../styles/ModalPublicar.css";

/**
 * ModalPublicar
 *
 * Props:
 *  - isOpen      {boolean}   — controla visibilidad
 *  - curso       {object}    — objeto del curso ({ titulo, es_publicado })
 *  - onConfirm   {function}  — acción al confirmar
 *  - onClose     {function}  — acción al cancelar / cerrar
 */
export function ModalPublicar({ isOpen, curso, onConfirm, onClose }) {
    if (!isOpen || !curso) return null;

    const esPublicar = !curso.es_publicado;

    return (
        <div
            className="modal-publicar__overlay"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="modal-publicar__box">

                <div className={`modal-publicar__icon ${esPublicar ? "modal-publicar__icon--publish" : "modal-publicar__icon--unpublish"}`}>
                    {esPublicar
                        ? <IoCheckmarkCircle size={24} />
                        : <IoEyeOff size={24} />
                    }
                </div>

                <h3 className="modal-publicar__title">
                    {esPublicar ? "Publicar curso" : "Despublicar curso"}
                </h3>

                <p className="modal-publicar__msg">
                    {esPublicar
                        ? <><strong>"{curso.titulo}"</strong> estará disponible para todos los estudiantes inscritos.</>
                        : <><strong>"{curso.titulo}"</strong> dejará de ser visible para los estudiantes.</>
                    }
                </p>

                <div className="modal-publicar__footer">
                    <button className="modal-publicar__btn-cancel" onClick={onClose}>
                        Cancelar
                    </button>
                    <button
                        className={`modal-publicar__btn-confirm ${!esPublicar ? "modal-publicar__btn-confirm--danger" : ""}`}
                        onClick={onConfirm}
                    >
                        {esPublicar ? "Publicar" : "Despublicar"}
                    </button>
                </div>

            </div>
        </div>
    );
}