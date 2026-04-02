import { IoArchiveOutline } from "react-icons/io5";
import "../styles/ModalArchivar.css";

/**
 * ModalArchivar
 *
 * Props:
 *  - isOpen      {boolean}   — controla visibilidad
 *  - curso       {object}    — objeto del curso ({ titulo, archivado })
 *  - onConfirm   {function}  — acción al confirmar
 *  - onClose     {function}  — acción al cancelar / cerrar
 */
export function ModalArchivar({ isOpen, curso, onConfirm, onClose }) {
    if (!isOpen || !curso) return null;

    const esArchivar = !curso.archivado;

    return (
        <div
            className="modal-archivar__overlay"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="modal-archivar__box">

                <div className="modal-archivar__icon">
                    <IoArchiveOutline size={24} />
                </div>

                <h3 className="modal-archivar__title">
                    {esArchivar ? "Archivar curso" : "Desarchivar curso"}
                </h3>

                <p className="modal-archivar__msg">
                    {esArchivar
                        ? <>¿Deseas archivar <strong>"{curso.titulo}"</strong>? Se moverá a archivados y dejará de ser visible para los estudiantes.</>
                        : <>¿Deseas desarchivar <strong>"{curso.titulo}"</strong>? Volverá al panel principal de cursos.</>
                    }
                </p>

                <div className="modal-archivar__footer">
                    <button className="modal-archivar__btn-cancel" onClick={onClose}>
                        Cancelar
                    </button>
                    <button className="modal-archivar__btn-confirm" onClick={onConfirm}>
                        {esArchivar ? "Archivar" : "Desarchivar"}
                    </button>
                </div>

            </div>
        </div>
    );
}