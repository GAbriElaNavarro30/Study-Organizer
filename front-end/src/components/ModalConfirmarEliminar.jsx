import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
    IoTrashOutline,
    IoCloseOutline,
    IoAlertCircleOutline,
    IoLayersOutline,
    IoDocumentTextOutline,
    IoHelpCircleOutline,
    IoImageOutline,
} from "react-icons/io5";

/* ─────────────────────────────────────────────────────────
   TIPOS
───────────────────────────────────────────────────────── */
const TIPOS = {
    seccion: {
        label: "Sección",
        icon: IoLayersOutline,
        color: "#DC2626",
        bg: "#FEF2F2",
        border: "#FECACA",
        iconBg: "#FEE2E2",
        warning: "Se eliminarán todos los bloques de contenido y el cuestionario de esta sección.",
    },
    bloque: {
        label: "Bloque de contenido",
        icon: IoDocumentTextOutline,
        color: "#D97706",
        bg: "#FFFBEB",
        border: "#FDE68A",
        iconBg: "#FEF3C7",
        warning: "Se perderá el texto y la imagen de este bloque.",
    },
    imagen: {
        label: "Imagen",
        icon: IoImageOutline,
        color: "#7C3AED",
        bg: "#F5F3FF",
        border: "#DDD6FE",
        iconBg: "#EDE9FE",
        warning: "La imagen se eliminará del bloque de contenido.",
    },
    cuestionario: {
        label: "Cuestionario",
        icon: IoHelpCircleOutline,
        color: "#0891B2",
        bg: "#ECFEFF",
        border: "#A5F3FC",
        iconBg: "#CFFAFE",
        warning: "Se eliminarán todas las preguntas y opciones de respuesta de esta sección.",
    },
    pregunta: {
        label: "Pregunta",
        icon: IoHelpCircleOutline,
        color: "#EA580C",
        bg: "#FFF7ED",
        border: "#FED7AA",
        iconBg: "#FFEDD5",
        warning: "Se eliminará la pregunta y todas sus opciones de respuesta.",
    },
    generico: {
        label: "Elemento",
        icon: IoAlertCircleOutline,
        color: "#DC2626",
        bg: "#FEF2F2",
        border: "#FECACA",
        iconBg: "#FEE2E2",
        warning: "Esta acción no se puede deshacer.",
    },
};

/* ─────────────────────────────────────────────────────────
   CSS — inyectado una sola vez en <head>
───────────────────────────────────────────────────────── */
const CSS = `
.mce-overlay {
    position: fixed;
    inset: 0;
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(15, 23, 42, 0.55);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    padding: 16px;
    animation: mce-fadeIn 0.18s ease;
}
@keyframes mce-fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
}
.mce-card {
    background: #FFFFFF;
    border-radius: 16px;
    box-shadow:
        0 4px 6px -1px rgba(0,0,0,0.07),
        0 20px 50px -10px rgba(0,0,0,0.22);
    width: 100%;
    max-width: 420px;
    overflow: hidden;
    animation: mce-slideUp 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes mce-slideUp {
    from { opacity: 0; transform: translateY(20px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)    scale(1);    }
}
.mce-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 18px 14px;
    border-bottom: 1px solid;
}
.mce-header-left {
    display: flex;
    align-items: center;
    gap: 10px;
}
.mce-icon-wrap {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}
.mce-header-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
}
.mce-tipo-label {
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    opacity: 0.75;
}
.mce-header-title {
    font-size: 15px;
    font-weight: 700;
    color: #0F172A;
    line-height: 1.2;
}
.mce-close-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #94A3B8;
    padding: 5px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    transition: color 0.15s, background 0.15s;
    flex-shrink: 0;
}
.mce-close-btn:hover {
    color: #475569;
    background: #F1F5F9;
}
.mce-body {
    padding: 18px 18px 14px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.mce-nombre-chip {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border-radius: 10px;
    border: 1px solid;
    font-size: 13px;
    font-weight: 600;
    color: #1E293B;
    word-break: break-word;
    line-height: 1.4;
}
.mce-nombre-chip-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
}
.mce-warning-row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    background: #FEF2F2;
    border: 1px solid #FECACA;
    border-radius: 8px;
    padding: 10px 12px;
}
.mce-warning-text {
    font-size: 12px;
    color: #7F1D1D;
    line-height: 1.55;
    margin: 0;
}
.mce-footer {
    display: flex;
    gap: 10px;
    padding: 0 18px 18px;
}
.mce-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px 16px;
    border-radius: 10px;
    font-size: 13.5px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: opacity 0.15s, transform 0.12s;
    white-space: nowrap;
}
.mce-btn:active { transform: scale(0.97); }
.mce-btn--cancel {
    background: #F1F5F9;
    color: #475569;
    border: 1px solid #E2E8F0;
}
.mce-btn--cancel:hover { background: #E2E8F0; }
.mce-btn--confirm { color: #FFFFFF; }
.mce-btn--confirm:hover { opacity: 0.88; }
`;

let cssInjected = false;
const injectCSS = () => {
    if (cssInjected || document.querySelector("style[data-mce]")) return;
    const style = document.createElement("style");
    style.setAttribute("data-mce", "1");
    style.textContent = CSS;
    document.head.appendChild(style);
    cssInjected = true;
};

/* ─────────────────────────────────────────────────────────
   COMPONENTE
───────────────────────────────────────────────────────── */
export function ModalConfirmarEliminar({
    isOpen,
    onClose,
    onConfirm,
    tipo = "generico",
    nombre = "",
}) {
    const cfg        = TIPOS[tipo] ?? TIPOS.generico;
    const Icon       = cfg.icon;
    const overlayRef = useRef(null);

    useEffect(() => { injectCSS(); }, []);

    // Cerrar con Escape
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [isOpen, onClose]);

    // Bloquear scroll del body mientras está abierto
    useEffect(() => {
        if (isOpen) document.body.style.overflow = "hidden";
        else        document.body.style.overflow = "";
        return ()  => { document.body.style.overflow = ""; };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === overlayRef.current) onClose();
    };

    const handleConfirm = () => {
        onConfirm?.();
        onClose();
    };

    /*
     * createPortal monta el modal directamente en document.body,
     * fuera de cualquier contenedor con transform / overflow / z-index
     * que pudiera recortar o desplazar el overlay.
     */
    return createPortal(
        <div
            className="mce-overlay"
            ref={overlayRef}
            onClick={handleOverlayClick}
        >
            <div
                className="mce-card"
                role="dialog"
                aria-modal="true"
                aria-labelledby="mce-title"
            >
                {/* Header */}
                <div
                    className="mce-header"
                    style={{ background: cfg.bg, borderColor: cfg.border }}
                >
                    <div className="mce-header-left">
                        <div className="mce-icon-wrap" style={{ background: cfg.iconBg }}>
                            <Icon size={18} style={{ color: cfg.color }} />
                        </div>
                        <div className="mce-header-text">
                            <span className="mce-tipo-label" style={{ color: cfg.color }}>
                                Eliminar {cfg.label}
                            </span>
                            <span className="mce-header-title" id="mce-title">
                                ¿Confirmas la eliminación?
                            </span>
                        </div>
                    </div>
                    <button className="mce-close-btn" onClick={onClose} aria-label="Cerrar">
                        <IoCloseOutline size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="mce-body">
                    {nombre && (
                        <div
                            className="mce-nombre-chip"
                            style={{ background: cfg.bg, borderColor: cfg.border }}
                        >
                            <div
                                className="mce-nombre-chip-dot"
                                style={{ background: cfg.color }}
                            />
                            {nombre}
                        </div>
                    )}
                    <div className="mce-warning-row">
                        <IoAlertCircleOutline
                            size={15}
                            style={{ color: "#DC2626", flexShrink: 0, marginTop: 1 }}
                        />
                        <p className="mce-warning-text">{cfg.warning}</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mce-footer">
                    <button className="mce-btn mce-btn--cancel" onClick={onClose}>
                        Cancelar
                    </button>
                    <button
                        className="mce-btn mce-btn--confirm"
                        style={{
                            background:  cfg.color,
                            boxShadow:   `0 2px 10px -2px ${cfg.color}55`,
                        }}
                        onClick={handleConfirm}
                    >
                        <IoTrashOutline size={14} />
                        Eliminar
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}