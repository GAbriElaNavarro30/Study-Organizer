import { useState, useEffect, useRef } from "react";
import api from "../services/api";

export function useModalNuevaEmocion({ visible, onClose, onGuardar }) {
    const [nombre, setNombre] = useState("");
    const [clasif, setClasif] = useState(null);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");
    const [exito, setExito] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        if (visible) {
            setTimeout(() => inputRef.current?.focus(), 120);
            setNombre(""); setClasif(null);
            setError(""); setExito(false); setCargando(false);
        }
    }, [visible]);

    useEffect(() => {
        const handler = (e) => { if (e.key === "Escape") onClose(); };
        if (visible) document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [visible, onClose]);

    const handleGuardar = async () => {
        const nombreTrim = nombre.trim();
        if (!nombreTrim) return setError("Escribe el nombre de la emoción.");
        if (!clasif) return setError("Selecciona una clasificación.");
        if (nombreTrim.length > 100) return setError("El nombre no puede superar 100 caracteres.");

        setError("");
        setCargando(true);

        try {
            const { data } = await api.post("/dashboard/crear-emocion", {
                nombre_emocion: nombreTrim,
                categoria: clasif,
            });

            setExito(true);
            setTimeout(() => {
                onGuardar({ label: nombreTrim, clasif, id: data.emocion?.id_emocion });
                onClose();
            }, 900);

        } catch (err) {
            const data = err.response?.data;
            setError(data?.mensaje || "Error al guardar la emoción.");
            setCargando(false);
        }
    };

    return {
        nombre, setNombre,
        clasif, setClasif,
        cargando,
        error, setError,
        exito,
        inputRef,
        handleGuardar,
    };
}