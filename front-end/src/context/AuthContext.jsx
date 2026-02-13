import { createContext, useState, useEffect } from "react";
import api from "../services/api";
import perfilPredeterminado from "../assets/imagenes/perfil-usuario.png";

export const AuthContext = createContext();

const esFotoValida = (foto) => {
  if (!foto) return false;

  const invalidas = [
    "null",
    "undefined",
    "/uploads/null",
    "/uploads/undefined",
  ];

  return !invalidas.some(v => foto.includes(v));
};

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  const ROLES_MAP = {
    1: "Administrador",
    2: "Estudiante",
    3: "Tutor",
  };

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const normalizarFecha = (fecha) => {
    if (!fecha) return { day: "", month: "", year: "" };

    if (
      typeof fecha === "object" &&
      "day" in fecha &&
      "month" in fecha &&
      "year" in fecha
    ) {
      return fecha;
    }

    const d = new Date(fecha);
    return {
      day: d.getDate(),
      month: d.getMonth() + 1,
      year: d.getFullYear(),
    };
  };

  const normalizarUsuario = (user) => {
    if (!user) return null;

    // DETECTAR SI LA FOTO YA ES UNA URL COMPLETA (http:// o https://)
    const esUrlCompleta = (url) => {
      if (!url) return false;
      return url.startsWith('http://') || url.startsWith('https://');
    };

    // Si la foto ya es URL completa (Cloudinary), úsala directamente
    // Si es ruta relativa (/uploads/...), construye URL completa del servidor
    // Si no es válida, usa imagen predeterminada
    const fotoPerfil = esFotoValida(user.foto_perfil)
      ? (esUrlCompleta(user.foto_perfil)
        ? user.foto_perfil  // Ya es URL completa (Cloudinary)
        : `${API_URL}${user.foto_perfil}`)  // Ruta del servidor local
      : perfilPredeterminado;  // Imagen predeterminada

    const fotoPortada = esFotoValida(user.foto_portada)
      ? (esUrlCompleta(user.foto_portada)
        ? user.foto_portada
        : `${API_URL}${user.foto_portada}`)
      : "/portada.jpg";

    return {
      ...user,
      rol: user.rol,
      rol_texto: ROLES_MAP[user.rol] || "Sin rol",
      fecha_nacimiento: normalizarFecha(user.fecha_nacimiento),
      foto_perfil: fotoPerfil,
      foto_portada: fotoPortada,
    };
  };

  // FUNCIÓN PARA RECARGAR EL USUARIO
  const refrescarUsuario = async () => {
    try {
      const res = await api.get("/usuarios/me");
      setUsuario(normalizarUsuario(res.data.usuario));
      return res.data.usuario;
    } catch (error) {
      setUsuario(null);
      throw error;
    }
  };

  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const res = await api.get("/usuarios/me");
        setUsuario(normalizarUsuario(res.data.usuario));
      } catch (error) {
        setUsuario(null);
      } finally {
        setLoading(false);
      }
    };

    verificarSesion();
  }, []);

  const logout = async () => {
    try {
      await api.post("/usuarios/logout");
    } catch (error) {
      console.error("Error logout:", error);
    } finally {
      setUsuario(null);
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        setUsuario: (user) => setUsuario(normalizarUsuario(user)),
        loading,
        logout,
        setLoading,
        refrescarUsuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}