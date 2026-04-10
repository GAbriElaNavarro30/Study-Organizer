// src/hooks/useModalCancelarInscripcion.js
import { useEffect, useRef } from "react";

export function useModalCancelarInscripcion({ abierto, onCerrar }) {
    const dialogRef = useRef(null);

    /* Cierra con Escape */
    useEffect(() => {
        if (!abierto) return;
        const handler = (e) => { if (e.key === "Escape") onCerrar(); };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [abierto, onCerrar]);

    /* Bloquea scroll del body mientras el modal está abierto */
    useEffect(() => {
        document.body.style.overflow = abierto ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [abierto]);

    /* Foco inicial al botón cancelar (acción no destructiva) */
    useEffect(() => {
        if (abierto) {
            setTimeout(() => dialogRef.current?.querySelector(".mci-btn--cancel")?.focus(), 80);
        }
    }, [abierto]);

    return { dialogRef };
}