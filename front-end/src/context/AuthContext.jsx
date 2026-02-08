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

// Normaliza el género para que siempre coincida con los radios
const normalizarGenero = (g) => {
  if (!g) return "";
  g = g.toString().toLowerCase();

  if (g === "hombre" || g === "male" || g === "m") return "Hombre";
  if (g === "mujer" || g === "female" || g === "f") return "Mujer";
  return "Otro";
};

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  const ROLES_MAP = {
    1: "Administrador",
    2: "Usuario",
    3: "Tutor",
  };

  // Normaliza la fecha a objeto { day, month, year }
  const normalizarFecha = (fecha) => {
    if (!fecha) return { day: "", month: "", year: "" };

    // ✅ SI YA VIENE COMO OBJETO {day, month, year}
    if (
      typeof fecha === "object" &&
      "day" in fecha &&
      "month" in fecha &&
      "year" in fecha
    ) {
      return fecha;
    }

    // Si viene como string o Date
    const d = new Date(fecha);
    return {
      day: d.getDate(),
      month: d.getMonth() + 1,
      year: d.getFullYear(),
    };
  };


  // NORMALIZADOR CENTRAL DEL USUARIO
  const normalizarUsuario = (user) => {
    if (!user) return null;

    return {
      ...user,
      rol: user.rol,
      rol_texto: ROLES_MAP[user.rol] || "Sin rol",
      genero: normalizarGenero(user.genero), // Género normalizado para los radios
      fecha_nacimiento: normalizarFecha(user.fecha_nacimiento),

      foto_perfil: esFotoValida(user.foto_perfil)
        ? user.foto_perfil
        : perfilPredeterminado,
      foto_portada: esFotoValida(user.foto_portada)
        ? user.foto_portada
        : "/portada.jpg",
    };
  };

  // Verificar sesión al montar
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

  // LOGOUT
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

  return (
    <AuthContext.Provider
      value={{
        usuario,
        setUsuario: (user) => setUsuario(normalizarUsuario(user)),
        loading,
        logout,
        setLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
