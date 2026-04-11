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
import "../styles/ModalConfirmarEliminar.css";

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

    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [isOpen, onClose]);

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
                            background: cfg.color,
                            boxShadow:  `0 2px 10px -2px ${cfg.color}55`,
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