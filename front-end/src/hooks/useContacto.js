import { useState } from "react";

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
            const res = await fetch("http://localhost:3000/contacto/contactanos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre, correo, mensaje }),
            });

            const data = await res.json();

            if (!res.ok) {
                setErrores(data.errores || {});
                return;
            }

            setExitoso(true);
            setNombre("");
            setCorreo("");
            setMensaje("");

            setTimeout(() => {
                setExitoso(false);
            }, 5000);
        } catch (error) {
            setErrores({ general: "Error de conexión. Intenta nuevamente." });
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