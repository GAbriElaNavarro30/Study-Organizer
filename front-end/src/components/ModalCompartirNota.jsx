import { useState, useEffect } from "react";
import "../styles/modalCompartir.css";
import { Mail, Send, Share2, Info } from "lucide-react";

export function ModalCompartirNota({
    isOpen,
    onClose,
    onConfirm,
    nombreNota,
    contenidoTexto, // ← nuevo prop
}) {
    const [modo, setModo] = useState(null);
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setModo(null);
            setEmail("");
            setEmailError("");
            setEnviando(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    /* ============================
       VALIDAR EMAIL
    ============================ */
    const validarEmail = (valor) => {
        if (!valor.trim()) return "El correo es obligatorio";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) return "El correo no es válido";
        return "";
    };

    /* ============================
       TELEGRAM
    ============================ */
    const compartirPorTelegram = () => {
        const texto = `📝 *${nombreNota}*\n\n${contenidoTexto || ""}`;
        const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(texto)}`;
        window.open(url, "_blank");
        onClose();
    };

    /* ============================
       CORREO
    ============================ */
    const enviarCorreo = async () => {
        const error = validarEmail(email);
        if (error) { setEmailError(error); return; }

        setEnviando(true);
        try {
            await onConfirm({ tipo: "email", email: email.trim() });
        } finally {
            setEnviando(false);
        }
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
                        className={`opcion-compartir ${modo === "correo" ? "activa" : ""}`}
                        onClick={() => { setModo("correo"); setEmailError(""); }}
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
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setEmailError(""); // limpiar error al escribir
                            }}
                            onKeyDown={(e) => e.key === "Enter" && enviarCorreo()}
                            disabled={enviando}
                        />
                        {/* ← mensaje de error debajo del input */}
                        {emailError && (
                            <span style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px" }}>
                                {emailError}
                            </span>
                        )}
                    </div>
                )}

                {/* BOTONES */}
                <div className="modal-botones-compartir-nota">
                    {modo === "correo" && (
                        <button
                            className="btn btn-confirmar-compartir-nota"
                            onClick={enviarCorreo}
                            disabled={enviando}
                        >
                            {enviando ? "Enviando..." : "Enviar correo"}
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