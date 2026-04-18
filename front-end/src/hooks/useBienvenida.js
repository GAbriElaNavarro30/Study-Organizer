import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

export function useBienvenida() {
    const { usuario, refrescarUsuario } = useContext(AuthContext);

    const [datos, setDatos] = useState([]);
    const [cargandoDashboard, setCargandoDashboard] = useState(false);
    const [mesSeleccionado, setMesSeleccionado] = useState(0);
    const [anioSeleccionado, setAnioSeleccionado] = useState(0);
    const [aniosDisponibles, setAniosDisponibles] = useState([]);

    useEffect(() => {
        refrescarUsuario();
        window.scrollTo(0, 0);
    }, []);

    // Cargar datos del dashboard solo si el usuario es admin (id_rol === 1)
    useEffect(() => {
        if (usuario?.rol === 1) {
            cargarDatos();
        }
    }, [usuario?.rol]);

    const cargarDatos = async () => {
        try {
            setCargandoDashboard(true);
            const resp = await api.get("/usuarios/registros-dashboard");
            // resp.data = [{ mes, anio, genero, rol }, ...]
            setDatos(resp.data);
            const years = [...new Set(resp.data.map((r) => r.anio))].sort();
            setAniosDisponibles(years);
        } catch (error) {
            console.error("Error al cargar dashboard:", error);
        } finally {
            setCargandoDashboard(false);
        }
    };

    return {
        usuario,
        datos,
        cargandoDashboard,
        mesSeleccionado,
        setMesSeleccionado,
        anioSeleccionado,
        setAnioSeleccionado,
        aniosDisponibles,
        cargarDatos,
    };
}