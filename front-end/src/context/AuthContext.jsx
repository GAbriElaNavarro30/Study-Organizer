import { createContext, useState, useEffect } from "react";
import api from "../services/api";
import perfilPredeterminado from "../assets/imagenes/perfil-usuario.png";

export const AuthContext = createContext();

const esFotoValida = (foto) => {
  if (!foto) return false;
  const invalidas = ["null", "undefined", "/uploads/null", "/uploads/undefined"];
  return !invalidas.some(v => foto.includes(v));
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  const ROLES_MAP = {
    1: "Administrador",
    2: "Estudiante",
    3: "Tutor",
  };

  const normalizarFecha = (fecha) => {
    if (!fecha) return { day: "", month: "", year: "" };
    if (typeof fecha === "object" && "day" in fecha && "month" in fecha && "year" in fecha) {
      return fecha;
    }
    const d = new Date(fecha);
    return { day: d.getDate(), month: d.getMonth() + 1, year: d.getFullYear() };
  };

  const normalizarUsuario = (user) => {
    if (!user) return null;

    const esUrlCompleta = (url) => {
      if (!url) return false;
      return url.startsWith('http://') || url.startsWith('https://');
    };

    const fotoPerfil = esFotoValida(user.foto_perfil)
      ? (esUrlCompleta(user.foto_perfil) ? user.foto_perfil : `${API_URL}${user.foto_perfil}`)
      : perfilPredeterminado;

    const fotoPortada = esFotoValida(user.foto_portada)
      ? (esUrlCompleta(user.foto_portada) ? user.foto_portada : `${API_URL}${user.foto_portada}`)
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
        // 401 es esperado cuando no hay sesión activa
        if (error.response?.status !== 401) {
          console.error("Error al verificar sesión:", error);
        }
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

  if (loading) return null;

  return (
    <AuthContext.Provider value={{
      usuario,
      setUsuario: (user) => setUsuario(normalizarUsuario(user)),
      loading,
      logout,
      setLoading,
      refrescarUsuario,
    }}>
      {children}
    </AuthContext.Provider>
  );
}