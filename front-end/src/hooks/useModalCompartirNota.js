import { useState, useEffect } from "react";

export function useModalCompartirNota(isOpen) {

    const [modo, setModo] = useState(null);

    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");

    const [chatId, setChatId] = useState("");
    const [chatIdError, setChatIdError] = useState("");

    const [telefono, setTelefono] = useState("");
    const [telefonoError, setTelefonoError] = useState("");

    const [enviando, setEnviando] = useState(false);

    const [destinatariosPrevios, setDestinatariosPrevios] = useState([]);
    const [cargandoDestinatarios, setCargandoDestinatarios] = useState(false);

    const [editandoId, setEditandoId] = useState(null);
    const [editandoNombre, setEditandoNombre] = useState("");
    const [editandoNombreError, setEditandoNombreError] = useState("");
    const [guardandoNombre, setGuardandoNombre] = useState(false);

    /* ── Reset al cerrar ── */
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
            setEditandoId(null);
            setEditandoNombre("");
            setEditandoNombreError("");
        }
    }, [isOpen]);

    /* ── Cargar destinatarios al entrar en modo telegram ── */
    useEffect(() => {
        if (modo === "telegram") cargarDestinatarios();
    }, [modo]);

    /* ────────────────────────────────────────────
       VALIDACIONES
    ──────────────────────────────────────────── */
    const validarEmail = (v) => {
        if (!v.trim()) return "El correo electrónico es obligatorio";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "El correo electrónico no es válido";
        return "";
    };

    const validarChatId = (v) => {
        if (!v.trim()) return "El Chat ID es obligatorio";
        if (!/^-?\d+$/.test(v.trim())) return "El Chat ID solo debe contener números";
        return "";
    };

    const validarTelefono = (v) => {
        if (!v.trim()) return "El número de teléfono es obligatorio";
        if (!/^\+\d{10,15}$/.test(v.trim())) return "Incluye el código de país. Ej: +521234567890";
        return "";
    };

    const validarNombreDestinatario = (v) => {
        if (!v.trim()) return "El nombre no puede estar vacío";
        if (v.trim().length > 100) return "Máximo 100 caracteres";
        return "";
    };

    /* ────────────────────────────────────────────
       FETCH
    ──────────────────────────────────────────── */
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

    /* ────────────────────────────────────────────
       ENVÍOS
    ──────────────────────────────────────────── */
    const enviarCorreo = async (onConfirm) => {
        const err = validarEmail(email);
        if (err) { setEmailError(err); return; }
        setEnviando(true);
        try { await onConfirm({ tipo: "email", email: email.trim() }); }
        finally { setEnviando(false); }
    };

    const enviarTelegram = async (onConfirm) => {
        const err = validarChatId(chatId);
        if (err) { setChatIdError(err); return; }
        setEnviando(true);
        try { await onConfirm({ tipo: "telegram", chatId: chatId.trim() }); }
        finally { setEnviando(false); }
    };

    const enviarWhatsApp = async (onConfirm) => {
        const err = validarTelefono(telefono);
        if (err) { setTelefonoError(err); return; }
        setEnviando(true);
        try { await onConfirm({ tipo: "whatsapp", telefono: telefono.trim() }); }
        finally { setEnviando(false); }
    };

    /* ────────────────────────────────────────────
       CANAL
    ──────────────────────────────────────────── */
    const cambiarModo = (nuevoModo) => {
        setModo(nuevoModo);
        setEmailError("");
        setChatIdError("");
        setTelefonoError("");
    };

    /* ────────────────────────────────────────────
       DESTINATARIOS
    ──────────────────────────────────────────── */
    const seleccionarDestinatario = (dest) => {
        setChatId(dest.chat_id.toString());
        setChatIdError("");
    };

    const iniciarEdicion = (dest) => {
        setEditandoId(dest.id);
        setEditandoNombre(dest.nombre);
        setEditandoNombreError("");
    };

    const cancelarEdicion = () => {
        setEditandoId(null);
        setEditandoNombre("");
        setEditandoNombreError("");
    };

    const handleChangeNombreEdicion = (valor) => {
        setEditandoNombre(valor);
        setEditandoNombreError("");
    };

    const guardarNombreDestinatario = async (dest) => {
        const err = validarNombreDestinatario(editandoNombre);
        if (err) { setEditandoNombreError(err); return; }

        setGuardandoNombre(true);
        try {
            const res = await fetch(
                `http://localhost:3000/notas/telegram-destinatario/${dest.id}`,
                {
                    method: "PATCH",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nombre: editandoNombre.trim() }),
                }
            );
            if (res.ok) {
                setDestinatariosPrevios(prev =>
                    prev.map(d => d.id === dest.id ? { ...d, nombre: editandoNombre.trim() } : d)
                );
                cancelarEdicion();
            } else {
                const data = await res.json();
                setEditandoNombreError(data.error || "Error al guardar");
            }
        } catch (error) {
            console.error("Error al renombrar destinatario:", error);
            setEditandoNombreError("Error de conexión, intenta de nuevo");
        } finally {
            setGuardandoNombre(false);
        }
    };

    return {
        modo, cambiarModo,
        email, setEmail, emailError, setEmailError, enviarCorreo,
        chatId, setChatId, chatIdError, setChatIdError, enviarTelegram,
        telefono, setTelefono, telefonoError, setTelefonoError, enviarWhatsApp,
        enviando,
        destinatariosPrevios, cargandoDestinatarios, seleccionarDestinatario,
        editandoId, editandoNombre, editandoNombreError, guardandoNombre,
        iniciarEdicion, cancelarEdicion, handleChangeNombreEdicion, guardarNombreDestinatario,
    };
}