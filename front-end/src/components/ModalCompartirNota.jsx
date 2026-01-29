import { useState, useEffect } from "react";
import "../styles/modalCompartir.css";
import { Mail, Send, Share2, Info } from "lucide-react";

export function ModalCompartirNota({
    isOpen,
    onClose,
    onConfirm,
    nombreNota,
}) {
    const [modo, setModo] = useState(null); // "correo" | null
    const [email, setEmail] = useState("");

    /* ============================
       RESET AL CERRAR EL MODAL
    ============================ */
    useEffect(() => {
        if (!isOpen) {
            setModo(null);
            setEmail("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    /* ============================
       TELEGRAM
    ============================ */
    const compartirPorTelegram = () => {
        const mensaje = `Te comparto la nota: "${nombreNota}"`;
        const url = `https://t.me/share/url?text=${encodeURIComponent(mensaje)}`;
        window.open(url, "_blank");
    };

    /* ============================
       CORREO
    ============================ */
    const enviarCorreo = () => {
        if (!email) return;
        onConfirm(email);
    };

    return (
        <div className="modal-overlay-compartir-nota">
            <div className="modal-contenedor-compartir-nota">
                {/* HEADER */}
                <div className="modal-header-compartir-nota">
                    <Share2 size={20} />
                    <h2>Compartir nota</h2>
                </div>

                <hr className="modal-divider-compartir" />

                {/* DESCRIPCIÓN */}
                <p className="modal-descripcion-compartir-nota">
                    ¿Cómo deseas compartir la nota{" "}
                    <strong>{nombreNota}</strong>?
                </p>

                {/* ALERTA INFO */}
                <div className="alerta-info-compartir-nota">
                    <Info size={18} />
                    <span>
                        La nota se enviará automáticamente en formato <strong>.PDF</strong>
                    </span>
                </div>

                {/* OPCIONES */}
                <div className="opciones-compartir-nota">
                    <button
                        className={`opcion-compartir ${modo === "correo" ? "activa" : ""
                            }`}
                        onClick={() => setModo("correo")}
                    >
                        <Mail size={20} />
                        <span>Correo electrónico</span>
                    </button>

                    <button
                        className="opcion-compartir telegram"
                        onClick={compartirPorTelegram}
                    >
                        <Send size={20} />
                        <span>Telegram</span>
                    </button>
                </div>

                {/* CAMPO CORREO */}
                {modo === "correo" && (
                    <div className="campo-compartir-nota">
                        <label>Correo del destinatario</label>
                        <input
                            type="email"
                            placeholder="ejemplo@correo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                )}

                {/* BOTONES */}
                <div className="modal-botones-compartir-nota">
                    {modo === "correo" && (
                        <button
                            className="btn btn-confirmar-compartir-nota"
                            onClick={enviarCorreo}
                            disabled={!email}
                        >
                            Enviar correo
                        </button>
                    )}

                    <button
                        className="btn btn-cancelar-compartir-nota"
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}
