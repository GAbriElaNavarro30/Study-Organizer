import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

export function useBienvenida() {
    const { usuario, refrescarUsuario } = useContext(AuthContext);
    const [frase, setFrase] = useState("");
    const [cargandoFrase, setCargandoFrase] = useState(true);

    const obtenerTipDiario = async () => {
        try {
            const res = await api.get("/dashboard/tip-diario");
            setFrase(res.data.texto);
        } catch (error) {
            console.error("Error al obtener el tip diario:", error);
            setFrase("La organización es el primer paso hacia el éxito.");
        } finally {
            setCargandoFrase(false);
        }
    };

    useEffect(() => {
        refrescarUsuario();
        obtenerTipDiario();
        window.scrollTo(0, 0);
    }, []);

    return {
        usuario,
        frase,
        cargandoFrase,
    };
}