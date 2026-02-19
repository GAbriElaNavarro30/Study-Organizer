import "../styles/modalCompartir.css";
import { Mail, Send, Share2, Info, MessageCircle, Clock, Pencil } from "lucide-react";
import { useModalCompartirNota } from "../hooks/useModalCompartirNota";

export function ModalCompartirNota({ isOpen, onClose, onConfirm, nombreNota }) {
    const {
        modo, cambiarModo,
        email, setEmail, emailError, setEmailError, enviarCorreo,
        chatId, setChatId, chatIdError, setChatIdError, enviarTelegram,
        telefono, setTelefono, telefonoError, setTelefonoError, enviarWhatsApp,
        enviando,
        destinatariosPrevios, cargandoDestinatarios, seleccionarDestinatario,
        editandoId, editandoNombre, editandoNombreError, guardandoNombre,
        iniciarEdicion, cancelarEdicion, handleChangeNombreEdicion, guardarNombreDestinatario,
    } = useModalCompartirNota(isOpen);

    if (!isOpen) return null;

    const renderBotonConfirmar = () => {
        if (!modo) return null;
        const acciones = {
            correo:   { label: "Enviar correo",       fn: () => enviarCorreo(onConfirm) },
            telegram: { label: "Enviar por Telegram",  fn: () => enviarTelegram(onConfirm) },
            whatsapp: { label: "Enviar por WhatsApp",  fn: () => enviarWhatsApp(onConfirm) },
        };
        const { label, fn } = acciones[modo];
        return (
            <button className="btn btn-confirmar-compartir-nota" onClick={fn} disabled={enviando}>
                {enviando ? "Enviando..." : label}
            </button>
        );
    };

    return (
        <div className="modal-overlay-compartir-nota">
            <div className="modal-contenedor-compartir-nota">

                <div className="modal-header-fijo">
                    <div className="modal-header-compartir-nota">
                        <Share2 size={20} />
                        <h2>Compartir nota</h2>
                    </div>
                    <p className="modal-descripcion-compartir-nota">
                        ¿Cómo deseas compartir la nota <strong>{nombreNota}</strong>?
                    </p>
                    <div className="alerta-info-compartir-nota">
                        <Info size={17} />
                        <span>La nota se enviará automáticamente en formato <strong>.PDF</strong></span>
                    </div>
                </div>

                <div className="modal-body-scroll">
                    <div className="opciones-compartir-nota">
                        <button
                            className={`opcion-compartir ${modo === "correo" ? "activa" : ""}`}
                            onClick={() => cambiarModo("correo")}
                        >
                            <Mail size={20} /><span>Correo</span>
                        </button>
                        <button
                            className={`opcion-compartir telegram ${modo === "telegram" ? "activa" : ""}`}
                            onClick={() => cambiarModo("telegram")}
                        >
                            <Send size={20} /><span>Telegram</span>
                        </button>
                        <button
                            className={`opcion-compartir whatsapp ${modo === "whatsapp" ? "activa" : ""}`}
                            onClick={() => cambiarModo("whatsapp")}
                        >
                            <MessageCircle size={20} /><span>WhatsApp</span>
                        </button>
                    </div>

                    {/* ── CORREO ── */}
                    {modo === "correo" && (
                        <div className="campo-compartir-nota">
                            <label>Correo del destinatario</label>
                            <input
                                type="email"
                                placeholder="ejemplo@correo.com"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                                onKeyDown={(e) => e.key === "Enter" && enviarCorreo(onConfirm)}
                                disabled={enviando}
                            />
                            {emailError && <span className="campo-error">{emailError}</span>}
                        </div>
                    )}

                    {/* ── TELEGRAM ── */}
                    {modo === "telegram" && (
                        <div className="campo-compartir-nota">
                            <label>Chat ID del destinatario</label>
                            <input
                                type="text"
                                placeholder="Ej: 123456789"
                                value={chatId}
                                onChange={(e) => { setChatId(e.target.value); setChatIdError(""); }}
                                onKeyDown={(e) => e.key === "Enter" && enviarTelegram(onConfirm)}
                                disabled={enviando}
                            />
                            {chatIdError && <span className="campo-error">{chatIdError}</span>}

                            {cargandoDestinatarios && (
                                <p className="texto-cargando">Cargando destinatarios...</p>
                            )}

                            {!cargandoDestinatarios && destinatariosPrevios.length > 0 && (
                                <div className="destinatarios-wrapper">
                                    <p className="label-destinatarios-recientes">
                                        <Clock size={12} />
                                        Destinatarios recientes:
                                    </p>
                                    <div className="lista-destinatarios-telegram">
                                        {destinatariosPrevios.map((dest) => (
                                            <div
                                                key={dest.id}
                                                className={`destinatario-item ${chatId === dest.chat_id.toString() ? "seleccionado" : ""}`}
                                            >
                                                <div className="destinatario-fila">
                                                    <button
                                                        className="destinatario-btn-seleccionar"
                                                        onClick={() => seleccionarDestinatario(dest)}
                                                        disabled={enviando}
                                                    >
                                                        <Send size={12} className="destinatario-icon" />
                                                        <span className="destinatario-nombre">{dest.nombre}</span>
                                                    </button>
                                                    <div className="destinatario-acciones">
                                                        <span className="destinatario-chatid">{dest.chat_id}</span>
                                                        <button
                                                            className="btn-editar-destinatario"
                                                            onClick={() => iniciarEdicion(dest)}
                                                            disabled={enviando}
                                                            title="Renombrar destinatario"
                                                        >
                                                            <Pencil size={13} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {editandoId === dest.id && (
                                                    <div className="edicion-nombre-wrapper">
                                                        <div className="edicion-nombre-fila">
                                                            <input
                                                                type="text"
                                                                value={editandoNombre}
                                                                onChange={(e) => handleChangeNombreEdicion(e.target.value)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === "Enter") guardarNombreDestinatario(dest);
                                                                    if (e.key === "Escape") cancelarEdicion();
                                                                }}
                                                                placeholder="Nombre del destinatario"
                                                                autoFocus
                                                                maxLength={101}
                                                                className={`edicion-nombre-input ${editandoNombreError ? "input-error" : ""}`}
                                                            />
                                                            <button
                                                                className="btn-guardar-nombre"
                                                                onClick={() => guardarNombreDestinatario(dest)}
                                                                disabled={guardandoNombre}
                                                            >
                                                                {guardandoNombre ? "..." : "Guardar"}
                                                            </button>
                                                            <button
                                                                className="btn-cancelar-nombre"
                                                                onClick={cancelarEdicion}
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                        {editandoNombreError && (
                                                            <span className="campo-error campo-error--sm">
                                                                {editandoNombreError}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="info-chatid">
                                <strong>¿Cómo obtener el Chat ID?</strong><br />
                                1. Busca <strong>@study_organizer_so_bot</strong> en Telegram<br />
                                2. Presiona <strong>Iniciar / Start</strong><br />
                                3. El bot responderá con el Chat ID automáticamente
                            </div>
                        </div>
                    )}

                    {/* ── WHATSAPP ── */}
                    {modo === "whatsapp" && (
                        <div className="campo-compartir-nota">
                            <label>Número de WhatsApp del destinatario</label>
                            <input
                                type="tel"
                                placeholder="+521234567890"
                                value={telefono}
                                onChange={(e) => { setTelefono(e.target.value); setTelefonoError(""); }}
                                onKeyDown={(e) => e.key === "Enter" && enviarWhatsApp(onConfirm)}
                                disabled={enviando}
                            />
                            {telefonoError && <span className="campo-error">{telefonoError}</span>}
                            <div className="info-whatsapp">
                                <strong>Formato requerido:</strong> incluye el código de país<br />
                                🇲🇽 México: <strong>+52</strong>1234567890<br />
                                🇺🇸 EE.UU: <strong>+1</strong>2345678900
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer-fijo">
                    {renderBotonConfirmar()}
                    <button className="btn btn-cancelar-compartir-nota" onClick={onClose}>
                        Cancelar
                    </button>
                </div>

            </div>
        </div>
    );
}