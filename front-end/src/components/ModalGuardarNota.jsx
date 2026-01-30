import { useState } from "react";
import "../styles/modal-guardar.css";

export function ModalGuardarNota({
    isOpen,
    modo, // "editar" | "crear"
    onCancel,
    onConfirm
}) {
    const [titulo, setTitulo] = useState("");

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (modo === "crear" && titulo.trim() === "") return;
        onConfirm(titulo);
    };

    return (
        <div className="modal-overlay-guardar-nota">
            <div className="modal-guardar-guardar-nota">
                <h3>
                    {modo === "editar"
                        ? "¿Guardar cambios?"
                        : "Guardar nueva nota"}
                </h3>

                <hr className="modal-divider-guardar-nota" />

                {modo === "editar" ? (
                    <p>
                        ¿Estás seguro de guardar los cambios realizados en esta nota?
                    </p>
                ) : (
                    <>
                        <p>Escribe un nombre para tu nota:</p>
                        <input
                            className="input-titulo-nota-guardar-nota"
                            placeholder="Ej. Ideas del proyecto"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                        />
                    </>
                )}

                <div className="modal-acciones-guardar-nota">
                    <button
                        className="btn-confirmar-guardar-nota"
                        onClick={handleConfirm}
                    >
                        Guardar
                    </button>

                    <button
                        className="btn-cancelar-guardar-nota"
                        onClick={onCancel}
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}
