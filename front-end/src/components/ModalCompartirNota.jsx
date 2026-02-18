import { useState, useEffect } from "react";
import "../styles/modalCompartir.css";
import { Mail, Send, Share2, Info, MessageCircle, Clock } from "lucide-react";

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
    const [telefono, setTelefono] = useState("");
    const [telefonoError, setTelefonoError] = useState("");
    const [enviando, setEnviando] = useState(false);

    // ← NUEVO: lista de destinatarios previos
    const [destinatariosPrevios, setDestinatariosPrevios] = useState([]);
    const [cargandoDestinatarios, setCargandoDestinatarios] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setModo(null);
            setEmail("");
            setEmailError("");
            setChatId("");
            setChatIdError("");
            setTelefono("");
            setTelefonoError("");
            setEnviando(false);
            setDestinatariosPrevios([]);
        }
    }, [isOpen]);

    // ← NUEVO: cargar destinatarios cuando se selecciona Telegram
    useEffect(() => {
        if (modo === "telegram") {
            cargarDestinatarios();
        }
    }, [modo]);

    const cargarDestinatarios = async () => {
        setCargandoDestinatarios(true);
        try {
            const res = await fetch(
                "http://localhost:3000/notas/telegram-destinatarios",
                { credentials: "include" }
            );
            if (res.ok) {
                const data = await res.json();
                setDestinatariosPrevios(data);
            }
        } catch (error) {
            console.error("Error al cargar destinatarios:", error);
        } finally {
            setCargandoDestinatarios(false);
        }
    };

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

    const validarTelefono = (valor) => {
        if (!valor.trim()) return "El número de teléfono es obligatorio";
        if (!/^\+\d{10,15}$/.test(valor.trim()))
            return "Incluye el código de país. Ej: +521234567890";
        return "";
    };

    const enviarCorreo = async () => {
        const error = validarEmail(email);
        if (error) { setEmailError(error); return; }
        setEnviando(true);
        try { await onConfirm({ tipo: "email", email: email.trim() }); }
        finally { setEnviando(false); }
    };

    const enviarTelegram = async () => {
        const error = validarChatId(chatId);
        if (error) { setChatIdError(error); return; }
        setEnviando(true);
        try { await onConfirm({ tipo: "telegram", chatId: chatId.trim() }); }
        finally { setEnviando(false); }
    };

    const enviarWhatsApp = async () => {
        const error = validarTelefono(telefono);
        if (error) { setTelefonoError(error); return; }
        setEnviando(true);
        try { await onConfirm({ tipo: "whatsapp", telefono: telefono.trim() }); }
        finally { setEnviando(false); }
    };

    const cambiarModo = (nuevoModo) => {
        setModo(nuevoModo);
        setEmailError("");
        setChatIdError("");
        setTelefonoError("");
    };

    // ← NUEVO: seleccionar destinatario de la lista
    const seleccionarDestinatario = (dest) => {
        setChatId(dest.chat_id.toString());
        setChatIdError("");
    };

    return (
        <div className="modal-overlay-compartir-nota">
            <div className="modal-contenedor-compartir-nota">

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
                    <span>La nota se enviará automáticamente en formato <strong>.PDF</strong></span>
                </div>

                {/* OPCIONES */}
                <div className="opciones-compartir-nota">
                    <button
                        className={`opcion-compartir ${modo === "correo" ? "activa" : ""}`}
                        onClick={() => cambiarModo("correo")}
                    >
                        <Mail size={20} />
                        <span>Correo</span>
                    </button>

                    <button
                        className={`opcion-compartir telegram ${modo === "telegram" ? "activa" : ""}`}
                        onClick={() => cambiarModo("telegram")}
                    >
                        <Send size={20} />
                        <span>Telegram</span>
                    </button>

                    <button
                        className={`opcion-compartir whatsapp ${modo === "whatsapp" ? "activa" : ""}`}
                        onClick={() => cambiarModo("whatsapp")}
                    >
                        <MessageCircle size={20} />
                        <span>WhatsApp</span>
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

                        {/* ← NUEVO: Lista de destinatarios previos */}
                        {cargandoDestinatarios && (
                            <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "8px" }}>
                                Cargando destinatarios...
                            </p>
                        )}

                        {!cargandoDestinatarios && destinatariosPrevios.length > 0 && (
                            <div style={{ marginTop: "10px" }}>
                                <p style={{
                                    fontSize: "12px", fontWeight: "bold",
                                    color: "#374151", marginBottom: "6px",
                                    display: "flex", alignItems: "center", gap: "4px"
                                }}>
                                    <Clock size={12} />
                                    Destinatarios recientes:
                                </p>
                                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                    {destinatariosPrevios.map((dest) => (
                                        <button
                                            key={dest.id}
                                            onClick={() => seleccionarDestinatario(dest)}
                                            disabled={enviando}
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                padding: "8px 12px",
                                                background: chatId === dest.chat_id.toString() ? "#eff6ff" : "#f9fafb",
                                                border: chatId === dest.chat_id.toString() ? "1px solid #93c5fd" : "1px solid #e5e7eb",
                                                borderRadius: "6px",
                                                cursor: "pointer",
                                                textAlign: "left",
                                                fontSize: "13px",
                                                color: "#374151",
                                                transition: "all 0.15s"
                                            }}
                                        >
                                            <span>
                                                <Send size={12} style={{ marginRight: "6px", color: "#0088cc" }} />
                                                {dest.nombre}
                                            </span>
                                            <span style={{ fontSize: "11px", color: "#9ca3af" }}>
                                                {dest.chat_id}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={{
                            marginTop: "10px", padding: "10px 12px",
                            background: "#f0f9ff", borderRadius: "8px",
                            border: "1px solid #bae6fd", fontSize: "12px",
                            color: "#0369a1", lineHeight: "1.6"
                        }}>
                            <strong>¿Cómo obtener el Chat ID?</strong><br />
                            1. Busca <strong>@study_organizer_so_bot</strong> en Telegram<br />
                            2. Presiona <strong>Iniciar / Start</strong><br />
                            3. El bot responderá con el Chat ID automáticamente
                        </div>
                    </div>
                )}

                {/* CAMPO WHATSAPP */}
                {modo === "whatsapp" && (
                    <div className="campo-compartir-nota">
                        <label>Número de WhatsApp del destinatario</label>
                        <input
                            type="tel"
                            placeholder="+521234567890"
                            value={telefono}
                            onChange={(e) => { setTelefono(e.target.value); setTelefonoError(""); }}
                            onKeyDown={(e) => e.key === "Enter" && enviarWhatsApp()}
                            disabled={enviando}
                        />
                        {telefonoError && (
                            <span style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px" }}>
                                {telefonoError}
                            </span>
                        )}
                        <div style={{
                            marginTop: "10px", padding: "10px 12px",
                            background: "#f0fff4", borderRadius: "8px",
                            border: "1px solid #86efac", fontSize: "12px",
                            color: "#15803d", lineHeight: "1.6"
                        }}>
                            <strong>Formato requerido:</strong> incluye el código de país<br />
                            🇲🇽 México: <strong>+52</strong>1234567890<br />
                            🇺🇸 EE.UU: <strong>+1</strong>2345678900
                        </div>
                    </div>
                )}

                {/* BOTONES */}
                <div className="modal-botones-compartir-nota">
                    {modo === "correo" && (
                        <button className="btn btn-confirmar-compartir-nota" onClick={enviarCorreo} disabled={enviando}>
                            {enviando ? "Enviando..." : "Enviar correo"}
                        </button>
                    )}
                    {modo === "telegram" && (
                        <button className="btn btn-confirmar-compartir-nota" onClick={enviarTelegram} disabled={enviando}>
                            {enviando ? "Enviando..." : "Enviar por Telegram"}
                        </button>
                    )}
                    {modo === "whatsapp" && (
                        <button className="btn btn-confirmar-compartir-nota" onClick={enviarWhatsApp} disabled={enviando}>
                            {enviando ? "Enviando..." : "Enviar por WhatsApp"}
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