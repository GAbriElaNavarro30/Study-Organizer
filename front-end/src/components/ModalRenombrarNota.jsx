import { useState, useEffect } from "react";
import "../styles/modalRenombrar.css";
import { Type } from "lucide-react";

export function ModalRenombrarNota({
    isOpen,
    onClose,
    onConfirm,
    nombreActual,
}) {
    const [nuevoNombre, setNuevoNombre] = useState("");

    /* ============================
       CARGA / RESET
    ============================ */
    useEffect(() => {
        if (isOpen) {
            setNuevoNombre(nombreActual || "");
        }
    }, [isOpen, nombreActual]);

    if (!isOpen) return null;

    const confirmarCambio = () => {
        if (!nuevoNombre.trim()) return;
        onConfirm(nuevoNombre.trim());
    };

    return (
        <div className="modal-overlay-renombrar">
            <div className="modal-contenedor-renombrar">

                {/* HEADER */}
                <div className="modal-header-renombrar">
                    <Type size={20} />
                    <h2>Cambiar título</h2>
                </div>

                <hr className="modal-divider" />

                {/* DESCRIPCIÓN */}
                <p className="modal-descripcion-renombrar">
                    Escribe el nuevo nombre para la nota.
                </p>

                {/* INPUT */}
                <div className="campo-renombrar">
                    <label>Nuevo título</label>
                    <input
                        type="text"
                        value={nuevoNombre}
                        onChange={(e) => setNuevoNombre(e.target.value)}
                        placeholder="Ej. Ideas del proyecto final"
                        autoFocus
                    />
                </div>

                {/* BOTONES */}
                <div className="modal-botones-renombrar">


                    <button
                        className="btn btn-confirmar-renombrar"
                        onClick={confirmarCambio}
                        disabled={!nuevoNombre.trim()}
                    >
                        Guardar cambios
                    </button>


                    <button
                        className="btn btn-cancelar-renombrar"
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}
