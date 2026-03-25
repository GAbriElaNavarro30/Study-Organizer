import { useState, useEffect } from "react";
import api from "../services/api";

export function useContacto() {
    const [nombre, setNombre] = useState("");
    const [correo, setCorreo] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [errores, setErrores] = useState({});
    const [enviando, setEnviando] = useState(false);
    const [exitoso, setExitoso] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEnviando(true);
        setErrores({});

        try {
            // axios resuelve directamente, no necesita .json() ni .ok
            await api.post("/contacto/contactanos", { nombre, correo, mensaje });

            setExitoso(true);
            setNombre("");
            setCorreo("");
            setMensaje("");

            setTimeout(() => setExitoso(false), 5000);

        } catch (err) {
            // axios lanza excepción en status >= 400, los errores van en err.response
            const data = err.response?.data;
            if (data?.errores) {
                setErrores(data.errores);
            } else {
                setErrores({ general: "Error de conexión. Intenta nuevamente." });
            }
        } finally {
            setEnviando(false);
        }
    };

    const handleNombreChange = (e) => {
        setNombre(e.target.value);
        setErrores(p => ({ ...p, nombre: undefined }));
    };

    const handleCorreoChange = (e) => {
        setCorreo(e.target.value);
        setErrores(p => ({ ...p, correo: undefined }));
    };

    const handleMensajeChange = (e) => {
        setMensaje(e.target.value);
        setErrores(p => ({ ...p, mensaje: undefined }));
    };

    // ─── Scroll al inicio al montar ───
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);


    return {
        nombre,
        correo,
        mensaje,
        errores,
        enviando,
        exitoso,
        handleSubmit,
        handleNombreChange,
        handleCorreoChange,
        handleMensajeChange,
    };
}