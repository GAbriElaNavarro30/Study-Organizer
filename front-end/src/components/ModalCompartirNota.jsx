import { useState, useEffect } from "react";
import "../styles/modalCompartir.css";
import { Mail, Send, Share2, Info } from "lucide-react";

export function ModalCompartirNota({
    isOpen,
    onClose,
    onConfirm,
    nombreNota,
    contenidoTexto,
}) {
    const [modo, setModo] = useState(null);
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [chatId, setChatId] = useState("");
    const [chatIdError, setChatIdError] = useState("");
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setModo(null);
            setEmail("");
            setEmailError("");
            setChatId("");
            setChatIdError("");
            setEnviando(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const validarEmail = (valor) => {
        if (!valor.trim()) return "El correo electrónico es obligatorio";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) return "El correo electrónico no es válido";
        return "";
    };

    const validarChatId = (valor) => {
        if (!valor.trim()) return "El Chat ID es obligatorio";
        if (!/^-?\d+$/.test(valor.trim())) return "El Chat ID solo debe contener números";
        return "";
    };

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

    const enviarTelegram = async () => {
        const error = validarChatId(chatId);
        if (error) { setChatIdError(error); return; }
        setEnviando(true);
        try {
            await onConfirm({ tipo: "telegram", chatId: chatId.trim() });
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

                <p className="modal-descripcion-compartir-nota">
                    ¿Cómo deseas compartir la nota <strong>{nombreNota}</strong>?
                </p>

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
                        onClick={() => { setModo("correo"); setChatIdError(""); setEmailError(""); }}
                    >
                        <Mail size={20} />
                        <span>Correo electrónico</span>
                    </button>

                    <button
                        className={`opcion-compartir telegram ${modo === "telegram" ? "activa" : ""}`}
                        onClick={() => { setModo("telegram"); setEmailError(""); setChatIdError(""); }}
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
                            onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                            onKeyDown={(e) => e.key === "Enter" && enviarCorreo()}
                            disabled={enviando}
                        />
                        {emailError && (
                            <span style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px" }}>
                                {emailError}
                            </span>
                        )}
                    </div>
                )}

                {/* CAMPO TELEGRAM */}
                {modo === "telegram" && (
                    <div className="campo-compartir-nota">
                        <label>Chat ID del destinatario</label>
                        <input
                            type="text"
                            placeholder="Ej: 123456789"
                            value={chatId}
                            onChange={(e) => { setChatId(e.target.value); setChatIdError(""); }}
                            onKeyDown={(e) => e.key === "Enter" && enviarTelegram()}
                            disabled={enviando}
                        />
                        {chatIdError && (
                            <span style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px" }}>
                                {chatIdError}
                            </span>
                        )}
                        {/* Instrucciones para obtener el Chat ID */}
                        <div style={{
                            marginTop: "10px",
                            padding: "10px 12px",
                            background: "#f0f9ff",
                            borderRadius: "8px",
                            border: "1px solid #bae6fd",
                            fontSize: "12px",
                            color: "#0369a1",
                            lineHeight: "1.6"
                        }}>
                            <strong>¿Cómo obtener tu Chat ID?</strong><br />
                            1. Busca <strong>@StudyOrganizerBot</strong> en Telegram<br />
                            2. Presiona <strong>Iniciar / Start</strong><br />
                            3. Escribe <strong>/id</strong> y el bot te responderá con tu Chat ID
                        </div>
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

                    {modo === "telegram" && (
                        <button
                            className="btn btn-confirmar-compartir-nota"
                            onClick={enviarTelegram}
                            disabled={enviando}
                        >
                            {enviando ? "Enviando..." : "Enviar por Telegram"}
                        </button>
                    )}

                    <button className="btn btn-cancelar-compartir-nota" onClick={onClose}>
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}